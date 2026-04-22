import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/server-admin";

export const runtime = "nodejs";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function safeSiteUrl() {
  const base = mustEnv("NEXT_PUBLIC_SITE_URL");
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function getSparkEndpoint() {
  const raw = mustEnv("SPARK_BASE_URL").trim();

  // If user already stored full endpoint, use it directly
  if (raw.includes("orderData.faces") || raw.includes("?")) {
    return raw;
  }

  // Otherwise assume base URL and append /checkout
  return raw.endsWith("/") ? `${raw}checkout` : `${raw}/checkout`;
}

async function getAuthedUserId(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user?.id) return null;
  return data.user.id;
}

async function parseResponseSafe(resp: Response) {
  const text = await resp.text();

  if (!text) {
    return { rawText: "", data: null };
  }

  try {
    return { rawText: text, data: JSON.parse(text) };
  } catch {
    return { rawText: text, data: null };
  }
}

export async function POST(req: Request) {
  try {
    const SPARK_ENDPOINT = getSparkEndpoint();
    const SPARK_STORE_ID = mustEnv("SPARK_STORE_ID");
    const SPARK_API_KEY = mustEnv("SPARK_API_KEY");
    const SITE = safeSiteUrl();

    const body = await req.json();

    const orderId: string = body?.orderId;
    const publicToken: string | null = body?.publicToken ?? null;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const authedUserId = await getAuthedUserId(req);

    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .select("id,order_no,user_id,total_mur,public_token,payment_status,status")
      .eq("id", orderId)
      .maybeSingle();

    if (oErr) throw oErr;
    if (!order?.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isOwner =
      authedUserId && order.user_id && authedUserId === order.user_id;
    const isGuestAllowed =
      !order.user_id && publicToken && publicToken === order.public_token;

    if (!isOwner && !isGuestAllowed) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    if (order.payment_status === "PAID" || order.status === "PAID") {
      return NextResponse.json({ error: "Order already paid" }, { status: 409 });
    }

    const merchantTransactionId = `MK-${crypto.randomUUID()}`;

    // Match your current storefront routes
    const successUrl = `${SITE}/checkout/success?t=${encodeURIComponent(
      order.public_token
    )}`;
    const cancelUrl = `${SITE}/checkout/success?t=${encodeURIComponent(
      order.public_token
    )}`;
    const webhookUrl = `${SITE}/api/spark/webhook`;

    const payload = {
      merchantTransactionId,
      storeId: SPARK_STORE_ID,
      amount: Number(order.total_mur),
      currency: "MUR",
      returnUrl: successUrl,
      cancelUrl,
      webhookUrl,
    };

    const resp = await fetch(SPARK_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SPARK_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const parsed = await parseResponseSafe(resp);
    const sparkData = parsed.data;
    const rawText = parsed.rawText;

    if (!resp.ok) {
      await supabaseAdmin.from("payment_events").insert({
        provider: "SPARK",
        merchant_transaction_id: merchantTransactionId,
        event_type: "CREATE_CHECKOUT",
        event_status: "ERROR",
        payload: {
          request: payload,
          response: sparkData ?? rawText,
          http: resp.status,
        },
      });

      return NextResponse.json(
        {
          error: "Spark checkout failed",
          details:
            sparkData?.message ||
            sparkData?.error ||
            rawText ||
            resp.statusText,
        },
        { status: 502 }
      );
    }

    const checkoutUrl =
      sparkData?.checkoutUrl || sparkData?.checkout_url || sparkData?.url;

    if (!checkoutUrl) {
      return NextResponse.json(
        {
          error: "Missing checkoutUrl from Spark",
          details: rawText || "Spark did not return a checkout URL.",
        },
        { status: 502 }
      );
    }

    const { error: psErr } = await supabaseAdmin
      .from("payment_sessions")
      .upsert(
        {
          order_id: orderId,
          provider: "SPARK",
          merchant_transaction_id: merchantTransactionId,
          store_id: SPARK_STORE_ID,
          amount_mur: Number(order.total_mur),
          currency: "MUR",
          checkout_url: checkoutUrl,
          status: "PENDING",
          raw_request: payload,
          raw_response: sparkData ?? rawText,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "order_id,provider" }
      );

    if (psErr) throw psErr;

    const { error: updErr } = await supabaseAdmin
      .from("orders")
      .update({
        payment_method: "SPARK",
        payment_status: "PENDING",
        status: "PENDING",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updErr) throw updErr;

    await supabaseAdmin.from("payment_events").insert({
      provider: "SPARK",
      merchant_transaction_id: merchantTransactionId,
      event_type: "CREATE_CHECKOUT",
      event_status: "PENDING",
      payload: { request: payload, response: sparkData ?? rawText },
    });

    return NextResponse.json({
      ok: true,
      checkoutUrl,
      merchantTransactionId,
    });
  } catch (error: any) {
    console.error("spark/create-checkout error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed" },
      { status: 500 }
    );
  }
}