import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";

export const runtime = "nodejs";

async function getAuthedUserId(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user?.id) return null;
  return data.user.id;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Customer fields (guest or logged-in)
    const first_name = body.first_name;
    const last_name = body.last_name;
    const email = body.email;
    const phone = body.phone;
    const whatsapp = body.whatsapp ?? null;

    const address_line1 = body.address_line1;
    const address_line2 = body.address_line2 ?? null;
    const city = body.city ?? null;
    const district = body.district ?? null;
    const postal_code = body.postal_code ?? null;
    const country = body.country ?? "Mauritius";

    const shipping_method_id = body.shipping_method_id;
    const discount_mur = Number(body.discount_mur ?? 0);
    const notes = body.notes ?? null;

    // IMPORTANT: items must include variant_id (your checkout requires it)
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) return NextResponse.json({ error: "Empty cart" }, { status: 400 });

    // user (optional)
    const userId = await getAuthedUserId(req);

    // Call your atomic function (it deducts stock + computes totals)
    // We create as COD only when selected; otherwise create with PENDING payment
    const paymentMethod = String(body.payment_method || "SPARK").toUpperCase(); // "SPARK" | "COD"

    if (paymentMethod === "COD") {
      const { data, error } = await supabaseAdmin.rpc("create_order_atomic_cod", {
        p_user_id: userId,
        p_first_name: first_name,
        p_last_name: last_name,
        p_email: email,
        p_phone: phone,
        p_whatsapp: whatsapp,
        p_address_line1: address_line1,
        p_address_line2: address_line2,
        p_city: city,
        p_district: district,
        p_postal_code: postal_code,
        p_country: country,
        p_shipping_method_id: shipping_method_id,
        p_notes: notes,
        p_discount_mur: discount_mur,
        p_items: items,
      });

      if (error) throw error;

      // data already contains order_id + public_token
      return NextResponse.json({
        ok: true,
        orderId: data.order_id,
        publicToken: data.public_token,
        orderNo: data.order_no,
        payment_method: "COD",
      });
    }

    // SPARK / online payment flow:
    // We’ll reuse the same atomic approach but set payment_status = PENDING + method SPARK.
    // If you don't have a function for this yet, we do it with a safe insert+deduct in SQL next.
    // ✅ QUICK SAFE WAY: create COD order then immediately flip to PENDING SPARK is WRONG.
    // So we do: create COD-like atomic order but with payment fields set to PENDING.
    // We'll call a second function `create_order_atomic_pending` (SQL below).

    const { data, error } = await supabaseAdmin.rpc("create_order_atomic_pending", {
      p_user_id: userId,
      p_first_name: first_name,
      p_last_name: last_name,
      p_email: email,
      p_phone: phone,
      p_whatsapp: whatsapp,
      p_address_line1: address_line1,
      p_address_line2: address_line2,
      p_city: city,
      p_district: district,
      p_postal_code: postal_code,
      p_country: country,
      p_shipping_method_id: shipping_method_id,
      p_notes: notes,
      p_discount_mur: discount_mur,
      p_items: items,
      p_payment_method: "SPARK",
    });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      orderId: data.order_id,
      publicToken: data.public_token,
      orderNo: data.order_no,
      payment_method: "SPARK",
    });
  } catch (err: any) {
    console.error("orders/create error:", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}
