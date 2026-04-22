"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowLeft,
  Save,
  RefreshCw,
  Boxes,
  ExternalLink,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

type AssignedProduct = {
  id: string;
  title: string;
  slug: string;
  base_price_mur: number | null;
  is_active: boolean;
  category_id: string | null;
  created_at?: string;
};

async function getToken() {
  const sess = await supabase.auth.getSession();
  const token = sess.data.session?.access_token;
  if (!token) throw new Error("Not logged in");
  return token;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fmtMUR(n?: number | null) {
  const x = Number.isFinite(Number(n)) ? Number(n) : 0;
  return `Rs ${x.toLocaleString("en-MU")}`;
}

export const dynamic = "force-dynamic";

export default function AdminCategoryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [cat, setCat] = useState<Category | null>(null);
  const [products, setProducts] = useState<AssignedProduct[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  const dirty = useMemo(() => {
    if (!cat) return false;
    return (
      name !== (cat.name ?? "") ||
      slug !== (cat.slug ?? "") ||
      description !== (cat.description ?? "") ||
      imageUrl !== (cat.image_url ?? "") ||
      Number(sortOrder) !== Number(cat.sort_order ?? 0) ||
      Boolean(isActive) !== Boolean(cat.is_active)
    );
  }, [cat, name, slug, description, imageUrl, sortOrder, isActive]);

  async function loadProducts(categoryId: string) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id,title,slug,base_price_mur,is_active,category_id,created_at")
        .eq("category_id", categoryId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProducts((data ?? []) as AssignedProduct[]);
    } catch (e) {
      console.error("loadProducts error:", e);
      setProducts([]);
    }
  }

  async function load() {
    setErr(null);
    setLoading(true);

    try {
      if (!id) throw new Error("Missing id");
      const token = await getToken();

      const url = `/api/admin/categories/get?id=${encodeURIComponent(id)}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load");

      setCat(json);

      setName(json.name ?? "");
      setSlug(json.slug ?? "");
      setDescription(json.description ?? "");
      setImageUrl(json.image_url ?? "");
      setSortOrder(Number(json.sort_order ?? 0));
      setIsActive(!!json.is_active);

      await loadProducts(json.id);
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    setErr(null);
    setSaving(true);

    try {
      if (!id) throw new Error("Missing id");
      const token = await getToken();

      const payload = {
        id,
        name: name.trim(),
        slug: slug.trim() ? slugify(slug.trim()) : slugify(name.trim()),
        description: description.trim() ? description.trim() : null,
        image_url: imageUrl.trim() ? imageUrl.trim() : null,
        sort_order: Number(sortOrder) || 0,
        is_active: !!isActive,
      };

      const res = await fetch("/api/admin/categories/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Save failed");

      setCat(json.item ?? payload);
      await load();
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading category…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-2xl"
              onClick={() => router.push("/admin/categories")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {cat?.is_active ? (
              <Badge className="rounded-2xl">Active</Badge>
            ) : (
              <Badge variant="secondary" className="rounded-2xl">
                Inactive
              </Badge>
            )}
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
            Category Detail
          </h1>

          <p className="mt-1 text-sm text-black/55">
            Slug: <span className="font-mono">{slug || "—"}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="rounded-2xl"
            onClick={load}
            disabled={saving}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reload
          </Button>

          <Button
            className="rounded-2xl bg-[#ff6fa0] text-white hover:bg-[#ff4f8c]"
            onClick={save}
            disabled={!dirty || saving || !name.trim()}
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {err ? (
        <Card className="rounded-2xl border-red-200">
          <CardContent className="py-4 text-sm text-red-600">{err}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-[26px] border-black/10 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Name</div>
              <Input
                className="rounded-xl"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Slug</div>
              <Input
                className="rounded-xl font-mono"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <div className="text-xs text-black/45">
                Frontend page:{" "}
                <span className="font-mono">/categories/{slug || "slug"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Description</div>
              <Textarea
                className="rounded-xl"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">Sort Order</div>
                <Input
                  className="rounded-xl"
                  type="number"
                  value={String(sortOrder)}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Active</div>
                <label className="flex items-center gap-2 pt-3 text-sm">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  Visible in store
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[26px] border-black/10 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Image</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">Image URL</div>
              <Input
                className="rounded-xl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            {imageUrl ? (
              <div className="overflow-hidden rounded-xl border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={name || "category"}
                  className="h-auto w-full"
                />
              </div>
            ) : (
              <div className="rounded-xl border p-6 text-sm text-black/45">
                No image set.
              </div>
            )}

            <Button variant="outline" className="rounded-xl" asChild>
              <Link href={`/categories/${slug || ""}`} target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Preview Frontend
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[26px] border-black/10 bg-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Boxes className="h-4 w-4" />
            Products in this Category ({products.length})
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-black/60">
            To make a product appear on this frontend category page, open the
            product in admin and set its <span className="font-medium">category</span>{" "}
            to <span className="font-medium">{name || "this category"}</span>.
          </div>

          {products.length ? (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-black">
                      {product.title}
                    </div>
                    <div className="mt-1 text-xs text-black/45">
                      {product.slug}
                    </div>
                    <div className="mt-2 text-sm text-black/60">
                      {fmtMUR(product.base_price_mur)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {product.is_active ? (
                      <Badge className="rounded-2xl">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="rounded-2xl">
                        Inactive
                      </Badge>
                    )}

                    <Button variant="outline" className="rounded-2xl" asChild>
                      <Link href={`/admin/products/${product.id}`}>
                        Edit Product
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-black/10 p-8 text-center text-sm text-black/55">
              No products assigned yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}