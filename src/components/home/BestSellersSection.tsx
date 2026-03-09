import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { supabaseServer } from "@/lib/supabase/server-public";

type CardProduct = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  slug: string;
};

function pickImage(images: any[] | null | undefined) {
  const list = Array.isArray(images) ? images : [];

  const sorted = [...list].sort(
    (a, b) =>
      (b?.is_primary ? 1 : 0) - (a?.is_primary ? 1 : 0) ||
      (a?.sort_order ?? 0) - (b?.sort_order ?? 0)
  );

  const first = sorted[0];
  const url = (first?.image_url || "").trim();

  return url || null;
}

export default async function BestSellersSection() {
  const { data: rows, error } = await supabaseServer
    .from("products")
    .select(
      `
        id,
        title,
        slug,
        base_price_mur,
        is_active,
        is_best_seller,
        sort_order,
        created_at,
        product_images (
          image_url,
          storage_path,
          is_primary,
          sort_order,
          alt
        )
      `
    )
    .eq("is_active", true)
    .eq("is_best_seller", true)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("BestSellersSection load error:", error);
    return null;
  }

  const filtered = (rows ?? []).filter(
    (p: any) => p?.is_active === true && p?.is_best_seller === true
  );

  const items: CardProduct[] = filtered.map((p: any) => ({
    id: p.id,
    name: p.title,
    slug: p.slug,
    price: Number(p.base_price_mur ?? 0),
    image: pickImage(p.product_images),
  }));

  if (!items.length) return null;

  return (
    <section className="relative overflow-hidden bg-white py-14 md:py-20">
      {/* soft premium ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-8 h-28 w-28 rounded-full bg-[hsl(var(--brand-pink-light))]/20 blur-3xl" />
        <div className="absolute right-[10%] top-12 h-32 w-32 rounded-full bg-[hsl(var(--brand-pink-dark))]/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
        {/* header */}
        <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-neutral-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500 shadow-sm md:text-[11px]">
              Curated Picks
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 md:text-4xl">
              Best Sellers
            </h2>

            <p className="mt-3 text-sm leading-7 text-neutral-600 md:text-[15px]">
              Explore the pieces our customers love most — handcrafted favorites
              selected from the Mea Kréation collection, made in limited
              quantities with elegance and care.
            </p>
          </div>

          <div className="hidden sm:block">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-900 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-md"
            >
              View All Best Sellers
            </Link>
          </div>
        </div>

        {/* premium container */}
        <div className="rounded-[28px] border border-neutral-100 bg-white p-3 shadow-[0_20px_70px_rgba(17,17,17,0.05)] md:rounded-[32px] md:p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-5">
            {items.map((p) => (
              <div
                key={p.id}
                className="rounded-[22px] border border-transparent bg-white transition duration-300 hover:-translate-y-1"
              >
                <ProductCard
                  product={{
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    image: p.image || "",
                    slug: p.slug,
                  }}
                  showQuickAdd
                />
              </div>
            ))}
          </div>
        </div>

        {/* mobile button */}
        <div className="mt-6 sm:hidden">
          <Link
            href="/shop"
            className="inline-flex w-full items-center justify-center rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-900 shadow-sm transition duration-300 hover:bg-neutral-50"
          >
            View All Best Sellers
          </Link>
        </div>
      </div>
    </section>
  );
}