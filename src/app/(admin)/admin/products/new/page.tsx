"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import {
  Loader2,
  Save,
  Upload,
  ArrowLeft,
  Image as ImageIcon,
  X,
} from "lucide-react";

function fmtMUR(n?: number) {
  const x = Number.isFinite(Number(n)) ? Number(n) : 0;
  return `Rs ${x.toLocaleString("en-MU")}`;
}

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const RECOMMENDED = {
  aspect: "4:5",
  width: 1200,
  height: 1500,
  maxMB: 3,
  formats: "JPG / PNG / WebP",
};

type UploadedRow = {
  id: string;
  image_url: string;
  is_primary?: boolean;
};

type PendingFile = {
  id: string;
  file: File;
  previewUrl: string;
  note?: string;
};

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

export default function AdminProductNewPage() {
  const router = useRouter();

  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");

  const [basePrice, setBasePrice] = useState<number>(0);
  const [compareAt, setCompareAt] = useState<number>(0);

  const [categoryId, setCategoryId] = useState<string>("");

  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [sortOrder, setSortOrder] = useState<number>(0);

  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [createdId, setCreatedId] = useState<string | null>(null);
  const [images, setImages] = useState<UploadedRow[]>([]);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  useEffect(() => {
    return () => {
      for (const p of pending) {
        URL.revokeObjectURL(p.previewUrl);
      }
    };
  }, [pending]);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setCategoriesLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id,name,slug,is_active,sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories((data ?? []) as CategoryOption[]);
    } catch (e: any) {
      console.error("loadCategories error:", e);
    } finally {
      setCategoriesLoading(false);
    }
  }

  const flags = useMemo(() => {
    const list: Array<{ label: string; kind: "ok" | "pink" | "black" }> = [];
    list.push({ label: isActive ? "ACTIVE" : "INACTIVE", kind: "ok" });
    if (isFeatured) list.push({ label: "FEATURED", kind: "pink" });
    if (isBestSeller) list.push({ label: "BEST SELLER", kind: "black" });
    return list;
  }, [isActive, isFeatured, isBestSeller]);

  function validateFileBasic(file: File) {
    const maxBytes = RECOMMENDED.maxMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `Large file: ${(file.size / 1024 / 1024).toFixed(1)}MB (max ${RECOMMENDED.maxMB}MB recommended)`;
    }
    return undefined;
  }

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setErr(null);

    const next: PendingFile[] = [];
    for (const f of Array.from(files)) {
      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(f);
      next.push({ id, file: f, previewUrl, note: validateFileBasic(f) });
    }

    setPending((prev) => [...prev, ...next]);
  }

  function removePending(id: string) {
    setPending((prev) => {
      const hit = prev.find((p) => p.id === id);
      if (hit) URL.revokeObjectURL(hit.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  async function createProduct() {
    setErr(null);

    const t = title.trim();
    const s = slugify(slug);

    if (!t) return setErr("Title is required.");
    if (!s) return setErr("Slug is required.");

    setCreating(true);

    try {
      const res = await fetch("/api/admin/products/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: t,
          slug: s,
          sku: sku.trim() || null,
          barcode: barcode.trim() || null,
          base_price_mur: Number(basePrice) || 0,
          compare_at_price_mur:
            Number(compareAt) > 0 ? Number(compareAt) : null,
          category_id: categoryId || null,
          is_active: Boolean(isActive),
          is_featured: Boolean(isFeatured),
          is_best_seller: Boolean(isBestSeller),
          sort_order: Number(sortOrder) || 0,
          short_description: shortDescription.trim() || null,
          description: description.trim() || null,
          seo_title: seoTitle.trim() || null,
          seo_description: seoDescription.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to create product");

      const newId = json?.product?.id as string | undefined;
      if (!newId) {
        throw new Error("Create succeeded but no product id returned.");
      }

      setCreatedId(newId);

      if (pending.length) {
        await uploadPendingImages(newId);
      }
    } catch (e: any) {
      setErr(e?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function uploadPendingImages(productId: string) {
    if (!pending.length) return;

    setUploading(true);
    setErr(null);

    try {
      const currentPending = [...pending];

      for (let i = 0; i < currentPending.length; i++) {
        const pf = currentPending[i];
        await uploadOne(productId, pf.file, i === 0 && images.length === 0);
      }

      setPending((prev) => {
        for (const p of prev) {
          URL.revokeObjectURL(p.previewUrl);
        }
        return [];
      });
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function uploadOne(
    productId: string,
    file: File,
    makePrimary: boolean
  ) {
    const ext = file.name.split(".").pop() || "jpg";
    const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${productId}/${crypto.randomUUID()}.${safeExt}`;

    const { error: upErr } = await supabase.storage.from("products").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type || undefined,
    });

    if (upErr) throw new Error(upErr.message);

    const { data: pub } = supabase.storage.from("products").getPublicUrl(path);
    const image_url = pub.publicUrl;

    const res = await fetch("/api/admin/products/add-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        product_id: productId,
        image_url,
        alt: title || null,
        is_primary: makePrimary,
        storage_bucket: "products",
        bucket: "products",
        storage_path: path,
      }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Failed to add image row");

    setImages((prev) => [...prev, json.image as UploadedRow]);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-1.5 text-[12px] text-black/60 shadow-[0_10px_30px_-25px_rgba(0,0,0,0.25)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff6fa0]" />
            Create Product
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
            New Product
          </h1>

          <p className="mt-1 text-sm text-black/60">
            Add details, assign a category, then upload images.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {flags.map((f) => (
              <Badge
                key={f.label}
                className={cn(
                  "rounded-2xl border",
                  f.kind === "ok" &&
                    (isActive
                      ? "border-[#0b7a42]/15 bg-[#ecfff5] text-[#0b7a42]"
                      : "border-[#b42318]/15 bg-[#fff1f3] text-[#b42318]"),
                  f.kind === "pink" && "border-black/10 bg-[#ffe6ef] text-black",
                  f.kind === "black" && "border-black bg-black text-white"
                )}
              >
                {f.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            asChild
            variant="outline"
            className="rounded-2xl border-black/10 bg-white text-black hover:bg-black/[0.02]"
          >
            <Link href="/admin/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>

          {!createdId ? (
            <Button
              className="rounded-2xl bg-black text-white hover:bg-black/90"
              onClick={createProduct}
              disabled={creating}
              type="button"
            >
              {creating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {creating ? "Creating…" : "Create"}
            </Button>
          ) : (
            <Button
              className="rounded-2xl bg-[#ff6fa0] text-white hover:bg-[#ff4f8c]"
              onClick={() => router.push(`/admin/products/${createdId}`)}
              type="button"
            >
              Continue to Editor
            </Button>
          )}
        </div>
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-[26px] border-black/10 bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base text-black">Product Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-black">Title *</Label>
                <Input
                  className="h-11 rounded-2xl border-black/10"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Handmade Rose Soap"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-black">Slug *</Label>
                <Input
                  className="h-11 rounded-2xl border-black/10"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="handmade-rose-soap"
                />
                <div className="text-xs text-black/45">
                  URL: /shop/{slugify(slug || title)}
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <Label className="text-black">Category</Label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="h-11 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm text-black outline-none"
                >
                  <option value="">
                    {categoriesLoading ? "Loading categories..." : "No category selected"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-black/45">
                  Assigning a category makes this product appear automatically on that frontend category page.
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-black">SKU</Label>
                <Input
                  className="h-11 rounded-2xl border-black/10"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-black">Barcode</Label>
                <Input
                  className="h-11 rounded-2xl border-black/10"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-black">Base Price (MUR)</Label>
                <Input
                  className="h-11 rounded-2xl border-black/10"
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                />
                <div className="text-xs text-black/50">
                  Shown price: {fmtMUR(basePrice)}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-black">Compare-at Price (MUR)</Label>
                <Input
                  className="h-11 rounded-2xl border-black/10"
                  type="number"
                  value={compareAt}
                  onChange={(e) => setCompareAt(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-black">Sort Order</Label>
                <Input
                  className="h-11 rounded-2xl border-black/10"
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <div>
                  <div className="text-sm font-medium text-black">Active</div>
                  <div className="text-xs text-black/55">Visible on shop</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                <div>
                  <div className="text-sm font-medium text-black">Featured</div>
                  <div className="text-xs text-black/55">Homepage sections</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                <Switch checked={isBestSeller} onCheckedChange={setIsBestSeller} />
                <div>
                  <div className="text-sm font-medium text-black">Best Seller</div>
                  <div className="text-xs text-black/55">Best sellers list</div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-black">Short Description</Label>
              <Textarea
                className="min-h-[90px] rounded-2xl border-black/10"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Short summary shown in cards / listings."
              />
            </div>

            <div className="space-y-1">
              <Label className="text-black">Description</Label>
              <Textarea
                className="min-h-[160px] rounded-2xl border-black/10"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Full description shown on the product page."
              />
            </div>

            <div className="rounded-[22px] border border-black/10 bg-white p-4">
              <div className="text-sm font-semibold text-black">SEO</div>
              <div className="mt-1 text-xs text-black/55">
                Used for Google and social previews.
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-black">SEO Title</Label>
                  <Input
                    className="h-11 rounded-2xl border-black/10"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-black">SEO Description</Label>
                  <Input
                    className="h-11 rounded-2xl border-black/10"
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {createdId ? (
              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-black/70">
                Product created: <span className="font-semibold">{createdId}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-[26px] border-black/10 bg-white">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base text-black">
                <ImageIcon className="h-4 w-4 text-black/60" />
                Images
              </CardTitle>

              <div className="mt-1 text-[11px] leading-snug text-black/55">
                Recommended:{" "}
                <span className="font-medium">
                  {RECOMMENDED.width}×{RECOMMENDED.height}px
                </span>{" "}
                (<span className="font-medium">{RECOMMENDED.aspect}</span>) •{" "}
                <span className="font-medium">≤ {RECOMMENDED.maxMB}MB</span> •{" "}
                {RECOMMENDED.formats}
              </div>
            </div>

            <Button
              variant="outline"
              className="rounded-2xl border-black/10 bg-white text-black hover:bg-black/[0.02]"
              onClick={() => fileRef.current?.click()}
              type="button"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </CardHeader>

          <CardContent className="space-y-3">
            {pending.length ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-black">
                  Selected (ready to upload)
                </div>

                {pending.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-2"
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-xl border border-black/10 bg-black/[0.04]">
                      <img
                        src={p.previewUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs text-black">{p.file.name}</div>
                      <div className="mt-1 text-[11px] text-black/55">
                        {(p.file.size / 1024 / 1024).toFixed(2)}MB{" "}
                        {p.note ? `• ${p.note}` : ""}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removePending(p.id)}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 hover:bg-black/[0.03]"
                      aria-label="Remove image"
                    >
                      <X className="h-4 w-4 text-black/60" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-black/60">
                No images selected yet. Click Upload to add images.
              </div>
            )}

            {images.length ? (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-semibold text-black">Uploaded</div>

                {images.map((img) => (
                  <div
                    key={img.id}
                    className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-2"
                  >
                    <div className="h-14 w-14 overflow-hidden rounded-xl border border-black/10 bg-black/[0.04]">
                      <img
                        src={img.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs text-black">{img.image_url}</div>
                      <div className="mt-1 text-[11px] text-black/50">
                        {img.is_primary ? "Primary" : "—"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {!createdId ? (
              <Button
                className="w-full rounded-2xl bg-black text-white hover:bg-black/90"
                onClick={createProduct}
                disabled={creating}
                type="button"
              >
                {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Product
              </Button>
            ) : pending.length ? (
              <Button
                className="w-full rounded-2xl bg-[#ff6fa0] text-white hover:bg-[#ff4f8c]"
                onClick={() => uploadPendingImages(createdId)}
                disabled={uploading}
                type="button"
              >
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {uploading ? "Uploading…" : "Upload Selected"}
              </Button>
            ) : (
              <Button
                className="w-full rounded-2xl bg-[#ff6fa0] text-white hover:bg-[#ff4f8c]"
                onClick={() => router.push(`/admin/products/${createdId}`)}
                type="button"
              >
                Continue to Editor
              </Button>
            )}

            <div className="text-[11px] text-black/50">
              Tip: Use a clean background and consistent lighting for a luxury look.
              The first uploaded image becomes{" "}
              <span className="font-medium">Primary</span>.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}