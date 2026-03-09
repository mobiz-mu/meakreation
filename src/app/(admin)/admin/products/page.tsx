"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Plus, ArrowUpRight } from "lucide-react";

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  base_price_mur: number;
  is_active: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  sort_order: number;
  created_at: string;
};

function fmtMUR(n?: number) {
  const x = Number.isFinite(Number(n)) ? Number(n) : 0;
  return `Rs ${x.toLocaleString("en-MU")}`;
}

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load(nextQ?: string) {
    setLoading(true);
    setErr(null);
    try {
      const sess = await supabase.auth.getSession();
      const token = sess.data.session?.access_token;
      if (!token) throw new Error("Not logged in");

      const qq = (typeof nextQ === "string" ? nextQ : q).trim();
      const res = await fetch(
        `/api/admin/products/list?q=${encodeURIComponent(qq)}&limit=150`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setItems(json.items ?? []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load products");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((x) => x.is_active).length;
    const featured = items.filter((x) => x.is_featured).length;
    const best = items.filter((x) => x.is_best_seller).length;
    return { total, active, featured, best };
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Title row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-1.5 text-[12px] text-black/60 shadow-[0_10px_30px_-25px_rgba(0,0,0,0.25)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff6fa0]" />
            Products
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-black">
            Manage Products
          </h1>
          <p className="text-sm text-black/60 mt-1">
            Search, edit details, upload images, and control visibility.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02] text-black"
            onClick={() => load()}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Refresh
          </Button>

          {/* Optional: if you have a create page later */}
          <Button
            asChild
            className="rounded-2xl bg-[#ff6fa0] text-white hover:bg-[#ff4f8c]"
          >
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" /> New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="rounded-[22px] border-black/10 bg-white">
          <CardContent className="p-4">
            <div className="text-[12px] text-black/55">Total</div>
            <div className="mt-1 text-xl font-semibold text-black">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="rounded-[22px] border-black/10 bg-white">
          <CardContent className="p-4">
            <div className="text-[12px] text-black/55">Active</div>
            <div className="mt-1 text-xl font-semibold text-black">{stats.active}</div>
          </CardContent>
        </Card>
        <Card className="rounded-[22px] border-black/10 bg-white">
          <CardContent className="p-4">
            <div className="text-[12px] text-black/55">Featured</div>
            <div className="mt-1 text-xl font-semibold text-black">{stats.featured}</div>
          </CardContent>
        </Card>
        <Card className="rounded-[22px] border-black/10 bg-white">
          <CardContent className="p-4">
            <div className="text-[12px] text-black/55">Best Seller</div>
            <div className="mt-1 text-xl font-semibold text-black">{stats.best}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="rounded-[26px] border-black/10 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-black">Search</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col sm:flex-row gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              load();
            }}
          >
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-black/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                className="h-11 rounded-2xl border-black/10 bg-white pl-10 text-black placeholder:text-black/40"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by title, slug, sku…"
              />
            </div>
            <Button
              className="h-11 rounded-2xl bg-black text-white hover:bg-black/90"
              type="submit"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Search
            </Button>
          </form>

          {err ? (
            <div className="mt-3 text-sm text-red-600">{err}</div>
          ) : null}
        </CardContent>
      </Card>

      {/* Desktop table */}
      <Card className="rounded-[26px] border-black/10 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-black">Products</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {/* Desktop */}
          <div className="hidden lg:block overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-black/60">
                <tr className="border-b border-black/10 bg-black/[0.02]">
                  <th className="py-3 px-4 text-left font-medium">Title</th>
                  <th className="py-3 px-4 text-left font-medium">Slug</th>
                  <th className="py-3 px-4 text-left font-medium">Flags</th>
                  <th className="py-3 px-4 text-right font-medium">Price</th>
                  <th className="py-3 px-4 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-black/10 last:border-b-0 hover:bg-black/[0.02] transition">
                    <td className="py-3 px-4">
                      <div className="font-medium text-black">{p.title}</div>
                      <div className="text-xs text-black/45">
                        Sort: {p.sort_order ?? 0} • {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-black/70">{p.slug}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          className={cx(
                            "rounded-2xl border",
                            p.is_active
                              ? "bg-[#ecfff5] text-[#0b7a42] border-[#0b7a42]/15"
                              : "bg-[#fff1f3] text-[#b42318] border-[#b42318]/15"
                          )}
                        >
                          {p.is_active ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                        {p.is_featured ? (
                          <Badge className="rounded-2xl bg-[#ffe6ef] text-black border border-black/10">
                            FEATURED
                          </Badge>
                        ) : null}
                        {p.is_best_seller ? (
                          <Badge className="rounded-2xl bg-black text-white border border-black">
                            BEST SELLER
                          </Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-black">
                      {fmtMUR(p.base_price_mur)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02] text-black"
                      >
                        <Link href={`/admin/products/${p.id}`}>
                          Edit <ArrowUpRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}

                {!items.length ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-black/55">
                      {loading ? "Loading…" : "No products found."}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden p-4 space-y-3">
            {items.map((p) => (
              <div key={p.id} className="rounded-[22px] border border-black/10 bg-white p-4 shadow-[0_16px_55px_-45px_rgba(0,0,0,0.25)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-black truncate">{p.title}</div>
                    <div className="text-xs text-black/55 truncate">{p.slug}</div>
                  </div>
                  <div className="text-right font-semibold text-black">{fmtMUR(p.base_price_mur)}</div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge
                    className={cx(
                      "rounded-2xl border",
                      p.is_active
                        ? "bg-[#ecfff5] text-[#0b7a42] border-[#0b7a42]/15"
                        : "bg-[#fff1f3] text-[#b42318] border-[#b42318]/15"
                    )}
                  >
                    {p.is_active ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                  {p.is_featured ? (
                    <Badge className="rounded-2xl bg-[#ffe6ef] text-black border border-black/10">
                      FEATURED
                    </Badge>
                  ) : null}
                  {p.is_best_seller ? (
                    <Badge className="rounded-2xl bg-black text-white border border-black">
                      BEST SELLER
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02] text-black"
                  >
                    <Link href={`/admin/products/${p.id}`}>
                      Edit <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}

            {!items.length ? (
              <div className="py-10 text-center text-black/55">
                {loading ? "Loading…" : "No products found."}
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}