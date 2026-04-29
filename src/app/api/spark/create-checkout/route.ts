import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase/server-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mustEnv(name: string) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function safeSiteUrl() {
  const base = mustEnv("NEXT_PUBLIC_SITE_URL");
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function getSparkEndpoint() {
  const raw = mustEnv("SPARK_BASE_URL");

  if (raw.includes("orderData.faces") || raw.includes("?")) {
    return raw;
  }

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

function findCheckoutUrl(data: any) {
  return (
    data?.checkoutUrl ||
    data?.checkout_url ||
    data?.paymentUrl ||
    data?.payment_url ||
    data?.redirectUrl ||
    data?.redirect_url ||
    data?.url ||
    data?.data?.checkoutUrl ||
    data?.data?.checkout_url ||
    data?.data?.paymentUrl ||
    data?.data?.payment_url ||
    data?.data?.redirectUrl ||
    data?.data?.redirect_url ||
    data?.data?.url ||
    null
  );
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

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .select("id,order_no,user_id,total_mur,public_token,payment_status,status")
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr) throw orderErr;

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

    if (
      String(order.payment_status).toUpperCase() === "PAID" ||
      String(order.status).toUpperCase() === "PAID"
    ) {
      return NextResponse.json({ error: "Order already paid" }, { status: 409 });
    }

    const merchantTransactionId = `MK-${crypto.randomUUID()}`;

    const successUrl = `${SITE}/checkout/success?t=${encodeURIComponent(
      order.public_token
    )}`;

    const failureUrl = `${SITE}/checkout/success?t=${encodeURIComponent(
      order.public_token
    )}`;

    const webhookUrl = `${SITE}/api/spark/webhook`;

    const payload = {
      storeId: SPARK_STORE_ID,
      merchantTransactionId,
      transactionOrigin: "ECOM",
      transactionType: "SALE",
      transactionAmount: {
        total: Number(order.total_mur),
        currency: "MUR",
      },
      checkoutSettings: {
        locale: "en_GB",
        preSelectedPaymentMethod: "Cards",
        webHooksUrl: webhookUrl,
        redirectBackUrls: {
          successUrl,
          failureUrl,
        },
      },
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
      console.error("SPARK FAILED:", {
        endpoint: SPARK_ENDPOINT,
        status: resp.status,
        request: payload,
        response: sparkData ?? rawText,
      });

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
            sparkData?.errorMessage ||
            rawText ||
            resp.statusText,
        },
        { status: 502 }
      );
    }

    const checkoutUrl = findCheckoutUrl(sparkData);

    if (!checkoutUrl) {
      console.error("SPARK MISSING CHECKOUT URL:", {
        endpoint: SPARK_ENDPOINT,
        status: resp.status,
        request: payload,
        response: sparkData ?? rawText,
      });

      await supabaseAdmin.from("payment_events").insert({
        provider: "SPARK",
        merchant_transaction_id: merchantTransactionId,
        event_type: "CREATE_CHECKOUT",
        event_status: "ERROR",
        payload: {
          request: payload,
          response: sparkData ?? rawText,
          http: resp.status,
          reason: "Missing checkout URL",
        },
      });

      return NextResponse.json(
        {
          error: "Missing checkoutUrl from Spark",
          details: (sparkData ?? rawText) || "Spark did not return a checkout URL.",
        },
        { status: 502 }
      );
    }

    const { error: sessionErr } = await supabaseAdmin
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

    if (sessionErr) throw sessionErr;

    const { error: updateErr } = await supabaseAdmin
      .from("orders")
      .update({
        payment_method: "SPARK",
        payment_status: "PENDING",
        status: "PENDING",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateErr) throw updateErr;

    await supabaseAdmin.from("payment_events").insert({
      provider: "SPARK",
      merchant_transaction_id: merchantTransactionId,
      event_type: "CREATE_CHECKOUT",
      event_status: "PENDING",
      payload: {
        request: payload,
        response: sparkData ?? rawText,
      },
    });

    return NextResponse.json({
      ok: true,
      checkoutUrl,
      merchantTransactionId,
    });
  } catch (error: any) {
    console.error("spark/create-checkout error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Spark checkout failed",
      },
      { status: 500 }
    );
  }
}