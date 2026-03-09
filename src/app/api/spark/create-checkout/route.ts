import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function safeSiteUrl() {
  const base = mustEnv("NEXT_PUBLIC_SITE_URL");
  // Remove trailing slash
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

async function getAuthedUserId(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;

  const { data, error } = await supabaseServer.auth.getUser(token);
  if (error || !data?.user?.id) return null;
  return data.user.id;
}

export async function POST(req: Request) {
  try {
    const SPARK_BASE_URL = mustEnv("SPARK_BASE_URL");
    const SPARK_STORE_ID = mustEnv("SPARK_STORE_ID");
    const SPARK_API_KEY = mustEnv("SPARK_API_KEY");
    const SITE = safeSiteUrl();

    const body = await req.json();

    // You can pay by:
    // - logged-in ownership: order.user_id === auth.uid()
    // - guest: provide public_token (uuid) that matches order.public_token
    const orderId: string = body?.orderId;
    const publicToken: string | null = body?.publicToken ?? null;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const authedUserId = await getAuthedUserId(req);

    // Fetch only what we need
    const { data: order, error: oErr } = await supabaseServer
      .from("orders")
      .select("id,order_no,user_id,total_mur,public_token,payment_status,status")
      .eq("id", orderId)
      .maybeSingle();

    if (oErr) throw oErr;
    if (!order?.id) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Ownership / access check
    const isOwner = authedUserId && order.user_id && authedUserId === order.user_id;
    const isGuestAllowed = !order.user_id && publicToken && publicToken === order.public_token;

    if (!isOwner && !isGuestAllowed) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    // Prevent creating new checkout if already paid
    if (order.payment_status === "PAID" || order.status === "PAID") {
      return NextResponse.json({ error: "Order already paid" }, { status: 409 });
    }

    // Strong unique merchant tx id
    const merchantTransactionId = `MK-${crypto.randomUUID()}`;

    const successUrl = `${SITE}/order-success?t=${encodeURIComponent(order.public_token)}`;
    const cancelUrl = `${SITE}/order-failed?t=${encodeURIComponent(order.public_token)}`;
    const webhookUrl = `${SITE}/api/spark/webhook`;

    const payload = {
      merchantTransactionId,
      storeId: SPARK_STORE_ID,
      amount: Number(order.total_mur),
      currency: "MUR",
      returnUrl: successUrl,
      cancelUrl: cancelUrl,
      webhookUrl,
    };

    // Call Spark
    const resp = await fetch(`${SPARK_BASE_URL}/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SPARK_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const sparkData = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      // Log response for debugging, but don't leak provider secrets
      await supabaseServer.from("payment_events").insert({
        provider: "SPARK",
        merchant_transaction_id: merchantTransactionId,
        event_type: "CREATE_CHECKOUT",
        event_status: "ERROR",
        payload: { request: payload, response: sparkData, http: resp.status },
      });

      return NextResponse.json(
        { error: "Spark checkout failed", details: sparkData?.message || sparkData?.error || resp.statusText },
        { status: 502 }
      );
    }

    const checkoutUrl = sparkData?.checkoutUrl || sparkData?.checkout_url || sparkData?.url;
    if (!checkoutUrl) {
      return NextResponse.json({ error: "Missing checkoutUrl from Spark" }, { status: 502 });
    }

    // Persist session (idempotent per order/provider)
    // With unique index (order_id, provider), repeated calls overwrite the session row.
    const { error: psErr } = await supabaseServer
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
          raw_response: sparkData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "order_id,provider" }
      );

    if (psErr) throw psErr;

    // Mark order pending payment (keep fulfillment separate)
    const { error: updErr } = await supabaseServer
      .from("orders")
      .update({
        payment_method: "SPARK",
        payment_status: "PENDING",
        status: "PENDING",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updErr) throw updErr;

    // Record create event
    await supabaseServer.from("payment_events").insert({
      provider: "SPARK",
      merchant_transaction_id: merchantTransactionId,
      event_type: "CREATE_CHECKOUT",
      event_status: "PENDING",
      payload: { request: payload, response: sparkData },
    });

    return NextResponse.json({
      ok: true,
      checkoutUrl,
      merchantTransactionId,
    });
  } catch (error: any) {
    console.error("spark/create-checkout error:", error);
    return NextResponse.json({ error: error?.message || "Failed" }, { status: 500 });
  }
}