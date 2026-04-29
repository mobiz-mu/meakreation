import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const publicToken = url.searchParams.get("publicToken");
    const orderNo = url.searchParams.get("orderNo");

    if (!publicToken && !orderNo) {
      return NextResponse.json(
        { error: "Missing order reference." },
        { status: 400 }
      );
    }

    let query = supabaseAdmin
      .from("orders")
      .select("order_no,status,payment_status,total_mur,paid_at,created_at");

    if (publicToken) {
      query = query.eq("public_token", publicToken);
    } else {
      query = query.eq("order_no", orderNo);
    }

    const { data: order, error } = await query.maybeSingle();

    if (error) {
      console.error("status-by-token error:", error);
      return NextResponse.json(
        { error: "Unable to verify order." },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (e: any) {
    console.error("status-by-token unexpected error:", e);
    return NextResponse.json(
      { error: e?.message || "Unable to verify order." },
      { status: 500 }
    );
  }
}