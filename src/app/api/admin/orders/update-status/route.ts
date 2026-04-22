
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const runtime = "nodejs";

const ALLOWED_ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
  "PAID",
] as const;

const ALLOWED_PAYMENT_STATUSES = [
  "PENDING",
  "AWAITING_CONFIRMATION",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

const ALLOWED_PAYMENT_METHODS = [
  "COD",
  "JUICE",
  "BANK_TRANSFER",
  "SPARK",
] as const;

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status }
      );
    }

    const body = await req.json();

    const id = String(body.id || "").trim();
    const status = body.status ? String(body.status).toUpperCase() : undefined;
    const payment_status = body.payment_status
      ? String(body.payment_status).toUpperCase()
      : undefined;
    const payment_method = body.payment_method
      ? String(body.payment_method).toUpperCase()
      : undefined;
    const provider_transaction_id = body.provider_transaction_id ?? undefined;

    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }

    if (
      status &&
      !ALLOWED_ORDER_STATUSES.includes(
        status as (typeof ALLOWED_ORDER_STATUSES)[number]
      )
    ) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    }

    if (
      payment_status &&
      !ALLOWED_PAYMENT_STATUSES.includes(
        payment_status as (typeof ALLOWED_PAYMENT_STATUSES)[number]
      )
    ) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 }
      );
    }

    if (
      payment_method &&
      !ALLOWED_PAYMENT_METHODS.includes(
        payment_method as (typeof ALLOWED_PAYMENT_METHODS)[number]
      )
    ) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("orders")
      .select("id,status,payment_status,payment_method,paid_at")
      .eq("id", id)
      .maybeSingle();

    if (existingErr) throw existingErr;
    if (!existing?.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) patch.status = status;
    if (payment_status) patch.payment_status = payment_status;
    if (payment_method) patch.payment_method = payment_method;
    if (provider_transaction_id !== undefined) {
      patch.provider_transaction_id = provider_transaction_id || null;
    }

    const finalPaymentStatus = payment_status || existing.payment_status;
    const finalOrderStatus = status || existing.status;

    if (
      finalPaymentStatus === "PAID" &&
      !existing.paid_at
    ) {
      patch.paid_at = new Date().toISOString();
    }

    if (
      finalPaymentStatus === "FAILED" &&
      !status
    ) {
      patch.status = "FAILED";
    }

    if (
      finalPaymentStatus === "PAID" &&
      (finalOrderStatus === "PENDING" || finalOrderStatus === "PAID")
    ) {
      patch.status = "PROCESSING";
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, order: data });
  } catch (err: any) {
    console.error("admin/orders/update-status error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed" },
      { status: 500 }
    );
  }
}