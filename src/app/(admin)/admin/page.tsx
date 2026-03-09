"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  TrendingUp,
  Package,
  ShoppingBag,
  CreditCard,
  ArrowUpRight,
  RefreshCw,
  Mail,
  FileText,
  Boxes,
  ClipboardList,
  LineChart as LineChartIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function fmtMUR(n?: number) {
  const x = Number.isFinite(Number(n)) ? Number(n) : 0;
  return `Rs ${x.toLocaleString("en-MU")}`;
}

function isIgnorableAuthError(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error ?? "");

  return (
    msg.includes('Navigator LockManager lock') ||
    msg.includes("Sign out timeout") ||
    msg.includes("Not logged in") ||
    msg.includes("Missing access token")
  );
}

async function getToken() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not logged in");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;
  if (!token) throw new Error("Missing access token");

  return token;
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto w-fit rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-2 text-sm text-black/70">
        {title}
      </div>
      {hint ? <div className="mt-2 text-xs text-black/50">{hint}</div> : null}
    </div>
  );
}

function orderStatusClass(status?: string | null) {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "SHIPPED":
      return "bg-sky-50 text-sky-700 border-sky-100";
    case "PROCESSING":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "PAID":
      return "bg-violet-50 text-violet-700 border-violet-100";
    case "CANCELLED":
    case "FAILED":
      return "bg-rose-50 text-rose-700 border-rose-100";
    default:
      return "bg-neutral-50 text-neutral-700 border-neutral-200";
  }
}

