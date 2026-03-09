import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: 401 });

    const { id, patch } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const p = patch || {};

    // allow-list fields (safe)
    const update: Record<string, any> = {};
    if ("alt" in p) update.alt = p.alt ?? null;
    if ("sort_order" in p) update.sort_order = Number(p.sort_order ?? 0);

    if (!Object.keys(update).length) {
      return NextResponse.json({ error: "No valid patch fields" }, { status: 400 });
    }

    const { data, error } = await supabaseServer
      .from("product_images")
      .update(update)
      .eq("id", id)
      .select("id,product_id,image_url,alt,sort_order,is_primary,created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, image: data });
  } catch (err: any) {
    console.error("admin/products/update-image error:", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}