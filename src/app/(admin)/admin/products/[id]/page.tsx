"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Upload, Image as ImageIcon, Save, Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type ImgRow = {
  id: string;
  image_url: string;
  alt: string | null;
  sort_order: number | null;
  is_primary: boolean | null;
  created_at: string;
};

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

function fmtMUR(n?: number) {
  const x = Number.isFinite(Number(n)) ? Number(n) : 0;
  return `Rs ${x.toLocaleString("en-MU")}`;
}

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

const RECOMMENDED = {
  aspect: "4:5",
  width: 1200,
  height: 1500,
  maxMB: 3,
  formats: "JPG / PNG / WebP",
};

export default function AdminProductEditPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<ImgRow[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [variants, setVariants] = useState<any[]>([]);
  const [vLoading, setVLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");

  const [basePrice, setBasePrice] = useState<number>(0);
  const [compareAt, setCompareAt] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string>("");

  const [isActive, setIsActive] = useState<boolean>(true);
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [isBestSeller, setIsBestSeller] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<number>(0);

  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");

  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [uploading, setUploading] = useState(false);
  const [imgBusyId, setImgBusyId] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  async function adminToken() {
    const sess = await supabase.auth.getSession();
    const token = sess.data.session?.access_token;
    if (!token) throw new Error("Not logged in");
    return token;
  }

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
    } catch (e) {
      console.error("loadCategories error:", e);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function load() {
    if (!id) return;
    setLoading(true);
    setErr(null);
    try {
      const token = await adminToken();
      const res = await fetch(`/api/admin/products/get?id=${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");

      setProduct(json.product);
      setImages(json.images ?? []);

      const p = json.product || {};
      setTitle(p.title ?? "");
      setSlug(p.slug ?? "");
      setSku(p.sku ?? "");
      setBarcode(p.barcode ?? "");
      setBasePrice(Number(p.base_price_mur ?? 0));
      setCompareAt(Number(p.compare_at_price_mur ?? 0));
      setCategoryId(p.category_id ?? "");
      setIsActive(Boolean(p.is_active ?? true));
      setIsFeatured(Boolean(p.is_featured ?? false));
      setIsBestSeller(Boolean(p.is_best_seller ?? false));
      setSortOrder(Number(p.sort_order ?? 0));
      setShortDescription(p.short_description ?? "");
      setDescription(p.description ?? "");
      setSeoTitle(p.seo_title ?? "");
      setSeoDescription(p.seo_description ?? "");
    } catch (e: any) {
      setErr(e?.message || "Failed to load product");
      setProduct(null);
      setImages([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadVariants() {
    if (!id) return;
    setVLoading(true);
    try {
      const token = await adminToken();
      const res = await fetch(`/api/admin/variants/list?product_id=${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setVariants(json.items ?? []);
    } finally {
      setVLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    (async () => {
      await Promise.all([loadCategories(), load(), loadVariants()]);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save() {
    if (!id) return;
    setSaving(true);
    setErr(null);
    try {
      const token = await adminToken();
      const res = await fetch("/api/admin/products/update", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          patch: {
            title,
            slug,
            sku: sku || null,
            barcode: barcode || null,
            base_price_mur: basePrice,
            compare_at_price_mur: compareAt || 0,
            category_id: categoryId || null,
            is_active: isActive,
            is_featured: isFeatured,
            is_best_seller: isBestSeller,
            sort_order: sortOrder,
            short_description: shortDescription || null,
            description: description || null,
            seo_title: seoTitle || null,
            seo_description: seoDescription || null,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setProduct(json.product);
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function validateImageFile(file: File) {
    const maxBytes = RECOMMENDED.maxMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Recommended max is ${RECOMMENDED.maxMB}MB.`;
    }
    if (!file.type.startsWith("image/")) return "Invalid file type. Please upload an image.";
    return null;
  }

  async function uploadImage(file: File, makePrimary: boolean) {
    if (!id) return;

    const v = validateImageFile(file);
    if (v) throw new Error(v);

    const ext = file.name.split(".").pop() || "jpg";
    const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${id}/${crypto.randomUUID()}.${safeExt}`;

    const { error: upErr } = await supabase.storage.from("products").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type || undefined,
    });
    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from("products").getPublicUrl(path);
    const image_url = pub.publicUrl;

    const token = await adminToken();
    const res = await fetch("/api/admin/products/add-image", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: id,
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

    setImages((prev) => [...prev, json.image as ImgRow]);
  }

  async function uploadMany(files: FileList) {
    if (!id) return;
    setUploading(true);
    setErr(null);
    try {
      const list = Array.from(files);
      for (let i = 0; i < list.length; i++) {
        const f = list[i];
        const hasPrimary = images.some((x) => !!x.is_primary);
        const makePrimary = !hasPrimary && i === 0;
        await uploadImage(f, makePrimary);
      }
    } catch (e: any) {
      setErr(e?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function deleteImage(imgId: string) {
    const token = await adminToken();
    const res = await fetch("/api/admin/products/delete-image", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ id: imgId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error || "Failed");
    setImages((prev) => prev.filter((x) => x.id !== imgId));
  }

  async function setPrimaryImage(imgId: string) {
    if (!id) return;
    setImgBusyId(imgId);
    setErr(null);
    try {
      const token = await adminToken();
      const res = await fetch("/api/admin/products/set-primary-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: id, image_id: imgId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");

      setImages((prev) => prev.map((x) => ({ ...x, is_primary: x.id === imgId })));
    } catch (e: any) {
      setErr(e?.message || "Failed to set primary");
    } finally {
      setImgBusyId(null);
    }
  }

  async function updateImageAlt(imgId: string, alt: string | null) {
    setImgBusyId(imgId);
    setErr(null);
    try {
      const token = await adminToken();
      const res = await fetch("/api/admin/products/update-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id: imgId, patch: { alt } }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed");
      setImages((prev) => prev.map((x) => (x.id === imgId ? { ...x, alt } : x)));
    } catch (e: any) {
      setErr(e?.message || "Failed to update alt");
    } finally {
      setImgBusyId(null);
    }
  }

  const flags = useMemo(() => {
    const list: Array<{ label: string; kind: "ok" | "warn" | "pink" | "black" }> = [];
    list.push({ label: isActive ? "ACTIVE" : "INACTIVE", kind: isActive ? "ok" : "warn" });
    if (isFeatured) list.push({ label: "FEATURED", kind: "pink" });
    if (isBestSeller) list.push({ label: "BEST SELLER", kind: "black" });
    return list;
  }, [isActive, isFeatured, isBestSeller]);

  if (loading) {
    return (
      <div className="text-sm text-black/60 flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading product…
      </div>
    );
  }

  if (!product) {
    return <div className="text-sm text-black/60">Product not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-1.5 text-[12px] text-black/60 shadow-[0_10px_30px_-25px_rgba(0,0,0,0.25)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff6fa0]" />
            Product Editor
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-black">
            {title ? `Edit: ${title}` : "Edit Product"}
          </h1>

          <div className="mt-2 flex flex-wrap gap-2">
            {flags.map((f) => (
              <Badge
                key={f.label}
                className={cx(
                  "rounded-2xl border",
                  f.kind === "ok" && "bg-[#ecfff5] text-[#0b7a42] border-[#0b7a42]/15",
                  f.kind === "warn" && "bg-[#fff1f3] text-[#b42318] border-[#b42318]/15",
                  f.kind === "pink" && "bg-[#ffe6ef] text-black border-black/10",
                  f.kind === "black" && "bg-black text-white border-black"
                )}
              >
                {f.label}
              </Badge>
            ))}
          </div>

          <p className="text-xs text-black/45 mt-2">ID: {id}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02] text-black"
            onClick={() => load()}
            disabled={saving}
          >
            Refresh
          </Button>

          <Button
            className="rounded-2xl bg-black text-white hover:bg-black/90"
            onClick={save}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? "Saving…" : "Save"}
          </Button>
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
            <CardTitle className="text-base text-black">Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-black">Title</Label>
                <Input className="h-11 rounded-2xl border-black/10" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>

              <div className="space-y-1">
                <Label className="text-black">Slug</Label>
                <Input className="h-11 rounded-2xl border-black/10" value={slug} onChange={(e) => setSlug(e.target.value)} />
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
                  This product appears automatically on the assigned frontend category page.
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
                <div className="text-xs text-black/50">Shown price: {fmtMUR(basePrice)}</div>
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
              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 flex items-center gap-3">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <div>
                  <div className="text-sm font-medium text-black">Active</div>
                  <div className="text-xs text-black/55">Visible on shop</div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 flex items-center gap-3">
                <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                <div>
                  <div className="text-sm font-medium text-black">Featured</div>
                  <div className="text-xs text-black/55">Homepage sections</div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 flex items-center gap-3">
                <Switch checked={isBestSeller} onCheckedChange={setIsBestSeller} />
                <div>
                  <div className="text-sm font-medium text-black">Best Seller</div>
                  <div className="text-xs text-black/55">Best sellers list</div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-black">Short Description</Label>
              <Textarea className="rounded-2xl border-black/10 min-h-[90px]" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label className="text-black">Description</Label>
              <Textarea className="rounded-2xl border-black/10 min-h-[160px]" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="rounded-[22px] border border-black/10 bg-white p-4">
              <div className="text-sm font-semibold text-black">SEO</div>
              <div className="text-xs text-black/55 mt-1">Optimized metadata for Google & social previews.</div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-black">SEO Title</Label>
                  <Input className="h-11 rounded-2xl border-black/10" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-black">SEO Description</Label>
                  <Input className="h-11 rounded-2xl border-black/10" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-[26px] border-black/10 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-black flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-black/60" />
                  Images
                </CardTitle>
                <div className="mt-1 text-[11px] text-black/55 leading-snug">
                  Recommended: <span className="font-medium">{RECOMMENDED.width}×{RECOMMENDED.height}px</span>{" "}
                  (<span className="font-medium">{RECOMMENDED.aspect}</span>) •{" "}
                  <span className="font-medium">≤ {RECOMMENDED.maxMB}MB</span> • {RECOMMENDED.formats}
                </div>
              </div>

              <Button
                variant="outline"
                className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02] text-black"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload
              </Button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files || !files.length) return;
                  try {
                    await uploadMany(files);
                  } finally {
                    e.target.value = "";
                  }
                }}
              />
            </CardHeader>

            <CardContent className="space-y-3">
              {images.length ? (
                <div className="space-y-2">
                  {images
                    .slice()
                    .sort(
                      (a, b) =>
                        Number(!!b.is_primary) - Number(!!a.is_primary) ||
                        (a.sort_order ?? 0) - (b.sort_order ?? 0)
                    )
                    .map((img) => (
                      <ImageRow
                        key={img.id}
                        img={img}
                        busy={imgBusyId === img.id}
                        onDelete={async () => {
                          try {
                            await deleteImage(img.id);
                          } catch (ex: any) {
                            setErr(ex?.message || "Delete failed");
                          }
                        }}
                        onSetPrimary={async () => setPrimaryImage(img.id)}
                        onAltSave={async (alt) => updateImageAlt(img.id, alt)}
                      />
                    ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 text-sm text-black/60">
                  No images yet. Upload your first image (it becomes Primary automatically).
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[26px] border-black/10 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base text-black">Variants</CardTitle>

              <Button
                variant="outline"
                className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02] text-black"
                onClick={() => {
                  setVariants((prev) => [
                    ...prev,
                    {
                      __new: true,
                      id: crypto.randomUUID(),
                      product_id: id,
                      options_json: { Size: "M", Color: "Black" },
                      sku: "",
                      price_mur: null,
                      compare_at_price_mur: null,
                      stock_qty: 0,
                      is_active: true,
                    },
                  ]);
                }}
              >
                Add Variant
              </Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {vLoading ? (
                <div className="text-sm text-black/60 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading variants…
                </div>
              ) : null}

              {variants.map((v) => (
                <VariantRow
                  key={v.id}
                  value={v}
                  onChange={(next) => setVariants((prev) => prev.map((x) => (x.id === v.id ? next : x)))}
                  onSave={async (next) => {
                    const token = await adminToken();
                    const res = await fetch("/api/admin/variants/upsert", {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                      body: JSON.stringify({
                        id: next.__new ? undefined : next.id,
                        product_id: id,
                        options_json: next.options_json,
                        sku: next.sku,
                        price_mur: next.price_mur === "" ? null : next.price_mur,
                        compare_at_price_mur: next.compare_at_price_mur === "" ? null : next.compare_at_price_mur,
                        stock_qty: Number(next.stock_qty ?? 0),
                        is_active: Boolean(next.is_active),
                      }),
                    });

                    const json = await res.json();
                    if (!res.ok) throw new Error(json?.error || "Failed");

                    setVariants((prev) => prev.map((x) => (x.id === v.id ? { ...json.item, __new: false } : x)));
                  }}
                  onDelete={async () => {
                    if (v.__new) {
                      setVariants((prev) => prev.filter((x) => x.id !== v.id));
                      return;
                    }
                    const token = await adminToken();
                    const res = await fetch("/api/admin/variants/delete", {
                      method: "POST",
                      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                      body: JSON.stringify({ id: v.id }),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json?.error || "Failed");
                    setVariants((prev) => prev.filter((x) => x.id !== v.id));
                  }}
                />
              ))}

              {!variants.length ? (
                <div className="text-sm text-black/60 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                  No variants yet. Add one for size/color options.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ImageRow({
  img,
  busy,
  onDelete,
  onSetPrimary,
  onAltSave,
}: {
  img: ImgRow;
  busy: boolean;
  onDelete: () => Promise<void>;
  onSetPrimary: () => Promise<void>;
  onAltSave: (alt: string | null) => Promise<void>;
}) {
  const [alt, setAlt] = useState(img.alt ?? "");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setAlt(img.alt ?? "");
    setDirty(false);
  }, [img.alt]);

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-black/10 bg-white p-2">
      <div className="h-14 w-14 rounded-xl overflow-hidden bg-black/[0.04] border border-black/10 shrink-0">
        <img src={img.image_url} alt={img.alt ?? ""} className="h-full w-full object-cover" loading="lazy" decoding="async" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] text-black/55 truncate">{img.image_url}</div>
          {img.is_primary ? (
            <span className="text-[11px] rounded-full border border-black/10 bg-[#ffe6ef] px-2 py-0.5 text-black">
              Primary
            </span>
          ) : null}
        </div>

        <div className="mt-2">
          <Input
            className="h-10 rounded-2xl border-black/10 text-sm"
            value={alt}
            onChange={(e) => {
              setAlt(e.target.value);
              setDirty(true);
            }}
            placeholder="Alt text (SEO) e.g. Handmade silk bonnet in rose"
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {!img.is_primary ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02] text-black"
              onClick={onSetPrimary}
              disabled={busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Star className="h-4 w-4 mr-2" />}
              Set Primary
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02] text-black"
            onClick={async () => onAltSave(alt.trim() ? alt.trim() : null)}
            disabled={!dirty || busy}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Alt
          </Button>

          <Button
            type="button"
            variant="outline"
            className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02] text-black"
            onClick={onDelete}
            disabled={busy}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function VariantRow({
  value,
  onChange,
  onSave,
  onDelete,
}: {
  value: any;
  onChange: (v: any) => void;
  onSave: (v: any) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  function setOpt(k: string, v: string) {
    const cur = { ...(value.options_json || {}) };
    if (!k || !v) return;
    cur[k] = v;
    onChange({ ...value, options_json: cur });
  }

  function delOpt(k: string) {
    const cur = { ...(value.options_json || {}) };
    delete cur[k];
    onChange({ ...value, options_json: cur });
  }

  const entries = Object.entries(value.options_json || {}) as Array<[string, any]>;
  const kid = `k-${value.id}`;
  const vid = `v-${value.id}`;

  return (
    <div className="rounded-[22px] border border-black/10 bg-white p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {entries.map(([k, v]) => (
            <span key={k} className="text-xs rounded-2xl border border-black/10 bg-black/[0.02] px-2 py-1 text-black/80">
              <span className="text-black/55">{k}:</span> {String(v)}
              <button
                className="ml-2 text-black/45 hover:text-black"
                onClick={() => delOpt(k)}
                type="button"
                aria-label="Remove option"
              >
                ×
              </button>
            </span>
          ))}
          {!entries.length ? <span className="text-xs text-black/55">No options</span> : null}
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={!!value.is_active} onCheckedChange={(x) => onChange({ ...value, is_active: x })} />
          <span className="text-xs text-black/55">Active</span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="space-y-1 md:col-span-2">
          <Label className="text-black">SKU</Label>
          <Input
            className="h-11 rounded-2xl border-black/10"
            value={value.sku ?? ""}
            onChange={(e) => onChange({ ...value, sku: e.target.value })}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-black">Price override (MUR)</Label>
          <Input
            className="h-11 rounded-2xl border-black/10"
            type="number"
            value={value.price_mur ?? ""}
            onChange={(e) => onChange({ ...value, price_mur: e.target.value === "" ? null : Number(e.target.value) })}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-black">Compare-at (MUR)</Label>
          <Input
            className="h-11 rounded-2xl border-black/10"
            type="number"
            value={value.compare_at_price_mur ?? ""}
            onChange={(e) =>
              onChange({ ...value, compare_at_price_mur: e.target.value === "" ? null : Number(e.target.value) })
            }
          />
        </div>

        <div className="space-y-1">
          <Label className="text-black">Stock Qty</Label>
          <Input
            className="h-11 rounded-2xl border-black/10"
            type="number"
            value={value.stock_qty ?? 0}
            onChange={(e) => onChange({ ...value, stock_qty: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-1 md:col-span-3">
          <Label className="text-black">Add / Edit Options (key/value)</Label>
          <div className="grid gap-2 md:grid-cols-2">
            <Input className="h-11 rounded-2xl border-black/10" placeholder="Option name (e.g. Size)" id={kid} />
            <Input className="h-11 rounded-2xl border-black/10" placeholder="Value (e.g. M)" id={vid} />
          </div>

          <div className="pt-2">
            <Button
              type="button"
              className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02] text-black"
              variant="outline"
              onClick={() => {
                const kEl = document.getElementById(kid) as HTMLInputElement | null;
                const vEl = document.getElementById(vid) as HTMLInputElement | null;
                const k = (kEl?.value || "").trim();
                const v = (vEl?.value || "").trim();
                if (!k || !v) return;
                setOpt(k, v);
                if (kEl) kEl.value = "";
                if (vEl) vEl.value = "";
              }}
            >
              Add Option
            </Button>
          </div>
        </div>

        <div className="flex items-end justify-end gap-2">
          <Button
            className="rounded-2xl bg-black text-white hover:bg-black/90"
            onClick={async () => {
              setErr(null);
              setSaving(true);
              try {
                await onSave(value);
              } catch (e: any) {
                setErr(e?.message || "Save failed");
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Variant
          </Button>

          <Button
            className="rounded-2xl border-black/10 bg-white hover:bg-black/[0.02] text-black"
            variant="outline"
            onClick={onDelete}
            disabled={saving}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {err ? <div className="text-xs text-red-600">{err}</div> : null}
    </div>
  );
}