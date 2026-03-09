import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: 401 });

    const url = new URL(req.url);
    const product_id = url.searchParams.get("product_id");
    if (!product_id) return NextResponse.json({ error: "Missing product_id" }, { status: 400 });

    const { data, error } = await supabaseServer
      .from("product_variants")
      .select("id,product_id,options_json,options_key,sku,price_mur,compare_at_price_mur,stock_qty,is_active,created_at,updated_at")
      .eq("product_id", product_id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ items: data ?? [] });
  } catch (err: any) {
    console.error("admin/variants/list error:", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}