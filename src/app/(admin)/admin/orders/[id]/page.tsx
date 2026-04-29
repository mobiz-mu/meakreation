"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  RefreshCw,
  ShoppingBag,
  ArrowLeft,
  MapPin,
  CreditCard,
  User,
  Package,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES = [
  "PENDING",
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

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
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

type OrderItemRow = {
  id: string;
  title: string;
  variant_label: string | null;
  qty: number;
  unit_price_mur: number;
  line_total_mur: number;
  image_url: string | null;
  sku: string | null;
};

type OrderRow = {
  id: string;
  order_no: string;
  created_at: string;
  status: string;
  payment_method: string | null;
  payment_status: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string | null;
  district: string | null;
  postal_code: string | null;
  country: string;
  subtotal_mur: number;
  shipping_price_mur: number;
  discount_mur: number;
  total_mur: number;
  notes: string | null;
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [status, setStatus] = useState<string>("PROCESSING");

  async function load() {
    if (!id) return;

    setLoading(true);
    setErr(null);

    try {
      const sess = await supabase.auth.getSession();
      const token = sess.data.session?.access_token;

      if (!token) {
        setErr("Your session has expired. Please sign in again.");
        router.replace(`/admin/login?next=${encodeURIComponent(`/admin/orders/${id}`)}`);
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/admin/orders/get?id=${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          setErr("Your session has expired. Please sign in again.");
          router.replace(`/admin/login?next=${encodeURIComponent(`/admin/orders/${id}`)}`);
          setLoading(false);
          return;
        }

        throw new Error(json?.error || "Failed to load order.");
      }

      setOrder(json.order ?? null);
      setItems(json.items ?? []);
      setStatus(json.order?.status ?? "PROCESSING");
    } catch (e: any) {
      setErr(e?.message || "Failed to load order.");
      setOrder(null);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(next: string) {
    if (!id) return;

    setSaving(true);
    setErr(null);

    try {
      const sess = await supabase.auth.getSession();
      const token = sess.data.session?.access_token;

      if (!token) {
        setErr("Your session has expired. Please sign in again.");
        router.replace(`/admin/login?next=${encodeURIComponent(`/admin/orders/${id}`)}`);
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/admin/orders/update-status`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: next }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) {
          setErr("Your session has expired. Please sign in again.");
          router.replace(`/admin/login?next=${encodeURIComponent(`/admin/orders/${id}`)}`);
          setSaving(false);
          return;
        }

        throw new Error(json?.error || "Failed to update order status.");
      }

      setOrder((prev) => (prev ? { ...prev, status: next } : prev));
      setStatus(next);
    } catch (e: any) {
      setErr(e?.message || "Failed to update order status.");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const totals = useMemo(() => {
    if (!order) return null;
    return {
      subtotal: order.subtotal_mur ?? 0,
      shipping: order.shipping_price_mur ?? 0,
      discount: order.discount_mur ?? 0,
      total: order.total_mur ?? 0,
    };
  }, [order]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-1 py-2 text-sm text-black/60">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        {err ? (
          <Card className="rounded-2xl border border-red-200 bg-white">
            <CardContent className="py-4 text-sm text-red-600">{err}</CardContent>
          </Card>
        ) : null}

        <Card className="rounded-[24px] border-black/10 bg-white">
          <CardContent className="py-10 text-center text-sm text-black/55">
            Order not found.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* top bar */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-sm text-black/60 transition hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#fff4f8] px-3 py-1.5 text-[12px] text-black/70">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff7fa8]" />
            Order Detail
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
            #{order.order_no}
          </h1>

          <p className="mt-1 text-sm text-black/60">
            Created on {formatDate(order.created_at)}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Badge
            className={cx(
              "rounded-2xl border px-3 py-1.5 hover:opacity-100",
              orderStatusClass(order.status)
            )}
          >
            {order.status}
          </Badge>

          <Select value={status} onValueChange={(v) => updateStatus(v)} disabled={saving}>
            <SelectTrigger className="w-full rounded-2xl border-black/10 bg-white sm:w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02]"
            onClick={load}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {saving ? "Saving..." : "Refresh"}
          </Button>
        </div>
      </div>

      {err ? (
        <Card className="rounded-2xl border border-red-200 bg-white">
          <CardContent className="py-4 text-sm text-red-600">{err}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.95fr]">
        {/* left side */}
        <div className="space-y-4">
          <Card className="rounded-[24px] border-black/10 bg-white shadow-[0_18px_50px_-38px_rgba(0,0,0,0.18)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-black">
                <Package className="h-4 w-4 text-[#ff7fa8]" />
                Order Items
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              {items.length ? (
                items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center gap-4 rounded-[20px] border border-black/10 bg-white p-3 transition hover:bg-black/[0.015]"
                  >
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02]">
                      {it.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={it.image_url}
                          alt={it.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[11px] text-black/45">No image</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-black">{it.title}</div>

                      <div className="mt-1 text-xs leading-5 text-black/55">
                        {it.variant_label ? <>Variant: {it.variant_label} • </> : null}
                        Qty: {it.qty} • Unit: {fmtMUR(it.unit_price_mur)}
                        {it.sku ? <> • SKU: {it.sku}</> : null}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-black">
                        {fmtMUR(it.line_total_mur)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-sm text-black/55">No items found for this order.</div>
              )}
            </CardContent>
          </Card>

          {order.notes ? (
            <Card className="rounded-[24px] border-black/10 bg-white shadow-[0_18px_50px_-38px_rgba(0,0,0,0.18)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-black">Order Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm leading-7 text-black/70">
                  {order.notes}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* right side */}
        <div className="space-y-4">
          <Card className="rounded-[24px] border-black/10 bg-white shadow-[0_18px_50px_-38px_rgba(0,0,0,0.18)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-black">
                <User className="h-4 w-4 text-[#ff7fa8]" />
                Customer
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-black">
                  {order.first_name} {order.last_name}
                </div>
                <div className="mt-1 text-black/60">{order.email}</div>
                <div className="mt-1 text-black/60">
                  {order.phone}
                  {order.whatsapp ? ` • WhatsApp: ${order.whatsapp}` : ""}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-black/10 bg-white shadow-[0_18px_50px_-38px_rgba(0,0,0,0.18)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-black">
                <MapPin className="h-4 w-4 text-[#ff7fa8]" />
                Delivery Address
              </CardTitle>
            </CardHeader>

            <CardContent className="text-sm">
              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 leading-7 text-black/70">
                <div>{order.address_line1}</div>
                {order.address_line2 ? <div>{order.address_line2}</div> : null}
                <div>{[order.city, order.district, order.postal_code].filter(Boolean).join(", ")}</div>
                <div>{order.country}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-black/10 bg-white shadow-[0_18px_50px_-38px_rgba(0,0,0,0.18)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-black">
                <CreditCard className="h-4 w-4 text-[#ff7fa8]" />
                Payment & Totals
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-2xl border border-black/10 bg-white text-black hover:bg-white">
                  {order.payment_method ?? "-"}
                </Badge>

                <Badge
                  className={cx(
                    "rounded-2xl border hover:opacity-100",
                    paymentStatusClass(order.payment_status)
                  )}
                >
                  {order.payment_status ?? "UNPAID"}
                </Badge>
              </div>

              {totals ? (
                <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-black/55">Subtotal</span>
                    <span className="font-medium text-black">{fmtMUR(totals.subtotal)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-black/55">Shipping</span>
                    <span className="font-medium text-black">{fmtMUR(totals.shipping)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-black/55">Discount</span>
                    <span className="font-medium text-black">- {fmtMUR(totals.discount)}</span>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-black/10 pt-3">
                    <span className="font-semibold text-black">Total</span>
                    <span className="text-lg font-semibold text-black">
                      {fmtMUR(totals.total)}
                    </span>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}