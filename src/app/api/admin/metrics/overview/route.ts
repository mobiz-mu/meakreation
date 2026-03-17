import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

function n(v: unknown) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error || "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: ordersAll, error: allErr } = await supabaseAdmin
      .from("orders")
      .select("id,total_mur,payment_status,status,created_at");

    if (allErr) {
      throw allErr;
    }

    const allOrders = ordersAll ?? [];

    const totalOrders = allOrders.length;

    const paidRevenue = allOrders
      .filter((o) => o.payment_status === "PAID")
      .reduce((sum, o) => sum + n(o.total_mur), 0);

    const codProcessingCount = allOrders.filter(
      (o) => o.payment_status === "COD" && o.status === "PROCESSING"
    ).length;

    const codExpectedRevenue = allOrders
      .filter((o) => o.payment_status === "COD" && o.status === "PROCESSING")
      .reduce((sum, o) => sum + n(o.total_mur), 0);

    const pendingPaymentCount = allOrders.filter(
      (o) => o.payment_status === "PENDING"
    ).length;

    const since = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: orders30, error: thirtyErr } = await supabaseAdmin
      .from("orders")
      .select("id,total_mur,payment_status,status,created_at")
      .gte("created_at", since);

    if (thirtyErr) {
      throw thirtyErr;
    }

    const last30Orders = orders30 ?? [];

    const ordersLast30 = last30Orders.length;

    const paidRevenue30 = last30Orders
      .filter((o) => o.payment_status === "PAID")
      .reduce((sum, o) => sum + n(o.total_mur), 0);

    const codExpected30 = last30Orders
      .filter((o) => o.payment_status === "COD" && o.status === "PROCESSING")
      .reduce((sum, o) => sum + n(o.total_mur), 0);

    return NextResponse.json({
      totalOrders,
      paidRevenue,
      pendingPaymentCount,
      codProcessingCount,
      codExpectedRevenue,
      last30: {
        orders: ordersLast30,
        paidRevenue: paidRevenue30,
        codExpectedRevenue: codExpected30,
      },
    });
  } catch (err: any) {
    console.error("admin/metrics/overview error:", err);

    return NextResponse.json(
      { error: err?.message || "Failed to load overview metrics." },
      { status: 500 }
    );
  }
}

