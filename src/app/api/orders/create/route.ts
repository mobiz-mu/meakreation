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
    const payment_reference = body.payment_reference ?? null;

    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) {
      return NextResponse.json({ error: "Empty cart" }, { status: 400 });
    }

    const userId = await getAuthedUserId(req);

    const paymentMethod = String(body.payment_method || "SPARK").toUpperCase();

    if (!["SPARK", "JUICE", "BANK_TRANSFER"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc(
      "create_order_atomic_pending",
      {
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
        p_payment_method: paymentMethod,
      }
    );

    if (error) throw error;
    if (!data?.order_id) {
      throw new Error("Order creation did not return an order id.");
    }

    const { error: updErr } = await supabaseAdmin
      .from("orders")
      .update({
        payment_method: paymentMethod,
        payment_status:
          paymentMethod === "SPARK" ? "PENDING" : "AWAITING_CONFIRMATION",
        notes: payment_reference
          ? `${notes ? `${notes}\n\n` : ""}Payment reference: ${payment_reference}`
          : notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.order_id);

    if (updErr) throw updErr;

    return NextResponse.json({
      ok: true,
      orderId: data.order_id,
      publicToken: data.public_token,
      orderNo: data.order_no,
      payment_method: paymentMethod,
    });
  } catch (err: any) {
    console.error("orders/create error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed" },
      { status: 500 }
    );
  }
}