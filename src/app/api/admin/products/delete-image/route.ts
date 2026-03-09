import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

function deriveStoragePathFromPublicUrl(imageUrl: string, bucket: string) {
  const url = (imageUrl || "").trim();
  if (!url) return null;

  // Typical public URL:
  // https://<project>.supabase.co/storage/v1/object/public/products/products/<id>/<file>.jpg
  // (bucket=products) => path starts after `/public/products/`
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;

  const path = url.slice(idx + marker.length);
  // Strip query params if any
  return path.split("?")[0] || null;
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // 1) Read row first to know what to delete in storage
    const { data: row, error: readErr } = await supabaseServer
      .from("product_images")
      .select("id, product_id, image_url, storage_bucket, storage_path, is_primary")
      .eq("id", id)
      .maybeSingle();

    if (readErr) throw readErr;
    if (!row) return NextResponse.json({ error: "Image not found" }, { status: 404 });

    const bucket = (row.storage_bucket || "products").trim() || "products";
    const storagePath =
      (row.storage_path || "").trim() ||
      deriveStoragePathFromPublicUrl(row.image_url || "", bucket);

    // 2) Delete from storage (best effort)
    // If storagePath is missing, we still delete DB row.
    if (storagePath) {
      const { error: storageErr } = await supabaseServer.storage.from(bucket).remove([storagePath]);
      // If the file is already missing, you can choose to ignore error or throw.
      // I recommend: ignore "not found" style issues, throw for others.
      if (storageErr) {
        console.warn("delete-image: storage remove error:", storageErr);
        // Don't block DB cleanup, but you can flip this to: throw storageErr;
      }
    }

    // 3) Delete DB row
    const { error: delErr } = await supabaseServer.from("product_images").delete().eq("id", id);
    if (delErr) throw delErr;

    // 4) If the deleted image was primary, optionally promote another image as primary
    // (Optional premium behavior)
    if (row.is_primary && row.product_id) {
      const { data: nextImg, error: nextErr } = await supabaseServer
        .from("product_images")
        .select("id")
        .eq("product_id", row.product_id)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!nextErr && nextImg?.id) {
        await supabaseServer.from("product_images").update({ is_primary: true }).eq("id", nextImg.id);
      }
    }

    return NextResponse.json({
      ok: true,
      deleted: { id: row.id, storage_bucket: bucket, storage_path: storagePath || null },
    });
  } catch (err: any) {
    console.error("admin/products/delete-image error:", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}