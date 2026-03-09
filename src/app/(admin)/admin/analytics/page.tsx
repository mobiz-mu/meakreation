"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function fmtMUR(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return `Rs ${x.toLocaleString("en-MU")}`;
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topCategories, setTopCategories] = useState<any[]>([]);

  const prodChart = useMemo(
    () =>
      topProducts.slice(0, 10).map((p) => ({
        name: (p.title ?? "Unknown").slice(0, 18),
        revenue_mur: Number(p.revenue_mur ?? 0),
      })),
    [topProducts]
  );

  const catChart = useMemo(
    () =>
      topCategories.slice(0, 10).map((c) => ({
        name: (c.category_name ?? "Uncategorized").slice(0, 18),
        revenue_mur: Number(c.revenue_mur ?? 0),
      })),
    [topCategories]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const sess = await supabase.auth.getSession();
        const token = sess.data.session?.access_token;
        if (!token) throw new Error("Not logged in");

        const res = await fetch("/api/admin/analytics/top-sellers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed");

        setTopProducts(json.topProducts ?? []);
        setTopCategories(json.topCategories ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading analytics…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Top Sellers</h1>
        <p className="text-sm text-muted-foreground">Revenue by product & category (Paid orders only).</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Top Products</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prodChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickMargin={8} />
                <YAxis tickMargin={8} />
                <Tooltip formatter={(v: any) => [fmtMUR(Number(v)), "Revenue"]} />
                <Bar dataKey="revenue_mur" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Top Categories</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickMargin={8} />
                <YAxis tickMargin={8} />
                <Tooltip formatter={(v: any) => [fmtMUR(Number(v)), "Revenue"]} />
                <Bar dataKey="revenue_mur" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-base">Top Products (Table)</CardTitle></CardHeader>
          <CardContent className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 text-left">Product</th>
                  <th className="py-2 text-right">Units</th>
                  <th className="py-2 text-right">Orders</th>
                  <th className="py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.slice(0, 15).map((p) => (
                  <tr key={p.product_id} className="border-b last:border-b-0">
                    <td className="py-2">{p.title ?? "Unknown"}</td>
                    <td className="py-2 text-right">{Number(p.units_sold ?? 0)}</td>
                    <td className="py-2 text-right">{Number(p.orders_count ?? 0)}</td>
                    <td className="py-2 text-right font-semibold">{fmtMUR(Number(p.revenue_mur ?? 0))}</td>
                  </tr>
                ))}
                {!topProducts.length && (
                  <tr><td className="py-4 text-center text-muted-foreground" colSpan={4}>No data yet.</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader><CardTitle className="text-base">Top Categories (Table)</CardTitle></CardHeader>
          <CardContent className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 text-left">Category</th>
                  <th className="py-2 text-right">Units</th>
                  <th className="py-2 text-right">Orders</th>
                  <th className="py-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topCategories.slice(0, 15).map((c) => (
                  <tr key={c.category_id ?? c.category_name} className="border-b last:border-b-0">
                    <td className="py-2">{c.category_name ?? "Uncategorized"}</td>
                    <td className="py-2 text-right">{Number(c.units_sold ?? 0)}</td>
                    <td className="py-2 text-right">{Number(c.orders_count ?? 0)}</td>
                    <td className="py-2 text-right font-semibold">{fmtMUR(Number(c.revenue_mur ?? 0))}</td>
                  </tr>
                ))}
                {!topCategories.length && (
                  <tr><td className="py-4 text-center text-muted-foreground" colSpan={4}>No data yet.</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}