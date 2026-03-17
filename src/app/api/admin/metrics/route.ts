import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const runtime = "nodejs";

type MetricsResponse = {
  kpis: {
    orders_all: number;
    orders_active: number;
    orders_paid: number;
    revenue_paid_mur: number;
    revenue_cod_pipeline_mur: number;
  };
  daily: Array<{
    day: string;
    paid_orders: number;
    paid_revenue_mur: number;
    cod_orders: number;
  }>;
};

export async function GET(_req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status }
      );
    }

    const { data: kpis, error: kErr } = await supabaseAdmin
      .from("v_admin_kpis")
      .select("*")
      .single();

    if (kErr) throw kErr;

    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceISO = since.toISOString().slice(0, 10);

    const { data: daily, error: dErr } = await supabaseAdmin
      .from("v_admin_revenue_daily")
      .select("day, paid_orders, paid_revenue_mur, cod_orders")
      .gte("day", sinceISO)
      .order("day", { ascending: true });

    if (dErr) throw dErr;

    const res: MetricsResponse = {
      kpis: {
        orders_all: Number(kpis?.orders_all ?? 0),
        orders_active: Number(kpis?.orders_active ?? 0),
        orders_paid: Number(kpis?.orders_paid ?? 0),
        revenue_paid_mur: Number(kpis?.revenue_paid_mur ?? 0),
        revenue_cod_pipeline_mur: Number(kpis?.revenue_cod_pipeline_mur ?? 0),
      },
      daily: (daily ?? []).map((r: any) => ({
        day: String(r.day),
        paid_orders: Number(r.paid_orders ?? 0),
        paid_revenue_mur: Number(r.paid_revenue_mur ?? 0),
        cod_orders: Number(r.cod_orders ?? 0),
      })),
    };

    return NextResponse.json(res);
  } catch (err: any) {
    console.error("admin/metrics error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed" },
      { status: 500 }
    );
  }
}
