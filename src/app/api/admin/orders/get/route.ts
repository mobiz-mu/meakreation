import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: 401 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { data: order, error: oErr } = await supabaseServer
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (oErr) throw oErr;

    const { data: items, error: iErr } = await supabaseServer
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