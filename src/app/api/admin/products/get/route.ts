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

    const { data: product, error: pErr } = await supabaseServer
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (pErr) throw pErr;

    const { data: images, error: iErr } = await supabaseServer
      .from("product_images")
      .select("id,product_id,image_url,alt,sort_order,is_primary,created_at")
      .eq("product_id", id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (iErr) throw iErr;

    return NextResponse.json({ product, images: images ?? [] });
  } catch (err: any) {
    console.error("admin/products/get error:", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}