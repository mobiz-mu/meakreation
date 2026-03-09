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
import { Loader2, ArrowLeft, Save, RefreshCw } from "lucide-react";

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

export const dynamic = "force-dynamic";

export default function AdminCategoryDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [cat, setCat] = useState<Category | null>(null);

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

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      if (!id) throw new Error("Missing id");
      const token = await getToken();

      const url = `/api/admin/categories/get?id=${encodeURIComponent(id)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load");

      setCat(json);

      setName(json.name ?? "");
      setSlug(json.slug ?? "");
      setDescription(json.description ?? "");
      setImageUrl(json.image_url ?? "");
      setSortOrder(Number(json.sort_order ?? 0));
      setIsActive(!!json.is_active);
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Save failed");

      setCat(json.item);
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
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading category…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => router.push("/admin/categories")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            {cat?.is_active ? <Badge className="rounded-xl">Active</Badge> : <Badge variant="secondary" className="rounded-xl">Inactive</Badge>}
          </div>

          <h1 className="mt-3 text-2xl font-semibold">Category detail</h1>
          <p className="text-sm text-muted-foreground">
            ID: <span className="font-mono text-xs">{id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl" onClick={load} disabled={saving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload
          </Button>

          <Button className="rounded-xl" onClick={save} disabled={!dirty || saving || !name.trim()}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save
          </Button>
        </div>
      </div>

      {err ? (
        <Card className="rounded-2xl border-red-200">
          <CardContent className="py-4 text-sm text-red-600">{err}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Name</div>
              <Input className="rounded-xl" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Slug</div>
              <Input className="rounded-xl font-mono" value={slug} onChange={(e) => setSlug(e.target.value)} />
              <div className="text-xs text-muted-foreground">
                Store URL can use: <span className="font-mono">/shop?cat={slug || "slug"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Description</div>
              <Textarea className="rounded-xl" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">Sort order</div>
                <Input
                  className="rounded-xl"
                  type="number"
                  value={String(sortOrder)}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Active</div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  Visible in store
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">Image URL</div>
              <Input className="rounded-xl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
            </div>

            {imageUrl ? (
              <div className="rounded-xl border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt={name || "category"} className="w-full h-auto" />
              </div>
            ) : (
              <div className="rounded-xl border p-6 text-sm text-muted-foreground">No image set.</div>
            )}

            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/shop">Preview store</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}