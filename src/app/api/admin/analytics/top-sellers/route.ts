import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: 401 });

    const { data: topProducts, error: pErr } = await supabaseServer
      .from("v_admin_top_products")
      .select("product_id,title,orders_count,units_sold,revenue_mur")
      .limit(20);

    if (pErr) throw pErr;

    const { data: topCategories, error: cErr } = await supabaseServer
      .from("v_admin_top_categories")
      .select("category_id,category_name,orders_count,units_sold,revenue_mur")
      .limit(20);

    if (cErr) throw cErr;

    return NextResponse.json({ topProducts: topProducts ?? [], topCategories: topCategories ?? [] });
  } catch (err: any) {
    console.error("admin/analytics/top-sellers error:", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}