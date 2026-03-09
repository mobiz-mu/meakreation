import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServer } from "@/lib/supabase/server";
import { sendOrderEmail } from "@/lib/email/resend";
import { paymentConfirmedHtml } from "@/lib/email/templates";

export const runtime = "nodejs";

const WEBHOOK_SECRET = process.env.SPARK_WEBHOOK_SECRET;

function safeEqual(a: Buffer, b: Buffer) {
  // timingSafeEqual throws if lengths differ
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Accepts signature header formats:
 * - hex string
 * - "sha256=<hex>"
 */
function verifySignature(rawBody: Buffer, signatureHeader: string | null) {
  if (!WEBHOOK_SECRET) return false;
  if (!signatureHeader) return false;

  const sig = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice("sha256=".length)
    : signatureHeader;

  // only hex signatures supported in this implementation
  if (!/^[0-9a-fA-F]+$/.test(sig)) return false;

  const expectedHex = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expectedHex, "hex");
  const providedBuf = Buffer.from(sig, "hex");

  return safeEqual(expectedBuf, providedBuf);
}

function mapSparkStatusToPayment(status: string) {
  const s = String(status || "").toUpperCase();
  if (s === "SUCCESS" || s === "SUCCEEDED" || s === "PAID") return "PAID";
  if (s === "FAILED" || s === "ERROR" || s === "DECLINED") return "FAILED";
  if (s === "PENDING" || s === "PROCESSING") return "PENDING";
  return "PENDING";
}

export async function POST(req: Request) {
  try {
    // IMPORTANT: use raw bytes (not string) for signature verification
    const raw = Buffer.from(await req.arrayBuffer());
    const signature = req.headers.get("x-signature");

    if (!verifySignature(raw, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse JSON safely
    let payload: any;
    try {
      payload = JSON.parse(raw.toString("utf8"));
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const merchantTransactionId = payload?.merchantTransactionId || payload?.merchant_transaction_id;
    const status = payload?.status;
    const transactionId = payload?.transactionId || payload?.transaction_id || payload?.id;

    if (!merchantTransactionId || !status) {
      return NextResponse.json({ error: "Missing merchantTransactionId/status" }, { status: 400 });
    }

    const paymentStatus = mapSparkStatusToPayment(status);

    // 1) Idempotent event log (DB unique index protects duplicates)
    // If duplicate, ignore cleanly.
    const evInsert = await supabaseServer.from("payment_events").insert({
      provider: "SPARK",
      merchant_transaction_id: merchantTransactionId,
      event_type: "WEBHOOK",
      event_status: String(status),
      payload,
    });

    if (evInsert.error) {
      // 23505 = unique_violation (already processed)
      if ((evInsert.error as any).code !== "23505") {
        throw evInsert.error;
      }
      // already processed this exact event, return ok
      return NextResponse.json({ ok: true, deduped: true });
    }

    // 2) Find payment session
    const { data: session, error: sErr } = await supabaseServer
      .from("payment_sessions")
      .select("id, order_id, status, merchant_transaction_id")
      .eq("merchant_transaction_id", merchantTransactionId)
      .maybeSingle();

    if (sErr) throw sErr;

    // If no session, still return ok (event recorded)
    if (!session?.id || !session?.order_id) {
      return NextResponse.json({ ok: true, recorded: true, session: "missing" });
    }

    // 3) Update payment session state
    const { error: psErr } = await supabaseServer
      .from("payment_sessions")
      .update({
        status: paymentStatus,
        raw_response: payload, // keep latest
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    if (psErr) throw psErr;

    // 4) Update order (only on success/fail; keep pending otherwise)
    if (paymentStatus === "PAID") {
      const { error: oErr } = await supabaseServer
        .from("orders")
        .update({
          status: "PAID", // or "PROCESSING" if you want paid but not fulfilled; your choice
          payment_method: "SPARK",
          payment_status: "PAID",
          paid_at: new Date().toISOString(),
          provider_transaction_id: transactionId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.order_id);

      if (oErr) throw oErr;

      // 5) Send email confirmation (after order is updated)
      const { data: order, error: ordErr } = await supabaseServer
        .from("orders")
        .select("order_no,email,total_mur")
        .eq("id", session.order_id)
        .maybeSingle();

      if (ordErr) throw ordErr;

      if (order?.email) {
        await sendOrderEmail({
          to: order.email,
          subject: `Paiement confirmé — ${order.order_no}`,
          html: paymentConfirmedHtml({
            orderNo: order.order_no,
            totalMur: order.total_mur,
          }),
        });
      }
    } else if (paymentStatus === "FAILED") {
      await supabaseServer
        .from("orders")
        .update({
          payment_method: "SPARK",
          payment_status: "FAILED",
          status: "FAILED",
          provider_transaction_id: transactionId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.order_id);
    } else {
      // pending → optional: mark order as PENDING_PAYMENT
      await supabaseServer
        .from("orders")
        .update({
          payment_method: "SPARK",
          payment_status: "PENDING",
          status: "PENDING",
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.order_id);
    }

    return NextResponse.json({ ok: true, received: true });
  } catch (err: any) {
    console.error("Spark webhook error:", err);
    return NextResponse.json({ error: err?.message || "Webhook error" }, { status: 500 });
  }
}