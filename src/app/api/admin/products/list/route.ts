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
    const q = (url.searchParams.get("q") || "").trim();
    const limit = Math.min(Number(url.searchParams.get("limit") || 50), 200);

    let query = supabaseAdmin
      .from("products")
      .select(
        "id,title,slug,base_price_mur,is_active,is_featured,is_best_seller,sort_order,created_at"
      )
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (q) {
      const safe = q.replace(/,/g, "");
      query = query.or(
        `title.ilike.%${safe}%,slug.ilike.%${safe}%,sku.ilike.%${safe}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ items: data ?? [] });
  } catch (err: any) {
    console.error("admin/products/list error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed" },
      { status: 500 }
    );
  }
}

