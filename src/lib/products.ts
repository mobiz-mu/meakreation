// src/lib/products.ts
import { supabaseServer } from "@/lib/supabase/server-public";

export type CategoryLite = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  storage_path: string | null;
  bucket: string;
  storage_bucket: string | null;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  options_json: Record<string, string>;
  sku: string | null;
  price_mur: number | null;
  compare_at_price_mur: number | null;
  stock_qty: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  category_id: string | null;
  base_price_mur: number;
  compare_at_price_mur: number | null;
  sku: string | null;
  barcode: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_best_seller: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductWithRelations = ProductRow & {
  categories: CategoryLite | null;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
};

type ProductQueryRow = ProductRow & {
  categories: CategoryLite | CategoryLite[] | null;
  product_images: ProductImage[] | null;
  product_variants: ProductVariant[] | null;
};

function normalizeProduct(row: ProductQueryRow): ProductWithRelations {
  const category = Array.isArray(row.categories)
    ? (row.categories[0] ?? null)
    : (row.categories ?? null);

  const productImages = [...(row.product_images ?? [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });

  const productVariants = [...(row.product_variants ?? [])]
    .filter((v) => v.is_active)
    .sort((a, b) => (b.stock_qty ?? 0) - (a.stock_qty ?? 0));

  return {
    ...row,
    categories: category,
    product_images: productImages,
    product_variants: productVariants,
  };
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithRelations | null> {
  const { data, error } = await supabaseServer
    .from("products")
    .select(`
      id,
      title,
      slug,
      description,
      short_description,
      category_id,
      base_price_mur,
      compare_at_price_mur,
      sku,
      barcode,
      is_active,
      is_featured,
      is_best_seller,
      sort_order,
      seo_title,
      seo_description,
      created_at,
      updated_at,
      categories (
        id,
        name,
        slug,
        description,
        image_url,
        is_active,
        sort_order
      ),
      product_images (
        id,
        product_id,
        image_url,
        alt,
        sort_order,
        is_primary,
        created_at,
        storage_path,
        bucket,
        storage_bucket
      ),
      product_variants (
        id,
        product_id,
        options_json,
        sku,
        price_mur,
        compare_at_price_mur,
        stock_qty,
        is_active,
        created_at,
        updated_at
      )
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("getProductBySlug error:", error);
    return null;
  }

  if (!data) return null;

  return normalizeProduct(data as ProductQueryRow);
}

export async function getRelatedProducts(
  categoryId: string | null,
  currentProductId: string
): Promise<ProductWithRelations[]> {
  let query = supabaseServer
    .from("products")
    .select(`
      id,
      title,
      slug,
      description,
      short_description,
      category_id,
      base_price_mur,
      compare_at_price_mur,
      sku,
      barcode,
      is_active,
      is_featured,
      is_best_seller,
      sort_order,
      seo_title,
      seo_description,
      created_at,
      updated_at,
      categories (
        id,
        name,
        slug,
        description,
        image_url,
        is_active,
        sort_order
      ),
      product_images (
        id,
        product_id,
        image_url,
        alt,
        sort_order,
        is_primary,
        created_at,
        storage_path,
        bucket,
        storage_bucket
      ),
      product_variants (
        id,
        product_id,
        options_json,
        sku,
        price_mur,
        compare_at_price_mur,
        stock_qty,
        is_active,
        created_at,
        updated_at
      )
    `)
    .eq("is_active", true)
    .neq("id", currentProductId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(4);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getRelatedProducts error:", error);
    return [];
  }

  return ((data ?? []) as ProductQueryRow[]).map(normalizeProduct);
}

export function getPrimaryImage(product: ProductWithRelations): string | null {
  return product.product_images?.[0]?.image_url ?? null;
}

export function getLowestPrice(product: ProductWithRelations): number {
  const prices = (product.product_variants ?? [])
    .map((v) => v.price_mur)
    .filter((v): v is number => typeof v === "number" && v > 0);

  if (prices.length > 0) return Math.min(...prices);
  return product.base_price_mur ?? 0;
}

export function getHighestComparePrice(
  product: ProductWithRelations
): number | null {
  const prices = (product.product_variants ?? [])
    .map((v) => v.compare_at_price_mur)
    .filter((v): v is number => typeof v === "number" && v > 0);

  if (prices.length > 0) return Math.max(...prices);
  return product.compare_at_price_mur ?? null;
}

export function getTotalStock(product: ProductWithRelations): number {
  const variants = product.product_variants ?? [];
  if (!variants.length) return 0;
  return variants.reduce(
    (sum, variant) => sum + Number(variant.stock_qty ?? 0),
    0
  );
}

export function formatVariantLabel(
  options: Record<string, string> | null | undefined
) {
  if (!options || typeof options !== "object") return "Default";
  const entries = Object.entries(options).filter(([, value]) => !!value);
  if (!entries.length) return "Default";
  return entries.map(([key, value]) => `${capitalize(key)}: ${value}`).join(" • ");
}

export function getVariantGroups(variants: ProductVariant[]) {
  const groups: Record<string, string[]> = {};

  for (const variant of variants) {
    const options = variant.options_json || {};
    for (const [key, value] of Object.entries(options)) {
      if (!value) continue;
      if (!groups[key]) groups[key] = [];
      if (!groups[key].includes(String(value))) {
        groups[key].push(String(value));
      }
    }
  }

  return groups;
}

export function findVariantByOptions(
  variants: ProductVariant[],
  selected: Record<string, string>
): ProductVariant | null {
  return (
    variants.find((variant) => {
      const options = variant.options_json || {};
      const keys = Object.keys(selected);
      if (!keys.length) return false;
      return keys.every(
        (key) => String(options[key] ?? "") === String(selected[key] ?? "")
      );
    }) ?? null
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}