import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // ✅ Centralized admin validation
    const admin = await requireAdmin(req);
    if (!admin.ok) {
      return NextResponse.json({ error: admin.error }, { status: 401 });
    }

    const body = await req.json();

    const payload = {
      title: String(body.title || "").trim(),
      slug: String(body.slug || "").trim(),
      sku: body.sku ?? null,
      barcode: body.barcode ?? null,
      base_price_mur: Number(body.base_price_mur ?? 0),
      compare_at_price_mur: Number(body.compare_at_price_mur ?? 0),
      is_active: Boolean(body.is_active ?? true),
      is_featured: Boolean(body.is_featured ?? false),
      is_best_seller: Boolean(body.is_best_seller ?? false),
      sort_order: Number(body.sort_order ?? 0),
      short_description: body.short_description ?? null,
      description: body.description ?? null,
      seo_title: body.seo_title ?? null,
      seo_description: body.seo_description ?? null,
    };

    if (!payload.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!payload.slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const { data: product, error } = await supabaseServer
    .from("products")
    .insert(payload)
    .select("id,title,slug,is_active,is_featured,is_best_seller,created_at")
    .single();

    if (error) throw error;

    return NextResponse.json({ product });
  } catch (e: any) {
    console.error("products/create error:", e);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}