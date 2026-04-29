import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const runtime = "nodejs";

function normalizeOptions(input: unknown) {
  const out: Record<string, string> = {};

  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return out;
  }

  for (const [rawKey, rawValue] of Object.entries(input as Record<string, unknown>)) {
    const key = String(rawKey || "").trim();
    const value = String(rawValue ?? "").trim();

    if (!key || !value) continue;

    out[key] = value;
  }

  return Object.fromEntries(
    Object.entries(out).sort(([a], [b]) => a.localeCompare(b))
  );
}

function toNullableNumber(value: unknown) {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status }
      );
    }

    const body = await req.json();

    const id = typeof body.id === "string" ? body.id : undefined;
    const product_id =
      typeof body.product_id === "string" ? body.product_id : undefined;

    if (!product_id) {
      return NextResponse.json(
        { error: "Missing product_id" },
        { status: 400 }
      );
    }

    const options_json = normalizeOptions(body.options_json);

    if (!Object.keys(options_json).length) {
      return NextResponse.json(
        { error: "Variant options are required" },
        { status: 400 }
      );
    }

    const stock_qty = Number(body.stock_qty ?? 0);
    if (!Number.isFinite(stock_qty) || stock_qty < 0) {
      return NextResponse.json(
        { error: "Stock quantity must be 0 or greater" },
        { status: 400 }
      );
    }

    const row = {
      product_id,
      options_json,
      sku: body.sku ? String(body.sku).trim() : null,
      price_mur: toNullableNumber(body.price_mur),
      compare_at_price_mur: toNullableNumber(body.compare_at_price_mur),
      stock_qty,
      is_active: Boolean(body.is_active ?? true),
    };

    if (id) {
      const { data, error } = await supabaseAdmin
        .from("product_variants")
        .update(row)
        .eq("id", id)
        .select(`
          id,
          product_id,
          options_json,
          options_key,
          sku,
          price_mur,
          compare_at_price_mur,
          stock_qty,
          is_active,
          created_at,
          updated_at,
          variant_images (
            id,
            variant_id,
            image_url,
            alt,
            sort_order,
            created_at
          )
        `)
        .single();

      if (error) {
        if (String(error.message || "").toLowerCase().includes("duplicate key")) {
          return NextResponse.json(
            { error: "A variant with the same options already exists for this product" },
            { status: 409 }
          );
        }
        throw error;
      }

      return NextResponse.json({ ok: true, item: data });
    }

    const { data, error } = await supabaseAdmin
      .from("product_variants")
      .insert(row)
      .select(`
        id,
        product_id,
        options_json,
        options_key,
        sku,
        price_mur,
        compare_at_price_mur,
        stock_qty,
        is_active,
        created_at,
        updated_at,
        variant_images (
          id,
          variant_id,
          image_url,
          alt,
          sort_order,
          created_at
        )
      `)
      .single();

    if (error) {
      if (String(error.message || "").toLowerCase().includes("duplicate key")) {
        return NextResponse.json(
          { error: "A variant with the same options already exists for this product" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ ok: true, item: data });
  } catch (err: any) {
    console.error("admin/variants/upsert error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to save variant" },
      { status: 500 }
    );
  }
}