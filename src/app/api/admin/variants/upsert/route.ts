import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

function normalizeOptions(obj: any) {
  const out: Record<string, string> = {};
  if (!obj || typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    const key = String(k || "").trim();
    const val = String(v ?? "").trim();
    if (!key || !val) continue;
    out[key] = val;
  }
  return out;
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: 401 });

    const body = await req.json();

    const id = body.id as string | undefined;
    const product_id = body.product_id as string | undefined;

    if (!product_id) return NextResponse.json({ error: "Missing product_id" }, { status: 400 });

    const row: any = {
      product_id,
      options_json: normalizeOptions(body.options_json),
      sku: body.sku || null,
      price_mur: body.price_mur ?? null,
      compare_at_price_mur: body.compare_at_price_mur ?? null,
      stock_qty: Number(body.stock_qty ?? 0),
      is_active: Boolean(body.is_active ?? true),
    };

    if (id) {
      const { data, error } = await supabaseServer
        .from("product_variants")
        .update(row)
        .eq("id", id)
        .select("id,product_id,options_json,options_key,sku,price_mur,compare_at_price_mur,stock_qty,is_active,created_at,updated_at")
        .single();
      if (error) throw error;
      return NextResponse.json({ ok: true, item: data });
    } else {
      const { data, error } = await supabaseServer
        .from("product_variants")
        .insert(row)
        .select("id,product_id,options_json,options_key,sku,price_mur,compare_at_price_mur,stock_qty,is_active,created_at,updated_at")
        .single();
      if (error) throw error;
      return NextResponse.json({ ok: true, item: data });
    }
  } catch (err: any) {
    console.error("admin/variants/upsert error:", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}