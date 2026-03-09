import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";

export const runtime = "nodejs";

type CheckoutItem = {
  productId: string;
  variantId: string | null;
  title: string;
  variantLabel: string | null;
  imageUrl: string | null;
  unitPriceMur: number;
  qty: number;
};

type CheckoutPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  paymentMethod?: string;
  shippingMethodId: string;
  items: CheckoutItem[];
};

function toInt(n: unknown) {
  const x = Number(n);
  return Number.isFinite(x) ? Math.round(x) : 0;
}

function makeOrderNo() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `MK-${y}${m}${d}-${h}${min}${s}-${rand}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutPayload;

    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    if (
      !body.firstName?.trim() ||
      !body.lastName?.trim() ||
      !body.email?.trim() ||
      !body.phone?.trim() ||
      !body.addressLine1?.trim() ||
      !body.shippingMethodId?.trim()
    ) {
      return NextResponse.json(
        { error: "Missing required checkout fields." },
        { status: 400 }
      );
    }

    const subtotalMur = items.reduce(
      (sum, item) => sum + toInt(item.unitPriceMur) * Math.max(1, toInt(item.qty)),
      0
    );

    const { data: shippingMethod, error: shippingErr } = await supabaseAdmin
      .from("shipping_methods")
      .select("id,name,price_mur,is_active")
      .eq("id", body.shippingMethodId)
      .maybeSingle();

    if (shippingErr) {
      console.error("shipping method load error:", shippingErr);
      return NextResponse.json(
        { error: "Unable to load shipping method." },
        { status: 500 }
      );
    }

    if (!shippingMethod || shippingMethod.is_active === false) {
      return NextResponse.json(
        { error: "Invalid shipping method." },
        { status: 400 }
      );
    }

    const shippingPriceMur = toInt(shippingMethod.price_mur);
    const discountMur = 0;
    const totalMur = subtotalMur + shippingPriceMur - discountMur;

    let order: { id: string; order_no: string; public_token: string } | null = null;
    let orderErr: unknown = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      const orderNo = makeOrderNo();

      const res = await supabaseAdmin
        .from("orders")
        .insert({
          order_no: orderNo,
          status: "PENDING",
          first_name: body.firstName.trim(),
          last_name: body.lastName.trim(),
          email: body.email.trim(),
          phone: body.phone.trim(),
          whatsapp: body.whatsapp?.trim() || null,
          address_line1: body.addressLine1.trim(),
          address_line2: body.addressLine2?.trim() || null,
          city: body.city?.trim() || null,
          district: body.district?.trim() || null,
          postal_code: body.postalCode?.trim() || null,
          country: body.country?.trim() || "Mauritius",
          shipping_method_id: shippingMethod.id,
          shipping_price_mur: shippingPriceMur,
          subtotal_mur: subtotalMur,
          discount_mur: discountMur,
          total_mur: totalMur,
          notes: body.notes?.trim() || null,
          payment_method: body.paymentMethod?.trim() || "cash-on-delivery",
          payment_status: "UNPAID",
        })
        .select("id,order_no,public_token")
        .single();

      if (!res.error && res.data) {
        order = res.data;
        orderErr = null;
        break;
      }

      orderErr = res.error;
    }

    // IMPORTANT: guard against null before using order.id
    if (!order) {
      console.error("order create error:", orderErr);
      return NextResponse.json(
        { error: "Unable to create order." },
        { status: 500 }
      );
    }

    const orderItems = items.map((item) => {
      const qty = Math.max(1, toInt(item.qty));
      const unitPriceMur = toInt(item.unitPriceMur);

      return {
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId,
        title: item.title,
        variant_label: item.variantLabel || null,
        sku: null,
        unit_price_mur: unitPriceMur,
        qty,
        line_total_mur: unitPriceMur * qty,
        image_url: item.imageUrl || null,
      };
    });

    const { error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsErr) {
      console.error("order items create error:", itemsErr);

      await supabaseAdmin.from("orders").delete().eq("id", order.id);

      return NextResponse.json(
        { error: "Unable to save order items." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      orderId: order.id,
      orderNo: order.order_no,
      publicToken: order.public_token,
    });
  } catch (error) {
    console.error("checkout api error:", error);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}