import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("order_no,status,payment_status,total_mur,paid_at,created_at")
      .eq("public_token", token)
      .maybeSingle();

    if (error) throw error;
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true, order });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
