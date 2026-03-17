import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status }
      );
    }

    const url = new URL(req.url);
    const productId = url.searchParams.get("product_id");

    if (!productId) {
      return NextResponse.json(
        { error: "Missing product_id" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("product_variants")
      .select(
        "id,product_id,options_json,sku,price_mur,compare_at_price_mur,stock_qty,is_active,created_at,updated_at"
      )
      .eq("product_id", productId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ items: data ?? [] });
  } catch (err: any) {
    console.error("admin/variants/list error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed" },
      { status: 500 }
    );
  }
}