function paymentStatusClass(status?: string | null) {
  switch (status) {
    case "SUCCESS":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "INITIATED":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "FAILED":
      return "bg-rose-50 text-rose-700 border-rose-100";
    case "REFUNDED":
      return "bg-slate-50 text-slate-700 border-slate-200";
    default:
      return "bg-neutral-50 text-neutral-700 border-neutral-200";
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Overview = {
  paidRevenue: number;
  totalOrders: number;
  codProcessingCount: number;
  codExpectedRevenue: number;
  last30?: {
    paidRevenue: number;
    codExpectedRevenue: number;
  };
};

type CountStats = {
  totalProducts: number;
  totalBlogPosts: number;
  totalNewsletterSubscribers: number;
};

type RecentOrder = {
  id: string;
  order_no: string;
  status: string | null;
  payment_status: string | null;
  first_name: string | null;
  last_name: string | null;
  total_mur: number | null;
  created_at: string | null;
};

type MonthlyPoint = {
  key: string;
  month: string;
  orders: number;
  revenue: number;
};

type OrderMetricRow = {
  id: string;
  total_mur: number | null;
  created_at: string | null;
};

function buildMonthlyBucketsMar2026ToMar2027() {
  const months: MonthlyPoint[] = [];
  const start = new Date(Date.UTC(2026, 2, 1));

  for (let i = 0; i < 13; i++) {
    const d = new Date(start);
    d.setUTCMonth(start.getUTCMonth() + i);
    const year = d.getUTCFullYear();
    const monthIndex = d.getUTCMonth();

    months.push({
      key: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
      month:
        d.toLocaleString("en-GB", { month: "short" }) +
        " " +
        String(year).slice(-2),
      orders: 0,
      revenue: 0,
    });
  }

  return months;
}

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [days, setDays] = useState("30");
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [monthlyOrders, setMonthlyOrders] = useState<MonthlyPoint[]>([]);
  const [counts, setCounts] = useState<CountStats>({
    totalProducts: 0,
    totalBlogPosts: 0,
    totalNewsletterSubscribers: 0,
  });
  const [err, setErr] = useState<string | null>(null);

  const aliveRef = useRef(true);

  useEffect(() => {
    setMounted(true);
    aliveRef.current = true;

    return () => {
      aliveRef.current = false;
    };
  }, []);

  async function loadCountsAndOrders() {
    const [
      productsRes,
      blogRes,
      newsletterRes,
      recentOrdersRes,
      monthlyOrdersRes,
    ] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      supabase
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select(`
          id,
          order_no,
          status,
          payment_status,
          first_name,
          last_name,
          total_mur,
          created_at
        `)
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("orders")
        .select("id, total_mur, created_at")
        .gte("created_at", "2026-03-01T00:00:00.000Z")
        .lt("created_at", "2027-04-01T00:00:00.000Z")
        .order("created_at", { ascending: true }),
    ]);

    if (!aliveRef.current) return;

    setCounts({
      totalProducts: productsRes.count ?? 0,
      totalBlogPosts: blogRes.count ?? 0,
      totalNewsletterSubscribers: newsletterRes.count ?? 0,
    });

    setRecentOrders((recentOrdersRes.data as RecentOrder[]) ?? []);

    const buckets = buildMonthlyBucketsMar2026ToMar2027();
    const map = new Map(buckets.map((b) => [b.key, { ...b }]));

    for (const row of ((monthlyOrdersRes.data as OrderMetricRow[] | null) ?? [])) {
      const createdAt = row.created_at ? new Date(row.created_at) : null;
      if (!createdAt || Number.isNaN(createdAt.getTime())) continue;

      const key = `${createdAt.getUTCFullYear()}-${String(
        createdAt.getUTCMonth() + 1
      ).padStart(2, "0")}`;

      const bucket = map.get(key);
      if (!bucket) continue;

      bucket.orders += 1;
      bucket.revenue += Number(row.total_mur ?? 0);
    }

    setMonthlyOrders(Array.from(map.values()));
  }

  async function loadAll() {
    if (!aliveRef.current) return;

    setErr(null);
    setLoading(true);

    try {
      const token = await getToken();

      if (!aliveRef.current) return;

      const [a, b, c] = await Promise.all([
        fetch("/api/admin/metrics/overview", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/admin/metrics/top-products?days=${encodeURIComponent(days)}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `/api/admin/metrics/top-categories?days=${encodeURIComponent(days)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      if (!aliveRef.current) return;

      const j1 = await a.json();
      const j2 = await b.json();
      const j3 = await c.json();

      if (!a.ok) throw new Error(j1?.error || "Failed overview");
      if (!b.ok) throw new Error(j2?.error || "Failed top products");
      if (!c.ok) throw new Error(j3?.error || "Failed top categories");

      if (!aliveRef.current) return;

      setOverview(j1);
      setTopProducts(j2.items ?? []);
      setTopCategories(j3.items ?? []);

      await loadCountsAndOrders();
    } catch (e: unknown) {
      if (!aliveRef.current) return;

      if (isIgnorableAuthError(e)) {
        setErr(null);
        return;
      }

      const message =
        e instanceof Error ? e.message : "Failed to load dashboard data.";
      setErr(message);
    } finally {
      if (aliveRef.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const businessCards = useMemo(() => {
    if (!overview) return [];

    return [
      {
        label: "Paid Revenue",
        value: fmtMUR(overview.paidRevenue),
        hint: overview?.last30
          ? `Last 30 days: ${fmtMUR(overview.last30.paidRevenue)}`
          : "All-time completed revenue",
        icon: <TrendingUp className="h-4 w-4" />,
        iconWrap: "bg-emerald-50 text-emerald-700 border-emerald-100",
      },
      {
        label: "Total Orders",
        value: String(overview.totalOrders),
        hint: "All recorded customer orders",
        icon: <ShoppingBag className="h-4 w-4" />,
        iconWrap: "bg-sky-50 text-sky-700 border-sky-100",
      },
      {
        label: "COD Processing",
        value: String(overview.codProcessingCount),
        hint: "Orders awaiting COD completion",
        icon: <CreditCard className="h-4 w-4" />,
        iconWrap: "bg-amber-50 text-amber-700 border-amber-100",
      },
      {
        label: "COD Expected",
        value: fmtMUR(overview.codExpectedRevenue),
        hint: overview?.last30
          ? `Last 30 days: ${fmtMUR(overview.last30.codExpectedRevenue)}`
          : "Expected COD revenue",
        icon: <ClipboardList className="h-4 w-4" />,
        iconWrap: "bg-violet-50 text-violet-700 border-violet-100",
      },
    ];
  }, [overview]);

  const quickCards = useMemo(
    () => [
      {
        label: "Newsletter Subscribers",
        value: String(counts.totalNewsletterSubscribers),
        href: "/admin/newsletter",
        icon: <Mail className="h-4 w-4" />,
        iconWrap: "bg-rose-50 text-rose-700 border-rose-100",
      },
      {
        label: "Blog Posts",
        value: String(counts.totalBlogPosts),
        href: "/admin/blog",
        icon: <FileText className="h-4 w-4" />,
        iconWrap: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
      },
      {
        label: "Products",
        value: String(counts.totalProducts),
        href: "/admin/products",
        icon: <Boxes className="h-4 w-4" />,
        iconWrap: "bg-orange-50 text-orange-700 border-orange-100",
      },
    ],
    [counts]
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#fff4f8] px-3 py-1.5 text-[12px] text-black/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff7fa8]" />
            Mea Kréation Admin
          </div>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-black/60">
            Premium business insights, order performance, content, and subscriber
            growth.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {mounted ? (
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-full rounded-2xl border-black/10 bg-white sm:w-[210px]">
                <SelectValue placeholder="Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="h-10 w-full rounded-2xl border border-black/10 bg-white sm:w-[210px]" />
          )}

          <Button
            className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02]"
            variant="outline"
            onClick={loadAll}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {loading ? "Refreshing..." : "Refresh"}
          </Button>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              className="rounded-2xl bg-[#ffb3cc] text-black hover:bg-[#ffa0bf]"
              asChild
            >
              <Link href="/admin/orders">Orders</Link>
            </Button>
            <Button
              className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02]"
              variant="outline"
              asChild
            >
              <Link href="/admin/products">Products</Link>
            </Button>
          </div>
        </div>
      </div>

      {err ? (
        <Card className="rounded-2xl border border-red-200 bg-white">
          <CardContent className="py-4 text-sm text-red-600">{err}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {businessCards.map((c) => (
          <Card
            key={c.label}
            className="rounded-[24px] border-black/10 bg-white shadow-[0_18px_50px_-38px_rgba(0,0,0,0.30)]"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3 text-sm text-black/70">
                <span
                  className={cx(
                    "grid h-10 w-10 place-items-center rounded-2xl border",
                    c.iconWrap
                  )}
                >
                  {c.icon}
                </span>
                <span className="font-medium">{c.label}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight text-black">
                {c.value}
              </div>
              <div className="mt-2 text-xs leading-5 text-black/55">{c.hint}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {quickCards.map((c) => (
          <Card
            key={c.label}
            className="rounded-[24px] border-black/10 bg-white shadow-[0_18px_50px_-38px_rgba(0,0,0,0.22)]"
          >
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <div className="text-sm font-medium text-black/65">{c.label}</div>
                <div className="mt-1 text-3xl font-semibold tracking-tight text-black">
                  {c.value}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={cx(
                    "grid h-11 w-11 place-items-center rounded-2xl border",
                    c.iconWrap
                  )}
                >
                  {c.icon}
                </span>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02]"
                >
                  <Link href={c.href}>
                    Open <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-[24px] border-black/10 bg-white shadow-[0_18px_50px_-38px_rgba(0,0,0,0.20)]">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-black">
            <LineChartIcon className="h-4 w-4 text-[#ff7fa8]" />
            Monthly Orders Trend
          </CardTitle>
          <div className="text-xs text-black/55">Mar 2026 → Mar 2027</div>
        </CardHeader>

        <CardContent className="pt-1">
          {monthlyOrders.length ? (
            <div className="h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyOrders}
                  margin={{ top: 10, right: 12, left: -14, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.08)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "rgba(0,0,0,0.58)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "rgba(0,0,0,0.58)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 16,
                      border: "1px solid rgba(0,0,0,0.08)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    }}
                    formatter={(value, name) => {
                      const num =
                        typeof value === "number" ? value : Number(value ?? 0);
                      const label = String(name ?? "");

                      if (label === "orders") return [num, "Orders"];
                      if (label === "revenue") return [fmtMUR(num), "Revenue"];

                      return [num, label];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#ff7fa8"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 0, fill: "#ff7fa8" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              title="No monthly order data yet."
              hint="Monthly order trend will appear automatically once orders exist."
            />
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-[24px] border-black/10 bg-white">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-black">
            <ShoppingBag className="h-4 w-4 text-[#ff7fa8]" />
            Recent Orders
          </CardTitle>

          <Button
            asChild
            variant="outline"
            className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02]"
          >
            <Link href="/admin/orders">
              View All <ArrowUpRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="px-0">
          {recentOrders.length ? (
            <div className="overflow-auto">
              <table className="min-w-[760px] w-full text-sm">
                <thead className="bg-black/[0.02] text-black/60">
                  <tr className="border-b border-black/10">
                    <th className="px-4 py-2 text-left font-medium">Order</th>
                    <th className="px-4 py-2 text-left font-medium">Customer</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Payment</th>
                    <th className="px-4 py-2 text-right font-medium">Total</th>
                    <th className="px-4 py-2 text-right font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => {
                    const total = Number(o.total_mur ?? 0);
                    const customerName =
                      [o.first_name, o.last_name].filter(Boolean).join(" ") || "—";

                    return (
                      <tr
                        key={o.id}
                        className="border-b border-black/10 transition hover:bg-black/[0.02]"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-black">#{o.order_no}</div>
                          <div className="text-xs text-black/50">{o.id}</div>
                        </td>
                        <td className="px-4 py-3 text-black">{customerName}</td>
                        <td className="px-4 py-3">
                          <Badge
                            className={cx(
                              "rounded-2xl border hover:opacity-100",
                              orderStatusClass(o.status)
                            )}
                          >
                            {o.status || "PENDING"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={cx(
                              "rounded-2xl border hover:opacity-100",
                              paymentStatusClass(o.payment_status)
                            )}
                          >
                            {o.payment_status || "UNPAID"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-black">
                          {fmtMUR(total)}
                        </td>
                        <td className="px-4 py-3 text-right text-black/60">
                          {formatDate(o.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No recent orders yet."
              hint="New customer orders will appear here automatically."
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-[24px] border-black/10 bg-white">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-black">
              <Package className="h-4 w-4 text-[#ff7fa8]" />
              Top Products ({days} days)
            </CardTitle>

            <Button
              asChild
              variant="outline"
              className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02]"
            >
              <Link href="/admin/products">
                View <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="px-0">
            {topProducts.length ? (
              <div className="overflow-auto">
                <table className="min-w-[620px] w-full text-sm">
                  <thead className="bg-black/[0.02] text-black/60">
                    <tr className="border-b border-black/10">
                      <th className="px-4 py-2 text-left font-medium">Product</th>
                      <th className="px-4 py-2 text-right font-medium">Qty</th>
                      <th className="px-4 py-2 text-right font-medium">Paid</th>
                      <th className="px-4 py-2 text-right font-medium">COD</th>
                      <th className="px-4 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p) => (
                      <tr
                        key={p.product_id}
                        className="border-b border-black/10 transition hover:bg-black/[0.02]"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-black">{p.title}</div>
                          <div className="text-xs text-black/55">{p.slug}</div>
                        </td>
                        <td className="px-4 py-3 text-right text-black">{p.qty}</td>
                        <td className="px-4 py-3 text-right text-black">
                          {fmtMUR(p.paid)}
                        </td>
                        <td className="px-4 py-3 text-right text-black">
                          {fmtMUR(p.codExpected)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-black">
                          {fmtMUR(p.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No product sales yet."
                hint="Once you receive orders, top products will appear here."
              />
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-[24px] border-black/10 bg-white">
          <CardHeader className="flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-black">
              <ShoppingBag className="h-4 w-4 text-[#ff7fa8]" />
              Top Categories ({days} days)
            </CardTitle>

            <Button
              asChild
              variant="outline"
              className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02]"
            >
              <Link href="/admin/categories">
                View <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="px-0">
            {topCategories.length ? (
              <div className="overflow-auto">
                <table className="min-w-[560px] w-full text-sm">
                  <thead className="bg-black/[0.02] text-black/60">
                    <tr className="border-b border-black/10">
                      <th className="px-4 py-2 text-left font-medium">Category</th>
                      <th className="px-4 py-2 text-right font-medium">Paid</th>
                      <th className="px-4 py-2 text-right font-medium">COD</th>
                      <th className="px-4 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCategories.map((c) => (
                      <tr
                        key={c.category_id}
                        className="border-b border-black/10 transition hover:bg-black/[0.02]"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-black">{c.name}</div>
                          <div className="text-xs text-black/55">{c.slug}</div>
                        </td>
                        <td className="px-4 py-3 text-right text-black">
                          {fmtMUR(c.paid)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge className="rounded-2xl border border-black/10 bg-[#f6f0ff] text-black hover:bg-[#f6f0ff]">
                            {fmtMUR(c.codExpected)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-black">
                          {fmtMUR(c.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No category performance yet."
                hint="Create products and place orders to generate stats."
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}