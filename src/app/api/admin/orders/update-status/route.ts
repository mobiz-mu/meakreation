import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

const ALLOWED = new Set([
  "PENDING",
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
]);

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) { return NextResponse.json({ error: admin.error }, { status: admin.status }); }

    const { order_id, status } = await req.json();
    if (!order_id || !status) return NextResponse.json({ error: "Missing order_id/status" }, { status: 400 });
    if (!ALLOWED.has(String(status))) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ status })
      .eq("id", order_id)
      .select("id,order_no,status,updated_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, order: data });
  } catch (err: any) {
    console.error("admin/orders/update-status error:", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

