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

    const publicToken: string | undefined = body?.publicToken; // preferred
    const orderNo: string | undefined = body?.orderNo; // fallback (optional)

    if (!publicToken && !orderNo) {
      return NextResponse.json({ error: "Missing publicToken or orderNo" }, { status: 400 });
    }

    const userId = await getAuthedUserId(req);

    const q = supabaseAdmin
      .from("orders")
      .select("order_no,user_id,public_token,status,payment_status,total_mur,paid_at,created_at")
      .limit(1);

    const { data: order, error: oErr } = publicToken
      ? await q.eq("public_token", publicToken).maybeSingle()
      : await q.eq("order_no", orderNo!).maybeSingle();

    if (oErr) throw oErr;
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const isOwner = userId && order.user_id && userId === order.user_id;
    const isGuestAllowed = !order.user_id && publicToken && publicToken === order.public_token;

    // If order has user_id, require owner
    if (order.user_id && !isOwner) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    // If guest order, token must match
    if (!order.user_id && !isGuestAllowed) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    return NextResponse.json({
      order_no: order.order_no,
      status: order.status,
      payment_status: order.payment_status,
      total_mur: order.total_mur,
      paid_at: order.paid_at,
      created_at: order.created_at,
    });
  } catch (err: any) {
    console.error("orders/verify error:", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}
