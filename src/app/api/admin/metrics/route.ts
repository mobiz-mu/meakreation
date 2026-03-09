import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

type MetricsResponse = {
  kpis: {
    orders_all: number;
    orders_active: number;
    orders_paid: number;
    revenue_paid_mur: number;
    revenue_cod_pipeline_mur: number;
  };
  daily: Array<{
    day: string; // YYYY-MM-DD
    paid_orders: number;
    paid_revenue_mur: number;
    cod_orders: number;
  }>;
};

async function requireAdmin(req: Request) {
  // Expecting client to pass Supabase access token (from supabase auth session) in Authorization header
  // e.g. Authorization: Bearer <access_token>
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!token) return { ok: false as const, error: "Missing Authorization Bearer token" };

  // Validate token and extract user id
  const { data: userRes, error: userErr } = await supabaseServer.auth.getUser(token);
  if (userErr || !userRes?.user) return { ok: false as const, error: "Invalid token" };

  const uid = userRes.user.id;

  // Check admin_users table
  const { data: adminRow, error: adminErr } = await supabaseServer
    .from("admin_users")
    .select("user_id, role")
    .eq("user_id", uid)
    .maybeSingle();

  if (adminErr) return { ok: false as const, error: adminErr.message };
  if (!adminRow) return { ok: false as const, error: "Not an admin" };

  return { ok: true as const, uid };
}

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) {
      return NextResponse.json({ error: admin.error }, { status: 401 });
    }

    // KPIs view (recommended). If you haven't created it, see SQL section below.
    const { data: kpis, error: kErr } = await supabaseServer
      .from("v_admin_kpis")
      .select("*")
      .single();

    if (kErr) throw kErr;

    // Daily revenue view (last 30 days)
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const sinceISO = since.toISOString().slice(0, 10); // YYYY-MM-DD

    const { data: daily, error: dErr } = await supabaseServer
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
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}