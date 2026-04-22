import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";

type Item = { product_id: string; variant_id: string | null; qty: number };

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const items: Item[] = Array.isArray(body.items) ? body.items : [];
    const shipping_method_id: string = body.shipping_method_id;

    if (!items.length) {
      return NextResponse.json(
        { ok: false, error: "Empty cart" },
        { status: 400 }
      );
    }

    if (!shipping_method_id) {
      return NextResponse.json(
        { ok: false, error: "Missing shipping method" },
        { status: 400 }
      );
    }

    const payload = {
      p_user_id: body.user_id || null,
      p_first_name: body.first_name,
      p_last_name: body.last_name,
      p_email: body.email,
      p_phone: body.phone,
      p_whatsapp: body.whatsapp || null,
      p_address_line1: body.address_line1,
      p_address_line2: body.address_line2 || null,
      p_city: body.city || null,
      p_district: body.district || null,
      p_postal_code: body.postal_code || null,
      p_country: body.country || "Mauritius",
      p_shipping_method_id: shipping_method_id,
      p_notes: body.notes || null,
      p_discount_mur: Number(body.discount_mur ?? 0),
      p_items: items,
    };

    const { data, error } = await supabaseAdmin.rpc(
      "create_order_atomic_cod",
      payload
    );

    if (error) throw error;
    if (!data?.order_id) {
      throw new Error("COD order creation did not return an order id.");
    }

    return NextResponse.json({ ok: true, ...data });
  } catch (err: any) {
    console.error("create-cod error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed" },
      { status: 400 }
    );
  }
}