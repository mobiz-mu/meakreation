"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, RefreshCw, GripVertical, Save, Power, Pencil } from "lucide-react";

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

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  // drag state
  const [dragId, setDragId] = useState<string | null>(null);

  const title = useMemo(() => (editing ? "Edit category" : "New category"), [editing]);

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

      // Ensure sorted by sort_order then created_at
      list.sort((a, b) => (a.sort_order - b.sort_order) || String(b.created_at || "").localeCompare(String(a.created_at || "")));

      setItems(list);
      setCount(json.count ?? list.length);
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: c.id, is_active: !c.is_active }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Toggle failed");

      setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_active: !c.is_active } : x)));
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

      // Recompute sort_order as 10,20,30...
      const withOrder = a.map((x, idx) => ({ ...x, sort_order: (idx + 1) * 10 }));
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
        items: items.map((x) => ({ id: x.id, sort_order: Number(x.sort_order || 0) })),
      };

      const res = await fetch("/api/admin/categories/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  // Reload on filter change (debounced)
  useEffect(() => {
    const t = setTimeout(() => load(), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Drag to reorder. Click a row to open detail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name or slug…"
            className="w-[240px] rounded-xl"
          />

          <div className="flex items-center gap-2">
            <Button variant={status === "all" ? "default" : "outline"} className="rounded-xl" onClick={() => setStatus("all")}>
              All
            </Button>
            <Button
              variant={status === "active" ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setStatus("active")}
            >
              Active
            </Button>
            <Button
              variant={status === "inactive" ? "default" : "outline"}
              className="rounded-xl"
              onClick={() => setStatus("inactive")}
            >
              Inactive
            </Button>
          </div>

          <Button variant="outline" className="rounded-xl" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>

          <Button className="rounded-xl" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>

          <Button
            className="rounded-xl"
            variant={dirtyOrder ? "default" : "outline"}
            onClick={persistOrder}
            disabled={!dirtyOrder || reordering}
            title="Save ordering"
          >
            {reordering ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save order
          </Button>
        </div>
      </div>

      {err ? (
        <Card className="rounded-2xl border-red-200">
          <CardContent className="py-4 text-sm text-red-600">{err}</CardContent>
        </Card>
      ) : null}

      <Card className="rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Categories ({count})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th className="py-2 text-left w-[44px]"> </th>
                <th className="py-2 text-left">Name</th>
                <th className="py-2 text-left">Slug</th>
                <th className="py-2 text-right">Order</th>
                <th className="py-2 text-right">Status</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                    Loading…
                  </td>
                </tr>
              ) : items.length ? (
                items.map((c) => (
                  <tr
                    key={c.id}
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (dragId) moveItem(dragId, c.id);
                      setDragId(null);
                    }}
                    className="border-b last:border-b-0 hover:bg-muted/40 transition"
                  >
                    <td className="py-2">
                      <div className="inline-flex items-center gap-2 text-muted-foreground cursor-grab">
                        <GripVertical className="h-4 w-4" />
                      </div>
                    </td>

                    <td className="py-2">
                      <Link href={`/admin/categories/${c.id}`} className="font-medium hover:underline">
                        {c.name}
                      </Link>
                      {c.description ? (
                        <div className="text-xs text-muted-foreground line-clamp-1">{c.description}</div>
                      ) : null}
                    </td>

                    <td className="py-2 font-mono text-xs">{c.slug}</td>

                    <td className="py-2 text-right">{Number(c.sort_order ?? 0)}</td>

                    <td className="py-2 text-right">
                      {c.is_active ? (
                        <Badge className="rounded-xl">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-xl">
                          Inactive
                        </Badge>
                      )}
                    </td>

                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" className="rounded-xl" asChild>
                          <Link href={`/admin/categories/${c.id}`}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Detail
                          </Link>
                        </Button>
                        <Button variant="outline" className="rounded-xl" onClick={() => openEditDialog(c)}>
                          Quick edit
                        </Button>
                        <Button variant="outline" className="rounded-xl" onClick={() => toggleActive(c)}>
                          <Power className="h-4 w-4 mr-2" />
                          {c.is_active ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-muted-foreground">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-4 flex justify-between text-xs text-muted-foreground">
            <span>Drag rows to reorder, then click “Save order”.</span>
            <span>Sort order is auto set to 10,20,30…</span>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit dialog */}
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
                placeholder="e.g. New Arrivals"
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Slug</div>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-xl font-mono"
                placeholder="e.g. new-arrivals"
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
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  Visible in store
                </label>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button className="rounded-xl" onClick={saveCategory} disabled={saving || !name.trim()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}