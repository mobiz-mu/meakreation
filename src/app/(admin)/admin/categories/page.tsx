"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  RefreshCw,
  GripVertical,
  Save,
  Power,
  Pencil,
  FolderKanban,
  Boxes,
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

type ProductCountRow = {
  category_id: string | null;
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

export default function AdminCategoriesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [dirtyOrder, setDirtyOrder] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  const [items, setItems] = useState<Category[]>([]);
  const [count, setCount] = useState(0);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  const [dragId, setDragId] = useState<string | null>(null);

  const title = useMemo(
    () => (editing ? "Edit category" : "New category"),
    [editing]
  );

  const stats = useMemo(() => {
    const total = items.length;
    const active = items.filter((x) => x.is_active).length;
    const inactive = items.filter((x) => !x.is_active).length;
    const assignedProducts = Object.values(productCounts).reduce(
      (sum, n) => sum + n,
      0
    );
    return { total, active, inactive, assignedProducts };
  }, [items, productCounts]);

  function resetForm() {
    setEditing(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setSortOrder(0);
    setIsActive(true);
  }

  function openCreate() {
    resetForm();
    setOpen(true);
  }

  function openEditDialog(c: Category) {
    setEditing(c);
    setName(c.name ?? "");
    setSlug(c.slug ?? "");
    setDescription(c.description ?? "");
    setImageUrl(c.image_url ?? "");
    setSortOrder(Number(c.sort_order ?? 0));
    setIsActive(!!c.is_active);
    setOpen(true);
  }

  async function loadProductCounts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("category_id")
        .eq("is_active", true);

      if (error) throw error;

      const counts: Record<string, number> = {};
      ((data ?? []) as ProductCountRow[]).forEach((row) => {
        if (!row.category_id) return;
        counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
      });

      setProductCounts(counts);
    } catch (e) {
      console.error("loadProductCounts error:", e);
      setProductCounts({});
    }
  }

  async function load() {
    setErr(null);
    setLoading(true);
    setDirtyOrder(false);

    try {
      const token = await getToken();
      const url = new URL(`${window.location.origin}/api/admin/categories/list`);
      if (q.trim()) url.searchParams.set("q", q.trim());
      url.searchParams.set("status", status);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load categories");

      const list: Category[] = (json.items ?? []).map((x: any) => ({
        ...x,
        sort_order: Number(x.sort_order ?? 0),
      }));

      list.sort(
        (a, b) =>
          a.sort_order - b.sort_order ||
          String(b.created_at || "").localeCompare(String(a.created_at || ""))
      );

      setItems(list);
      setCount(json.count ?? list.length);

      await loadProductCounts();
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveCategory() {
    setErr(null);
    setSaving(true);

    try {
      const token = await getToken();

      const payload: any = {
        id: editing?.id,
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

      setOpen(false);
      resetForm();
      await load();
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: Category) {
    setErr(null);
    try {
      const token = await getToken();
      const res = await fetch("/api/admin/categories/toggle-active", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: c.id, is_active: !c.is_active }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Toggle failed");

      setItems((prev) =>
        prev.map((x) =>
          x.id === c.id ? { ...x, is_active: !c.is_active } : x
        )
      );
    } catch (e: any) {
      setErr(e?.message || "Toggle failed");
    }
  }

  function moveItem(draggedId: string, overId: string) {
    if (draggedId === overId) return;

    setItems((prev) => {
      const a = [...prev];
      const from = a.findIndex((x) => x.id === draggedId);
      const to = a.findIndex((x) => x.id === overId);
      if (from < 0 || to < 0) return prev;

      const [picked] = a.splice(from, 1);
      a.splice(to, 0, picked);

      const withOrder = a.map((x, idx) => ({
        ...x,
        sort_order: (idx + 1) * 10,
      }));
      setDirtyOrder(true);
      return withOrder;
    });
  }

  async function persistOrder() {
    setErr(null);
    setReordering(true);

    try {
      const token = await getToken();

      const payload = {
        items: items.map((x) => ({
          id: x.id,
          sort_order: Number(x.sort_order || 0),
        })),
      };

      const res = await fetch("/api/admin/categories/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Reorder failed");

      setDirtyOrder(false);
    } catch (e: any) {
      setErr(e?.message || "Reorder failed");
    } finally {
      setReordering(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-1.5 text-[12px] text-black/60 shadow-[0_10px_30px_-25px_rgba(0,0,0,0.25)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff6fa0]" />
            Categories
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
            Manage Categories
          </h1>

          <p className="mt-1 text-sm text-black/60">
            Create categories, reorder them, and assign products so they appear
            automatically on the storefront.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="rounded-2xl" onClick={load}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>

          <Button
            variant={dirtyOrder ? "default" : "outline"}
            className="rounded-2xl"
            onClick={persistOrder}
            disabled={!dirtyOrder || reordering}
          >
            {reordering ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Order
          </Button>

          <Button className="rounded-2xl bg-[#ff6fa0] text-white hover:bg-[#ff4f8c]" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card className="rounded-[22px] border-black/10 bg-white">
          <CardContent className="p-4">
            <div className="text-[12px] text-black/55">Total</div>
            <div className="mt-1 text-xl font-semibold text-black">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[22px] border-black/10 bg-white">
          <CardContent className="p-4">
            <div className="text-[12px] text-black/55">Active</div>
            <div className="mt-1 text-xl font-semibold text-black">
              {stats.active}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[22px] border-black/10 bg-white">
          <CardContent className="p-4">
            <div className="text-[12px] text-black/55">Inactive</div>
            <div className="mt-1 text-xl font-semibold text-black">
              {stats.inactive}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[22px] border-black/10 bg-white">
          <CardContent className="p-4">
            <div className="text-[12px] text-black/55">Assigned Products</div>
            <div className="mt-1 text-xl font-semibold text-black">
              {stats.assignedProducts}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[26px] border-black/10 bg-white">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search category name or slug..."
              className="h-11 rounded-2xl border-black/10"
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant={status === "all" ? "default" : "outline"}
                className="rounded-2xl"
                onClick={() => setStatus("all")}
              >
                All
              </Button>
              <Button
                variant={status === "active" ? "default" : "outline"}
                className="rounded-2xl"
                onClick={() => setStatus("active")}
              >
                Active
              </Button>
              <Button
                variant={status === "inactive" ? "default" : "outline"}
                className="rounded-2xl"
                onClick={() => setStatus("inactive")}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {err ? (
        <Card className="rounded-2xl border-red-200">
          <CardContent className="py-4 text-sm text-red-600">{err}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {loading ? (
          <Card className="rounded-[26px] border-black/10 bg-white lg:col-span-2">
            <CardContent className="py-10 text-center text-black/55">
              <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
              Loading categories…
            </CardContent>
          </Card>
        ) : items.length ? (
          items.map((c) => {
            const assigned = productCounts[c.id] ?? 0;

            return (
              <div
                key={c.id}
                draggable
                onDragStart={() => setDragId(c.id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragId) moveItem(dragId, c.id);
                  setDragId(null);
                }}
                className="rounded-[26px] border border-black/10 bg-white p-4 shadow-[0_18px_55px_-45px_rgba(0,0,0,0.22)] transition hover:-translate-y-[1px]"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-black/10 bg-[#fff1f6] text-[#ff6fa0]">
                    <FolderKanban className="h-6 w-6" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="cursor-grab text-black/35">
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <Link
                            href={`/admin/categories/${c.id}`}
                            className="truncate text-lg font-semibold text-black hover:underline"
                          >
                            {c.name}
                          </Link>
                        </div>

                        <div className="mt-1 font-mono text-xs text-black/45">
                          {c.slug}
                        </div>

                        {c.description ? (
                          <div className="mt-2 line-clamp-2 text-sm text-black/60">
                            {c.description}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {c.is_active ? (
                          <Badge className="rounded-2xl">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="rounded-2xl">
                            Inactive
                          </Badge>
                        )}

                        <Badge variant="outline" className="rounded-2xl">
                          Order {c.sort_order}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-black/60">
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-black/[0.02] px-3 py-2">
                        <Boxes className="h-4 w-4" />
                        <span>
                          {assigned} product{assigned === 1 ? "" : "s"} assigned
                        </span>
                      </div>

                      {c.image_url ? (
                        <div className="truncate text-xs text-black/45">
                          Image set
                        </div>
                      ) : (
                        <div className="truncate text-xs text-black/45">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="rounded-2xl"
                        asChild
                      >
                        <Link href={`/admin/categories/${c.id}`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Detail
                        </Link>
                      </Button>

                      <Button
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => openEditDialog(c)}
                      >
                        Quick Edit
                      </Button>

                      <Button
                        variant="outline"
                        className="rounded-2xl"
                        onClick={() => toggleActive(c)}
                      >
                        <Power className="mr-2 h-4 w-4" />
                        {c.is_active ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <Card className="rounded-[26px] border-black/10 bg-white lg:col-span-2">
            <CardContent className="py-10 text-center text-black/55">
              No categories found.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-sm font-medium">Name</div>
              <Input
                value={name}
                onChange={(e) => {
                  const v = e.target.value;
                  setName(v);
                  if (!editing && !slug.trim()) setSlug(slugify(v));
                }}
                className="rounded-xl"
                placeholder="e.g. Bags"
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Slug</div>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-xl font-mono"
                placeholder="e.g. bags"
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Image URL</div>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="rounded-xl"
                placeholder="https://..."
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Description</div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl"
                placeholder="Optional"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">Sort Order</div>
                <Input
                  type="number"
                  value={String(sortOrder)}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="rounded-xl"
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
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              className="rounded-xl"
              onClick={saveCategory}
              disabled={saving || !name.trim()}
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}