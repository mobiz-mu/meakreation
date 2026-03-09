import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: 401 });

    const { id, patch } = await req.json();
    if (!id || !patch) return NextResponse.json({ error: "Missing id/patch" }, { status: 400 });

    const allowedKeys = [
      "title",
      "slug",
      "description",
      "short_description",
      "category_id",
      "base_price_mur",
      "compare_at_price_mur",
      "sku",
      "barcode",
      "is_active",
      "is_featured",
      "is_best_seller",
      "sort_order",
      "seo_title",
      "seo_description",
    ];

    const safePatch: any = {};
    for (const k of allowedKeys) {
      if (k in patch) safePatch[k] = patch[k];
    }

    const { data, error } = await supabaseServer
      .from("products")
      .update(safePatch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, product: data });
  } catch (err: any) {
    console.error("admin/products/update error:", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}