"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  RefreshCw,
  ShoppingBag,
  Search,
  ArrowUpRight,
} from "lucide-react";

type OrderRow = {
  id: string;
  order_no: string;
  status: string;
  payment_method: string | null;
  payment_status: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  total_mur: number;
  created_at: string;
};

const STATUSES = [
  "ALL",
  "PENDING",
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
];

function fmtMUR(n: number) {
  const x = Number.isFinite(n) ? n : 0;
  return `Rs ${x.toLocaleString("en-MU")}`;
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

function statusClass(status?: string | null) {
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

function paymentClass(status?: string | null) {
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

export default function AdminOrdersPage() {
  const router = useRouter();

  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const filtered = useMemo(() => items, [items]);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const sess = await supabase.auth.getSession();
      const token = sess.data.session?.access_token;

      if (!token) {
        setErr("Your session has expired. Please sign in again.");
        setItems([]);
        router.replace(`/admin/login?next=${encodeURIComponent("/admin/orders")}`);
        setLoading(false);
        setBootLoading(false);
        return;
      }

      const url = `/api/admin/orders/list?status=${encodeURIComponent(
        status
      )}&q=${encodeURIComponent(q)}&limit=100`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          setErr("Your session has expired. Please sign in again.");
          router.replace(`/admin/login?next=${encodeURIComponent("/admin/orders")}`);
          setItems([]);
          setLoading(false);
          setBootLoading(false);
          return;
        }

        throw new Error(json?.error || "Failed to load orders.");
      }

      setItems(json.items ?? []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load orders.");
      setItems([]);
    } finally {
      setLoading(false);
      setBootLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onApplyFilters() {
    load();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#fff4f8] px-3 py-1.5 text-[12px] text-black/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff7fa8]" />
            Order Management
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
            Orders
          </h1>
          <p className="mt-1 text-sm text-black/60">
            Filter, review, and manage customer orders from the Mea Kréation dashboard.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02]"
            onClick={load}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {err ? (
        <Card className="rounded-2xl border border-red-200 bg-white">
          <CardContent className="py-4 text-sm text-red-600">{err}</CardContent>
        </Card>
      ) : null}

      {/* Filters */}
      <Card className="rounded-[24px] border-black/10 bg-white shadow-[0_18px_50px_-38px_rgba(0,0,0,0.18)]">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-black">
            <Search className="h-4 w-4 text-[#ff7fa8]" />
            Filters
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="w-full md:w-[260px]">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="rounded-2xl border-black/10 bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Input
            className="rounded-2xl border-black/10 bg-white"
            placeholder="Search by order no, email, or phone..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <Button
            className="rounded-2xl bg-[#ffb3cc] text-black hover:bg-[#ffa0bf]"
            onClick={onApplyFilters}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
          </Button>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="rounded-[24px] border-black/10 bg-white shadow-[0_18px_50px_-38px_rgba(0,0,0,0.18)]">
        <CardHeader className="flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-black">
            <ShoppingBag className="h-4 w-4 text-[#ff7fa8]" />
            Latest Orders
          </CardTitle>

          <div className="text-xs text-black/55">
            {filtered.length} order{filtered.length === 1 ? "" : "s"}
          </div>
        </CardHeader>

        <CardContent className="px-0">
          {bootLoading ? (
            <div className="flex items-center gap-3 px-6 py-10 text-sm text-black/60">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading orders...
            </div>
          ) : filtered.length ? (
            <div className="overflow-auto">
              <table className="min-w-[980px] w-full text-sm">
                <thead className="bg-black/[0.02] text-black/60">
                  <tr className="border-b border-black/10">
                    <th className="px-4 py-3 text-left font-medium">Order</th>
                    <th className="px-4 py-3 text-left font-medium">Customer</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Payment</th>
                    <th className="px-4 py-3 text-right font-medium">Total</th>
                    <th className="px-4 py-3 text-right font-medium">Open</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-black/10 transition hover:bg-black/[0.02]"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-black">#{o.order_no}</div>
                        <div className="text-xs text-black/50">
                          {formatDate(o.created_at)}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-black">
                          {o.first_name} {o.last_name}
                        </div>
                        <div className="text-xs text-black/55">
                          {o.email} • {o.phone}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge
                          className={cn(
                            "rounded-2xl border hover:opacity-100",
                            statusClass(o.status)
                          )}
                        >
                          {o.status}
                        </Badge>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="text-xs font-medium text-black">
                            {o.payment_method ?? "-"}
                          </div>
                          <div>
                            <Badge
                              className={cn(
                                "rounded-2xl border hover:opacity-100",
                                paymentClass(o.payment_status)
                              )}
                            >
                              {o.payment_status ?? "-"}
                            </Badge>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-black">
                        {fmtMUR(o.total_mur)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Button
                          asChild
                          variant="outline"
                          className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02]"
                        >
                          <Link href={`/admin/orders/${o.id}`}>
                            View <ArrowUpRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-10 text-center text-sm text-black/55">
              No orders found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}