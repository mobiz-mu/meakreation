import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return NextResponse.json({ error: admin.error }, { status: 401 });
    }

    const {
      product_id,
      image_url,
      alt,
      is_primary,
      storage_bucket,
      storage_path,
      bucket,
    } = await req.json();

    if (!product_id || !image_url) {
      return NextResponse.json(
        { error: "Missing product_id/image_url" },
        { status: 400 }
      );
    }

    const { data: existingPrimary, error: primaryErr } = await supabaseAdmin
      .from("product_images")
      .select("id")
      .eq("product_id", product_id)
      .eq("is_primary", true)
      .limit(1);

    if (primaryErr) {
      return NextResponse.json(
        {
          error: primaryErr.message,
          code: (primaryErr as any).code,
          details: (primaryErr as any).details,
          hint: (primaryErr as any).hint,
        },
        { status: 500 }
      );
    }

    const hasPrimary =
      Array.isArray(existingPrimary) && existingPrimary.length > 0;

    const makePrimary = Boolean(is_primary) || !hasPrimary;

    const { data: maxRow, error: maxErr } = await supabaseAdmin
      .from("product_images")
      .select("sort_order")
      .eq("product_id", product_id)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxErr) {
      return NextResponse.json(
        {
          error: maxErr.message,
          code: (maxErr as any).code,
          details: (maxErr as any).details,
          hint: (maxErr as any).hint,
        },
        { status: 500 }
      );
    }

    const nextSort =
      typeof maxRow?.sort_order === "number" ? maxRow.sort_order + 1 : 0;

    if (makePrimary && hasPrimary) {
      const { error: clearErr } = await supabaseAdmin
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", product_id)
        .eq("is_primary", true);

      if (clearErr) {
        return NextResponse.json(
          {
            error: clearErr.message,
            code: (clearErr as any).code,
            details: (clearErr as any).details,
            hint: (clearErr as any).hint,
          },
          { status: 500 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from("product_images")
      .insert({
        product_id,
        image_url,
        alt: alt ?? null,
        sort_order: nextSort,
        is_primary: makePrimary,
        bucket: (bucket ?? "products") || "products",
        storage_bucket: (storage_bucket ?? "products") || "products",
        storage_path: storage_path ?? null,
      })
      .select(
        "id,product_id,image_url,alt,sort_order,is_primary,storage_bucket,storage_path,created_at"
      )
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, image: data });
  } catch (e: any) {
    return NextResponse.json(
      {
        error: e?.message || "Unexpected server error",
      },
      { status: 500 }
    );
  }
}

