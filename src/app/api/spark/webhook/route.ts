import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { sendOrderEmail } from "@/lib/email/resend";
import { paymentConfirmedHtml } from "@/lib/email/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WEBHOOK_SECRET =
  process.env.SPARK_WEBHOOK_SECRET?.trim() ||
  process.env.SPARK_SECRET_KEY?.trim() ||
  "";

function safeEqual(a: Buffer, b: Buffer) {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function verifySignature(rawBody: Buffer, signatureHeader: string | null) {
  if (!WEBHOOK_SECRET) return true; // allow UAT if Spark does not send signatures yet
  if (!signatureHeader) return true; // allow UAT webhook testing

  const sig = signatureHeader.startsWith("sha256=")
    ? signatureHeader.slice("sha256=".length)
    : signatureHeader;

  if (!/^[0-9a-fA-F]+$/.test(sig)) return false;

  const expectedHex = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return safeEqual(Buffer.from(expectedHex, "hex"), Buffer.from(sig, "hex"));
}

function pickStatus(payload: any) {
  return (
    payload?.status ||
    payload?.transactionStatus ||
    payload?.paymentStatus ||
    payload?.transaction?.status ||
    payload?.data?.status ||
    payload?.data?.transactionStatus ||
    ""
  );
}

function pickMerchantTransactionId(payload: any) {
  return (
    payload?.merchantTransactionId ||
    payload?.merchant_transaction_id ||
    payload?.transaction?.merchantTransactionId ||
    payload?.data?.merchantTransactionId ||
    ""
  );
}

function pickTransactionId(payload: any) {
  return (
    payload?.transactionId ||
    payload?.transaction_id ||
    payload?.ipgTransactionId ||
    payload?.transaction?.id ||
    payload?.data?.transactionId ||
    payload?.id ||
    null
  );
}

function mapSparkStatusToPayment(status: string) {
  const s = String(status || "").toUpperCase();

  if (
    ["SUCCESS", "SUCCEEDED", "APPROVED", "AUTHORISED", "AUTHORIZED", "PAID", "SALE"].includes(s)
  ) {
    return "PAID";
  }

  if (
    ["FAILED", "ERROR", "DECLINED", "CANCELLED", "CANCELED", "REJECTED"].includes(s)
  ) {
    return "FAILED";
  }

  return "PENDING";
}

export async function POST(req: Request) {
  try {
    const raw = Buffer.from(await req.arrayBuffer());
    const signature =
      req.headers.get("x-signature") ||
      req.headers.get("x-spark-signature") ||
      req.headers.get("signature");

    if (!verifySignature(raw, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: any;

    try {
      payload = JSON.parse(raw.toString("utf8"));
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const merchantTransactionId = pickMerchantTransactionId(payload);
    const rawStatus = pickStatus(payload);
    const transactionId = pickTransactionId(payload);

    if (!merchantTransactionId) {
      console.error("Spark webhook missing merchantTransactionId:", payload);
      return NextResponse.json(
        { error: "Missing merchantTransactionId" },
        { status: 400 }
      );
    }

    const paymentStatus = mapSparkStatusToPayment(rawStatus);

    await supabaseAdmin.from("payment_events").insert({
      provider: "SPARK",
      merchant_transaction_id: merchantTransactionId,
      event_type: "WEBHOOK",
      event_status: String(rawStatus || paymentStatus),
      payload,
    });

    const { data: session, error: sessionErr } = await supabaseAdmin
      .from("payment_sessions")
      .select("id,order_id")
      .eq("merchant_transaction_id", merchantTransactionId)
      .maybeSingle();

    if (sessionErr) throw sessionErr;

    if (!session?.id || !session?.order_id) {
      return NextResponse.json({
        ok: true,
        recorded: true,
        session: "missing",
      });
    }

    const now = new Date().toISOString();

    const { error: paymentSessionErr } = await supabaseAdmin
      .from("payment_sessions")
      .update({
        status: paymentStatus,
        raw_response: payload,
        updated_at: now,
      })
      .eq("id", session.id);

    if (paymentSessionErr) throw paymentSessionErr;

    if (paymentStatus === "PAID") {
      const { error: orderUpdateErr } = await supabaseAdmin
        .from("orders")
        .update({
          status: "PAID",
          payment_method: "SPARK",
          payment_status: "PAID",
          paid_at: now,
          provider_transaction_id: transactionId,
          updated_at: now,
        })
        .eq("id", session.order_id);

      if (orderUpdateErr) throw orderUpdateErr;

      const { data: order, error: orderErr } = await supabaseAdmin
        .from("orders")
        .select("order_no,email,total_mur")
        .eq("id", session.order_id)
        .maybeSingle();

      if (orderErr) throw orderErr;

      if (order?.email) {
        await sendOrderEmail({
          to: order.email,
          subject: `Payment confirmed — ${order.order_no}`,
          html: paymentConfirmedHtml({
            orderNo: order.order_no,
            totalMur: order.total_mur,
          }),
        });
      }
    } else if (paymentStatus === "FAILED") {
      await supabaseAdmin
        .from("orders")
        .update({
          status: "FAILED",
          payment_method: "SPARK",
          payment_status: "FAILED",
          provider_transaction_id: transactionId,
          updated_at: now,
        })
        .eq("id", session.order_id);
    } else {
      await supabaseAdmin
        .from("orders")
        .update({
          status: "PENDING",
          payment_method: "SPARK",
          payment_status: "PENDING",
          provider_transaction_id: transactionId,
          updated_at: now,
        })
        .eq("id", session.order_id);
    }

    return NextResponse.json({ ok: true, received: true });
  } catch (err: any) {
    console.error("Spark webhook error:", err);
    return NextResponse.json(
      { error: err?.message || "Webhook error" },
      { status: 500 }
    );
  }
}