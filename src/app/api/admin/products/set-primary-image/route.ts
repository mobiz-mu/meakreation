import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: 401 });

    const { product_id, image_id } = await req.json();

    if (!product_id || !image_id) {
      return NextResponse.json({ error: "Missing product_id/image_id" }, { status: 400 });
    }

    // Ensure the image belongs to the product
    const { data: img, error: imgErr } = await supabaseServer
      .from("product_images")
      .select("id, product_id")
      .eq("id", image_id)
      .maybeSingle();

    if (imgErr) throw imgErr;
    if (!img) return NextResponse.json({ error: "Image not found" }, { status: 404 });
    if (img.product_id !== product_id) {
      return NextResponse.json({ error: "Image does not belong to product" }, { status: 400 });
    }

    // Clear existing primary
    const { error: clearErr } = await supabaseServer
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", product_id);

    if (clearErr) throw clearErr;

    // Set new primary
    const { data, error } = await supabaseServer
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", image_id)
      .select("id,product_id,image_url,alt,sort_order,is_primary,created_at")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, image: data });
  } catch (err: any) {
    console.error("admin/products/set-primary-image error:", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}