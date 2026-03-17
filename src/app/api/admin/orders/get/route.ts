import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) { return NextResponse.json({ error: admin.error }, { status: admin.status }); }

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (oErr) throw oErr;

    const { data: items, error: iErr } = await supabaseAdmin
      .from("order_items")
      .select("id,title,variant_label,sku,unit_price_mur,qty,line_total_mur,image_url")
      .eq("order_id", id)
      .order("created_at", { ascending: true });

    if (iErr) throw iErr;

    return NextResponse.json({ order, items: items ?? [] });
  } catch (err: any) {
    console.error("admin/orders/get error:", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

