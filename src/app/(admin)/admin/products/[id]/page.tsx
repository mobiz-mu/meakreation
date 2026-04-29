"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Trash2,
  Upload,
  Image as ImageIcon,
  Save,
  Star,
  Plus,
  Palette,
  Ruler,
  X,
} from "lucide-react";
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

type VariantImageRow = {
  id: string;
  variant_id: string;
  image_url: string;
  alt: string | null;
  sort_order: number | null;
  created_at: string;
};

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
};

type VariantRowData = {
  id: string;
  product_id: string;
  options_json: Record<string, string>;
  sku: string | null;
  price_mur: number | null;
  compare_at_price_mur: number | null;
  stock_qty: number;
  is_active: boolean;
  __new?: boolean;
  variant_images?: VariantImageRow[];
};

type VariantDraft = {
  color: string;
  size: string;
  sku: string;
  price_mur: string;
  compare_at_price_mur: string;
  stock_qty: number;
  is_active: boolean;
};

function fmtMUR(n?: number | null) {
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

const COLOR_OPTIONS = [
  "Black",
  "White",
  "Cream",
  "Beige",
  "Brown",
  "Camel",
  "Taupe",
  "Grey",
  "Silver",
  "Gold",
  "Navy",
  "Blue",
  "Sky Blue",
  "Royal Blue",
  "Green",
  "Olive",
  "Emerald",
  "Mint",
  "Yellow",
  "Mustard",
  "Orange",
  "Peach",
  "Pink",
  "Baby Pink",
  "Rose",
  "Fuchsia",
  "Red",
  "Burgundy",
  "Wine",
  "Purple",
  "Lavender",
  "Lilac",
  "Multicolor",
];

const SIZE_OPTIONS = ["Free Size", "S", "M", "L", "XL", "2XL"];

function colorPreview(name: string) {
  const map: Record<string, string> = {
    Black: "#111111",
    White: "#ffffff",
    Cream: "#f8f1df",
    Beige: "#d7c1a3",
    Brown: "#7a5336",
    Camel: "#b78b5a",
    Taupe: "#8f7f73",
    Grey: "#8d8d8d",
    Silver: "#c6c6c6",
    Gold: "#d5b45b",
    Navy: "#1f2a44",
    Blue: "#2d5bd1",
    "Sky Blue": "#8cc9ff",
    "Royal Blue": "#274bdb",
    Green: "#2f8f57",
    Olive: "#6d7a3b",
    Emerald: "#15966b",
    Mint: "#bcefd8",
    Yellow: "#f5d547",
    Mustard: "#c99a1a",
    Orange: "#ee8b2e",
    Peach: "#f6b08f",
    Pink: "#f39fc2",
    "Baby Pink": "#f8d7e5",
    Rose: "#db7ca4",
    Fuchsia: "#e22991",
    Red: "#d93030",
    Burgundy: "#6f1d38",
    Wine: "#7d2138",
    Purple: "#7b3fe4",
    Lavender: "#cdb8ff",
    Lilac: "#d8c8f0",
    Multicolor: "linear-gradient(135deg,#ff7aa2,#ffd45d,#68d391,#6ea8ff,#b78cff)",
  };

  return map[name] || "#111111";
}

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

  const [variants, setVariants] = useState<VariantRowData[]>([]);
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

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [variantDraft, setVariantDraft] = useState<VariantDraft>({
    color: "Black",
    size: "Free Size",
    sku: "",
    price_mur: "",
    compare_at_price_mur: "",
    stock_qty: 0,
    is_active: true,
  });

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

      const rows = (json.items ?? []) as VariantRowData[];
      const withImages = await Promise.all(
        rows.map(async (variant) => {
          const { data: variantImages, error } = await supabase
            .from("variant_images")
            .select("id,variant_id,image_url,alt,sort_order,created_at")
            .eq("variant_id", variant.id)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: true });

          if (error) {
            console.error("load variant images error:", error);
          }

          return {
            ...variant,
            variant_images: (variantImages ?? []) as VariantImageRow[],
          };
        })
      );

      setVariants(withImages);
    } catch (e: any) {
      console.error("loadVariants error:", e);
      setVariants([]);
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
    if (!file.type.startsWith("image/")) {
      return "Invalid file type. Please upload an image.";
    }
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

  async function createVariantFromModal() {
    if (!id) return;

    const next: VariantRowData = {
      __new: true,
      id: crypto.randomUUID(),
      product_id: id,
      options_json: {
        Color: variantDraft.color,
        Size: variantDraft.size,
      },
      sku: variantDraft.sku || "",
      price_mur:
        variantDraft.price_mur === "" ? null : Number(variantDraft.price_mur),
      compare_at_price_mur:
        variantDraft.compare_at_price_mur === ""
          ? null
          : Number(variantDraft.compare_at_price_mur),
      stock_qty: Number(variantDraft.stock_qty ?? 0),
      is_active: variantDraft.is_active,
      variant_images: [],
    };

    setVariants((prev) => [next, ...prev]);
    setVariantModalOpen(false);
    setVariantDraft({
      color: "Black",
      size: "Free Size",
      sku: "",
      price_mur: "",
      compare_at_price_mur: "",
      stock_qty: 0,
      is_active: true,
    });
  }

  const flags = useMemo(() => {
    const list: Array<{ label: string; kind: "ok" | "warn" | "pink" | "black" }> =
      [];
    list.push({
      label: isActive ? "ACTIVE" : "INACTIVE",
      kind: isActive ? "ok" : "warn",
    });
    if (isFeatured) list.push({ label: "FEATURED", kind: "pink" });
    if (isBestSeller) list.push({ label: "BEST SELLER", kind: "black" });
    return list;
  }, [isActive, isFeatured, isBestSeller]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-black/60">
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

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
            {title ? `Edit: ${title}` : "Edit Product"}
          </h1>

          <div className="mt-2 flex flex-wrap gap-2">
            {flags.map((f) => (
              <Badge
                key={f.label}
                className={cx(
                  "rounded-2xl border",
                  f.kind === "ok" && "border-[#0b7a42]/15 bg-[#ecfff5] text-[#0b7a42]",
                  f.kind === "warn" && "border-[#b42318]/15 bg-[#fff1f3] text-[#b42318]",
                  f.kind === "pink" && "border-black/10 bg-[#ffe6ef] text-black",
                  f.kind === "black" && "border-black bg-black text-white"
                )}
              >
                {f.label}
              </Badge>
            ))}
          </div>

          <p className="mt-2 text-xs text-black/45">ID: {id}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="rounded-2xl border-black/10 bg-white text-black hover:bg-black/[0.02]"
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
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
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
                <Input
                  className="h-11 rounded-2xl border-black/10"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-black">Slug</Label>
                <Input
                  className="h-11 rounded-2xl border-black/10"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
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
              />
            </div>

            <div className="space-y-1">
              <Label className="text-black">Description</Label>
              <Textarea
                className="min-h-[160px] rounded-2xl border-black/10"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="rounded-[22px] border border-black/10 bg-white p-4">
              <div className="text-sm font-semibold text-black">SEO</div>
              <div className="mt-1 text-xs text-black/55">
                Optimized metadata for Google & social previews.
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
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-[26px] border-black/10 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
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
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
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
                  No images yet. Upload your first image.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[26px] border-black/10 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base text-black">Variants</CardTitle>
                <p className="mt-1 text-xs text-black/55">
                  Premium color and size variants with images per variant.
                </p>
              </div>

              <Button
                className="rounded-2xl border-0 bg-[linear-gradient(135deg,#111111_0%,#3f272d_100%)] text-white shadow-[0_16px_40px_-24px_rgba(17,17,17,0.45)] hover:opacity-95"
                onClick={() => {
                  setVariantDraft({
                    color: "Black",
                    size: "Free Size",
                    sku: "",
                    price_mur: "",
                    compare_at_price_mur: "",
                    stock_qty: 0,
                    is_active: true,
                  });
                  setVariantModalOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Variant
              </Button>
            </CardHeader>

            <CardContent className="space-y-4">
              {vLoading ? (
                <div className="flex items-center gap-2 text-sm text-black/60">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading variants…
                </div>
              ) : null}

              {variants.map((v) => (
                <VariantRow
                  key={v.id}
                  productId={String(id)}
                  title={title}
                  value={v}
                  onChange={(next) =>
                    setVariants((prev) => prev.map((x) => (x.id === v.id ? next : x)))
                  }
                  onSave={async (next) => {
                    const token = await adminToken();
                    const res = await fetch("/api/admin/variants/upsert", {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        id: next.__new ? undefined : next.id,
                        product_id: id,
                        options_json: next.options_json,
                        sku: next.sku,
                        price_mur: next.price_mur === null ? null : next.price_mur,
                        compare_at_price_mur:
                          next.compare_at_price_mur === null
                            ? null
                            : next.compare_at_price_mur,
                        stock_qty: Number(next.stock_qty ?? 0),
                        is_active: Boolean(next.is_active),
                      }),
                    });

                    const json = await res.json();
                    if (!res.ok) throw new Error(json?.error || "Failed");

                    const saved = json.item as VariantRowData;

                    const { data: variantImages } = await supabase
                      .from("variant_images")
                      .select("id,variant_id,image_url,alt,sort_order,created_at")
                      .eq("variant_id", saved.id)
                      .order("sort_order", { ascending: true })
                      .order("created_at", { ascending: true });

                    setVariants((prev) =>
                      prev.map((x) =>
                        x.id === v.id
                          ? {
                              ...saved,
                              __new: false,
                              variant_images: (variantImages ?? []) as VariantImageRow[],
                            }
                          : x
                      )
                    );
                  }}
                  onDelete={async () => {
                    if (v.__new) {
                      setVariants((prev) => prev.filter((x) => x.id !== v.id));
                      return;
                    }

                    const token = await adminToken();
                    const res = await fetch("/api/admin/variants/delete", {
                      method: "POST",
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ id: v.id }),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json?.error || "Failed");
                    setVariants((prev) => prev.filter((x) => x.id !== v.id));
                  }}
                />
              ))}

              {!variants.length ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-[linear-gradient(135deg,#fff8fb_0%,#ffffff_100%)] p-5 text-sm text-black/60">
                  No variants yet. Create premium size and color combinations for this product.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      {variantModalOpen ? (
        <VariantCreateModal
          open={variantModalOpen}
          value={variantDraft}
          onClose={() => setVariantModalOpen(false)}
          onChange={setVariantDraft}
          onCreate={createVariantFromModal}
        />
      ) : null}
    </div>
  );
}

function VariantCreateModal({
  open,
  value,
  onClose,
  onChange,
  onCreate,
}: {
  open: boolean;
  value: VariantDraft;
  onClose: () => void;
  onChange: React.Dispatch<React.SetStateAction<VariantDraft>>;
  onCreate: () => void;
}) {
  if (!open) return null;

  const featuredColors = [
    "Black",
    "White",
    "Beige",
    "Brown",
    "Navy",
    "Blue",
    "Pink",
    "Baby Pink",
    "Red",
    "Burgundy",
    "Green",
    "Gold",
    "Silver",
    "Multicolor",
  ];

  const moreColors = COLOR_OPTIONS.filter((c) => !featuredColors.includes(c));

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[3px]">
      <div className="w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/40 bg-[linear-gradient(180deg,#fffdfd_0%,#fff7fa_100%)] shadow-[0_40px_140px_-35px_rgba(0,0,0,0.38)]">
        <div className="sticky top-0 z-10 border-b border-black/5 bg-white/90 px-5 py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-black/55">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff6fa0]" />
                New Variant
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-black">
                Add Premium Variant
              </h3>
              <p className="mt-1 text-sm text-black/55">
                Choose colour, size, stock and pricing in a cleaner luxury flow.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-black/10 bg-white p-2 text-black/65 transition hover:bg-black/[0.03] hover:text-black"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="max-h-[72vh] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-6">
            <div className="rounded-[24px] border border-black/8 bg-white/90 p-4 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.18)]">
              <div className="text-xs uppercase tracking-[0.16em] text-black/45">
                Variant Preview
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black px-3 py-1.5 text-sm text-white">
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-white/20"
                    style={{ background: colorPreview(value.color) }}
                  />
                  {value.color}
                </span>

                <span className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-black">
                  {value.size}
                </span>

                <span
                  className={cx(
                    "rounded-full border px-3 py-1.5 text-sm",
                    value.is_active
                      ? "border-[#0b7a42]/15 bg-[#ecfff5] text-[#0b7a42]"
                      : "border-[#b42318]/15 bg-[#fff1f3] text-[#b42318]"
                  )}
                >
                  {value.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <section className="rounded-[24px] border border-black/8 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-black">
                <Palette className="h-4 w-4" />
                Colour
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {featuredColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onChange((p) => ({ ...p, color }))}
                    className={cx(
                      "flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-sm transition",
                      value.color === color
                        ? "border-black bg-black text-white shadow-[0_12px_26px_-18px_rgba(0,0,0,0.35)]"
                        : "border-black/10 bg-white text-black hover:bg-black/[0.02]"
                    )}
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ background: colorPreview(color) }}
                    />
                    <span className="truncate">{color}</span>
                  </button>
                ))}
              </div>

              <details className="mt-3 rounded-2xl border border-black/8 bg-[#fffafb] p-3">
                <summary className="cursor-pointer list-none text-sm font-medium text-black/70">
                  More colours
                </summary>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {moreColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => onChange((p) => ({ ...p, color }))}
                      className={cx(
                        "flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-sm transition",
                        value.color === color
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-white text-black hover:bg-black/[0.02]"
                      )}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-black/10"
                        style={{ background: colorPreview(color) }}
                      />
                      <span className="truncate">{color}</span>
                    </button>
                  ))}
                </div>
              </details>
            </section>

            <section className="rounded-[24px] border border-black/8 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-black">
                <Ruler className="h-4 w-4" />
                Size
              </div>

              <div className="flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onChange((p) => ({ ...p, size }))}
                    className={cx(
                      "min-w-[64px] rounded-2xl border px-4 py-2.5 text-sm transition",
                      value.size === size
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white text-black hover:bg-black/[0.02]"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-black/8 bg-white p-4">
              <div className="mb-3 text-sm font-semibold text-black">
                Pricing & Stock
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-black">SKU</Label>
                  <Input
                    className="h-11 rounded-2xl border-black/10"
                    value={value.sku}
                    onChange={(e) => onChange((p) => ({ ...p, sku: e.target.value }))}
                    placeholder="Optional SKU"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-black">Stock Qty</Label>
                  <Input
                    className="h-11 rounded-2xl border-black/10"
                    type="number"
                    value={value.stock_qty}
                    onChange={(e) =>
                      onChange((p) => ({
                        ...p,
                        stock_qty: Number(e.target.value),
                      }))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-black">Price Override (MUR)</Label>
                  <Input
                    className="h-11 rounded-2xl border-black/10"
                    type="number"
                    value={value.price_mur}
                    onChange={(e) => onChange((p) => ({ ...p, price_mur: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-black">Compare-at (MUR)</Label>
                  <Input
                    className="h-11 rounded-2xl border-black/10"
                    type="number"
                    value={value.compare_at_price_mur}
                    onChange={(e) =>
                      onChange((p) => ({
                        ...p,
                        compare_at_price_mur: e.target.value,
                      }))
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                <Switch
                  checked={value.is_active}
                  onCheckedChange={(x) => onChange((p) => ({ ...p, is_active: x }))}
                />
                <div>
                  <div className="text-sm font-medium text-black">Active Variant</div>
                  <div className="text-xs text-black/55">
                    Keep this variant available for sale
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-black/5 bg-white/95 px-5 py-4 backdrop-blur sm:px-6">
          <Button
            variant="outline"
            className="rounded-2xl border-black/10 bg-white text-black hover:bg-black/[0.02]"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            className="rounded-2xl bg-[linear-gradient(135deg,#111111_0%,#3f272d_100%)] px-5 text-white hover:opacity-95"
            onClick={onCreate}
          >
            Create Variant
          </Button>
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
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-black/10 bg-black/[0.04]">
        <img
          src={img.image_url}
          alt={img.alt ?? ""}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate text-[11px] text-black/55">{img.image_url}</div>
          {img.is_primary ? (
            <span className="rounded-full border border-black/10 bg-[#ffe6ef] px-2 py-0.5 text-[11px] text-black">
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
            placeholder="Alt text (SEO)"
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {!img.is_primary ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl border-black/10 bg-white text-black hover:bg-black/[0.02]"
              onClick={onSetPrimary}
              disabled={busy}
            >
              {busy ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Star className="mr-2 h-4 w-4" />
              )}
              Set Primary
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            className="rounded-2xl border-black/10 bg-white text-black hover:bg-black/[0.02]"
            onClick={async () => onAltSave(alt.trim() ? alt.trim() : null)}
            disabled={!dirty || busy}
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Alt
          </Button>

          <Button
            type="button"
            variant="outline"
            className="rounded-2xl border-black/10 bg-white text-black hover:bg-black/[0.02]"
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
  productId,
  title,
  value,
  onChange,
  onSave,
  onDelete,
}: {
  productId: string;
  title: string;
  value: VariantRowData;
  onChange: (v: VariantRowData) => void;
  onSave: (v: VariantRowData) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [busyImageId, setBusyImageId] = React.useState<string | null>(null);
  const [newOptionKey, setNewOptionKey] = React.useState("");
  const [newOptionValue, setNewOptionValue] = React.useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const entries = Object.entries(value.options_json || {}) as Array<[string, any]>;
  const color = String(value.options_json?.Color || value.options_json?.Colour || "");
  const size = String(value.options_json?.Size || "");

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

  function validateImageFile(file: File) {
    const maxBytes = RECOMMENDED.maxMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Recommended max is ${RECOMMENDED.maxMB}MB.`;
    }
    if (!file.type.startsWith("image/")) {
      return "Invalid file type. Please upload an image.";
    }
    return null;
  }

  async function uploadVariantImages(files: FileList) {
    if (value.__new) {
      throw new Error("Please save the variant first before uploading variant images.");
    }

    setUploading(true);
    setErr(null);

    try {
      const list = Array.from(files);

      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        const valid = validateImageFile(file);
        if (valid) throw new Error(valid);

        const ext = file.name.split(".").pop() || "jpg";
        const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        const path = `variants/${productId}/${value.id}/${crypto.randomUUID()}.${safeExt}`;

        const { error: upErr } = await supabase.storage.from("products").upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: file.type || undefined,
        });

        if (upErr) throw upErr;

        const { data: pub } = supabase.storage.from("products").getPublicUrl(path);
        const image_url = pub.publicUrl;

        const nextSort =
          (value.variant_images?.reduce(
            (max, img) => Math.max(max, Number(img.sort_order ?? 0)),
            0
          ) ?? 0) + 1;

        const { data: inserted, error: insertErr } = await supabase
          .from("variant_images")
          .insert({
            variant_id: value.id,
            image_url,
            alt: `${title} ${color} ${size}`.trim() || null,
            sort_order: nextSort,
          })
          .select("id,variant_id,image_url,alt,sort_order,created_at")
          .single();

        if (insertErr) throw insertErr;

        onChange({
          ...value,
          variant_images: [...(value.variant_images ?? []), inserted as VariantImageRow],
        });
      }
    } catch (e: any) {
      setErr(e?.message || "Variant image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function deleteVariantImage(imageId: string) {
    setBusyImageId(imageId);
    setErr(null);
    try {
      const { error } = await supabase.from("variant_images").delete().eq("id", imageId);
      if (error) throw error;

      onChange({
        ...value,
        variant_images: (value.variant_images ?? []).filter((img) => img.id !== imageId),
      });
    } catch (e: any) {
      setErr(e?.message || "Failed to delete variant image");
    } finally {
      setBusyImageId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-[26px] border border-black/10 bg-[linear-gradient(180deg,#ffffff_0%,#fff9fb_100%)] shadow-[0_20px_60px_-45px_rgba(0,0,0,0.22)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          {color ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black">
              <span
                className="h-3.5 w-3.5 rounded-full border border-black/10"
                style={{ background: colorPreview(color) }}
              />
              {color}
            </span>
          ) : null}

          {size ? (
            <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black">
              {size}
            </span>
          ) : null}

          {!entries.length ? (
            <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/55">
              No options
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-black/55">Active</div>
          <Switch
            checked={!!value.is_active}
            onCheckedChange={(x) => onChange({ ...value, is_active: x })}
          />
        </div>
      </div>

      <div className="space-y-5 px-5 py-5">
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
            <Label className="text-black">Price Override (MUR)</Label>
            <Input
              className="h-11 rounded-2xl border-black/10"
              type="number"
              value={value.price_mur ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  price_mur: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-1">
            <Label className="text-black">Compare-at (MUR)</Label>
            <Input
              className="h-11 rounded-2xl border-black/10"
              type="number"
              value={value.compare_at_price_mur ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  compare_at_price_mur:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-1">
            <Label className="text-black">Stock Qty</Label>
            <Input
              className="h-11 rounded-2xl border-black/10"
              type="number"
              value={value.stock_qty ?? 0}
              onChange={(e) =>
                onChange({ ...value, stock_qty: Number(e.target.value) })
              }
            />
          </div>

          <div className="space-y-1 md:col-span-3">
            <Label className="text-black">Add Extra Option</Label>
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <Input
                className="h-11 rounded-2xl border-black/10"
                placeholder="Option name (e.g. Fabric)"
                value={newOptionKey}
                onChange={(e) => setNewOptionKey(e.target.value)}
              />
              <Input
                className="h-11 rounded-2xl border-black/10"
                placeholder="Value (e.g. Satin)"
                value={newOptionValue}
                onChange={(e) => setNewOptionValue(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                className="rounded-2xl border-black/10 bg-white text-black hover:bg-black/[0.02]"
                onClick={() => {
                  const k = newOptionKey.trim();
                  const v = newOptionValue.trim();
                  if (!k || !v) return;
                  setOpt(k, v);
                  setNewOptionKey("");
                  setNewOptionValue("");
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {entries.length ? (
          <div className="flex flex-wrap gap-2">
            {entries.map(([k, v]) => (
              <span
                key={k}
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black"
              >
                <span className="text-black/55">{k}:</span> {String(v)}
                {k !== "Color" && k !== "Size" ? (
                  <button
                    className="text-black/45 hover:text-black"
                    onClick={() => delOpt(k)}
                    type="button"
                    aria-label="Remove option"
                  >
                    ×
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : null}

        <div className="rounded-[22px] border border-black/10 bg-white p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-black">Variant Images</div>
              <div className="mt-1 text-xs text-black/55">
                Upload images specific to this exact variant.
              </div>
            </div>

            <div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files || !files.length) return;
                  try {
                    await uploadVariantImages(files);
                  } finally {
                    e.target.value = "";
                  }
                }}
              />

              <Button
                type="button"
                variant="outline"
                className="rounded-2xl border-black/10 bg-white text-black hover:bg-black/[0.02]"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload Variant Image
              </Button>
            </div>
          </div>

          {value.__new ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-black/[0.02] p-4 text-sm text-black/55">
              Save this variant first, then upload its images.
            </div>
          ) : value.variant_images?.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {value.variant_images.map((img) => (
                <div
                  key={img.id}
                  className="overflow-hidden rounded-[18px] border border-black/10 bg-white"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-black/[0.04]">
                    <img
                      src={img.image_url}
                      alt={img.alt ?? ""}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 p-3">
                    <div className="line-clamp-2 text-xs text-black/60">
                      {img.alt || "No alt text"}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-2xl border-black/10 bg-white text-black hover:bg-black/[0.02]"
                      disabled={busyImageId === img.id}
                      onClick={() => deleteVariantImage(img.id)}
                    >
                      {busyImageId === img.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-black/10 bg-black/[0.02] p-4 text-sm text-black/55">
              No variant images yet.
            </div>
          )}
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
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Variant
          </Button>

          <Button
            className="rounded-2xl border-black/10 bg-white text-black hover:bg-black/[0.02]"
            variant="outline"
            onClick={onDelete}
            disabled={saving}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {err ? <div className="text-xs text-red-600">{err}</div> : null}
      </div>
    </div>
  );
}