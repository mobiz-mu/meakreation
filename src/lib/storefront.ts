import { supabaseServer } from "@/lib/supabase/server-public";

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

export type StoreProductCategoryLite = {
  id: string;
  name: string;
  slug: string;
};

export type StoreProductImage = {
  image_url: string;
  storage_path: string | null;
  is_primary: boolean;
  sort_order: number;
  alt: string | null;
};

export type StoreProductVariant = {
  price_mur: number | null;
  is_active: boolean;
};

export type StoreProductRow = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  base_price_mur: number;
  compare_at_price_mur: number | null;
  is_featured: boolean;
  is_best_seller: boolean;
  sort_order: number;
  created_at: string;
  category_id: string | null;
  categories?: StoreProductCategoryLite | null;
  product_images?: StoreProductImage[];
  product_variants?: StoreProductVariant[];
};

type StoreProductQueryRow = Omit<StoreProductRow, "categories" | "product_images" | "product_variants"> & {
  categories?: StoreProductCategoryLite | StoreProductCategoryLite[] | null;
  product_images?: StoreProductImage[] | null;
  product_variants?: StoreProductVariant[] | null;
};

export type CardProduct = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  price: number;
  categoryName?: string | null;
  shortDescription?: string | null;
};

function normalizeStoreProduct(row: StoreProductQueryRow): StoreProductRow {
  return {
    ...row,
    categories: Array.isArray(row.categories)
      ? (row.categories[0] ?? null)
      : (row.categories ?? null),
    product_images: Array.isArray(row.product_images) ? row.product_images : [],
    product_variants: Array.isArray(row.product_variants) ? row.product_variants : [],
  };
}

export function pickImage(
  images: StoreProductImage[] | null | undefined
) {
  const list = Array.isArray(images) ? images : [];
  const sorted = [...list].sort(
    (a, b) =>
      (b?.is_primary ? 1 : 0) - (a?.is_primary ? 1 : 0) ||
      (a?.sort_order ?? 0) - (b?.sort_order ?? 0)
  );
  const img = sorted[0];
  return (img?.image_url || "").trim() || null;
}

export function pickDisplayPrice(product: StoreProductRow) {
  const variantPrices = (product.product_variants ?? [])
    .filter((v) => v.is_active)
    .map((v) => Number(v.price_mur ?? 0))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (variantPrices.length > 0) return Math.min(...variantPrices);
  return Number(product.base_price_mur ?? 0);
}

export function toCardProduct(product: StoreProductRow): CardProduct {
  return {
    id: product.id,
    name: product.title,
    slug: product.slug,
    image: pickImage(product.product_images),
    price: pickDisplayPrice(product),
    categoryName: product.categories?.name ?? null,
    shortDescription: product.short_description ?? null,
  };
}

export async function getActiveCategories(): Promise<StoreCategory[]> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("id,name,slug,description,image_url,is_active,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("getActiveCategories error:", error);
    return [];
  }

  return (data as StoreCategory[]) ?? [];
}

export async function getCategoryBySlug(slug: string): Promise<StoreCategory | null> {
  const { data, error } = await supabaseServer
    .from("categories")
    .select("id,name,slug,description,image_url,is_active,sort_order")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("getCategoryBySlug error:", error);
    return null;
  }

  return (data as StoreCategory | null) ?? null;
}

export async function getProductsByCategoryId(categoryId: string, limit = 24) {
  const { data, error } = await supabaseServer
    .from("products")
    .select(`
      id,
      title,
      slug,
      short_description,
      description,
      base_price_mur,
      compare_at_price_mur,
      is_featured,
      is_best_seller,
      sort_order,
      created_at,
      category_id,
      categories (
        id,
        name,
        slug
      ),
      product_images (
        image_url,
        storage_path,
        is_primary,
        sort_order,
        alt
      ),
      product_variants (
        price_mur,
        is_active
      )
    `)
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getProductsByCategoryId error:", error);
    return [];
  }

  return ((data ?? []) as StoreProductQueryRow[])
    .map(normalizeStoreProduct)
    .map(toCardProduct);
}

export async function getBestSellerProducts(limit = 24) {
  const { data, error } = await supabaseServer
    .from("products")
    .select(`
      id,
      title,
      slug,
      short_description,
      description,
      base_price_mur,
      compare_at_price_mur,
      is_featured,
      is_best_seller,
      sort_order,
      created_at,
      category_id,
      categories (
        id,
        name,
        slug
      ),
      product_images (
        image_url,
        storage_path,
        is_primary,
        sort_order,
        alt
      ),
      product_variants (
        price_mur,
        is_active
      )
    `)
    .eq("is_active", true)
    .eq("is_best_seller", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getBestSellerProducts error:", error);
    return [];
  }

  return ((data ?? []) as StoreProductQueryRow[])
    .map(normalizeStoreProduct)
    .map(toCardProduct);
}

export async function getNewArrivalProducts(limit = 24) {
  const { data, error } = await supabaseServer
    .from("products")
    .select(`
      id,
      title,
      slug,
      short_description,
      description,
      base_price_mur,
      compare_at_price_mur,
      is_featured,
      is_best_seller,
      sort_order,
      created_at,
      category_id,
      categories (
        id,
        name,
        slug
      ),
      product_images (
        image_url,
        storage_path,
        is_primary,
        sort_order,
        alt
      ),
      product_variants (
        price_mur,
        is_active
      )
    `)
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getNewArrivalProducts error:", error);
    return [];
  }

  return ((data ?? []) as StoreProductQueryRow[])
    .map(normalizeStoreProduct)
    .map(toCardProduct);
}


export async function getProductsByCategorySlug(slug: string, limit = 36) {
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      category: null,
      items: [],
    };
  }

  const items = await getProductsByCategoryId(category.id, limit);

  return {
    category,
    items,
  };
}


export async function getShopProducts(filters?: {
  category?: string;
  q?: string;
  sort?: string;
}) {
  let query = supabaseServer
    .from("products")
    .select(`
      id,
      title,
      slug,
      short_description,
      description,
      base_price_mur,
      compare_at_price_mur,
      is_featured,
      is_best_seller,
      sort_order,
      created_at,
      category_id,
      categories (
        id,
        name,
        slug
      ),
      product_images (
        image_url,
        storage_path,
        is_primary,
        sort_order,
        alt
      ),
      product_variants (
        price_mur,
        is_active
      )
    `)
    .eq("is_active", true);

  if (filters?.category) {
    const { data: cat } = await supabaseServer
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .eq("is_active", true)
      .maybeSingle();

    if (cat?.id) {
      query = query.eq("category_id", cat.id);
    } else {
      return [];
    }
  }

  if (filters?.q) {
    const q = filters.q.trim();
    if (q) {
      query = query.or(
        `title.ilike.%${q}%,short_description.ilike.%${q}%,description.ilike.%${q}%`
      );
    }
  }

  const sort = filters?.sort ?? "latest";

  if (sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (sort === "featured") {
    query = query
      .order("is_featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
  } else {
    query = query
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });
  }

  const { data, error } = await query.limit(48);

  if (error) {
    console.error("getShopProducts error:", error);
    return [];
  }

  let items = ((data ?? []) as StoreProductQueryRow[])
    .map(normalizeStoreProduct)
    .map(toCardProduct);

  if (sort === "price-asc") {
    items = [...items].sort((a, b) => a.price - b.price);
  } else if (sort === "price-desc") {
    items = [...items].sort((a, b) => b.price - a.price);
  } else if (sort === "name-asc") {
    items = [...items].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "name-desc") {
    items = [...items].sort((a, b) => b.name.localeCompare(a.name));
  }

  return items;
}