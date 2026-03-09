import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { getActiveCategories, getShopProducts } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Shop | Mea Kréation",
  description: "Browse all handmade products from Mea Kréation.",
};

type Props = {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
  }>;
};

function prettySortLabel(sort: string) {
  switch (sort) {
    case "featured":
      return "Featured";
    case "price-asc":
      return "Price: Low to High";
    case "price-desc":
      return "Price: High to Low";
    case "name-asc":
      return "Name: A to Z";
    case "name-desc":
      return "Name: Z to A";
    case "oldest":
      return "Oldest";
    default:
      return "Latest";
  }
}

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams;

  const category = (sp.category || "").trim();
  const q = (sp.q || "").trim();
  const sort = (sp.sort || "latest").trim();

  const [categories, products] = await Promise.all([
    getActiveCategories(),
    getShopProducts({ category, q, sort }),
  ]);

  const selectedCategory =
    categories.find((cat) => cat.slug === category)?.name || category;

  return (
    <div className="bg-[#fffaf7]">
      <section className="border-b border-black/5 bg-[radial-gradient(circle_at_top,rgba(255,233,240,0.9),rgba(255,250,247,1)_55%)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="overflow-hidden rounded-[32px] border border-[#ead7de] bg-white/80 p-6 shadow-[0_30px_90px_-55px_rgba(80,40,50,0.28)] backdrop-blur sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#9b6b79]">
                  Collection
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#3f272d] sm:text-4xl lg:text-5xl">
                  Shop Mea Kréation
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f5a60] sm:text-base">
                  Discover our premium handmade creations, thoughtfully crafted
                  in Mauritius for women who love elegance, softness, and timeless
                  beauty.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/best-sellers"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#8f4f63] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    View Best Sellers
                  </Link>

                  <Link
                    href="/new-arrivals"
                    className="inline-flex items-center justify-center rounded-2xl border border-[#d9c2ca] bg-white px-5 py-3 text-sm font-medium text-[#4b2e26] transition hover:bg-[#fff3f7]"
                  >
                    View New Arrivals
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:max-w-[340px]">
                <div className="rounded-2xl border border-[#ecd8de] bg-[#fff6f8] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-[#9b6b79]">
                    Categories
                  </div>
                  <div className="mt-2 text-lg font-semibold text-[#3f272d]">
                    {categories.length}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#ecd8de] bg-[#fff6f8] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-[#9b6b79]">
                    Products
                  </div>
                  <div className="mt-2 text-lg font-semibold text-[#3f272d]">
                    {products.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[#7f676e]">
            <span className="rounded-full border border-[#e8d7dc] bg-white px-3 py-1.5">
              Handmade Luxury
            </span>
            <span className="rounded-full border border-[#e8d7dc] bg-white px-3 py-1.5">
              Premium Fabrics
            </span>
            <span className="rounded-full border border-[#e8d7dc] bg-white px-3 py-1.5">
              Mauritius Crafted
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-[#ead7de] bg-white p-4 shadow-[0_18px_50px_-40px_rgba(80,40,50,0.22)] sm:p-5 lg:p-6">
          <form className="grid gap-3 md:grid-cols-[1.5fr_1fr_1fr_auto]">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search products..."
              className="h-12 rounded-2xl border border-[#e5d5da] bg-[#fffdfd] px-4 text-sm text-[#4b2e26] outline-none transition placeholder:text-[#9d8a90] focus:border-[#c996a6]"
            />

            <select
              name="category"
              defaultValue={category}
              className="h-12 rounded-2xl border border-[#e5d5da] bg-[#fffdfd] px-4 text-sm text-[#4b2e26] outline-none transition focus:border-[#c996a6]"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              name="sort"
              defaultValue={sort}
              className="h-12 rounded-2xl border border-[#e5d5da] bg-[#fffdfd] px-4 text-sm text-[#4b2e26] outline-none transition focus:border-[#c996a6]"
            >
              <option value="latest">Latest</option>
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="oldest">Oldest</option>
            </select>

            <button
              type="submit"
              className="h-12 rounded-2xl bg-[#8f4f63] px-5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Apply
            </button>
          </form>

          {(q || category || sort !== "latest") && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-[#8c757c]">Active filters:</span>

              {q ? (
                <span className="rounded-full border border-[#ead7de] bg-[#fff6f8] px-3 py-1 text-[#6f5a60]">
                  Search: {q}
                </span>
              ) : null}

              {category ? (
                <span className="rounded-full border border-[#ead7de] bg-[#fff6f8] px-3 py-1 text-[#6f5a60]">
                  Category: {selectedCategory}
                </span>
              ) : null}

              {sort !== "latest" ? (
                <span className="rounded-full border border-[#ead7de] bg-[#fff6f8] px-3 py-1 text-[#6f5a60]">
                  Sort: {prettySortLabel(sort)}
                </span>
              ) : null}

              <Link
                href="/shop"
                className="rounded-full border border-[#e5d5da] px-3 py-1 text-[#6f5a60] transition hover:bg-[#fff3f7]"
              >
                Clear all
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        {products.length ? (
          <>
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-[#8c757c]">
                {products.length} product{products.length > 1 ? "s" : ""} found
              </div>

              <div className="text-xs text-[#9b6b79]">
                Curated handmade elegance by Mea Kréation
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image || "",
                    slug: product.slug,
                  }}
                  showQuickAdd
                />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-[28px] border border-dashed border-[#d9c2ca] bg-white p-10 text-center shadow-[0_20px_70px_-55px_rgba(80,40,50,0.25)]">
            <h2 className="text-xl font-semibold text-[#3f272d]">
              No products found
            </h2>
            <p className="mt-2 text-[#6f5a60]">
              Try changing your search, category, or sorting options.
            </p>
            <Link
              href="/shop"
              className="mt-5 inline-flex rounded-2xl bg-[#8f4f63] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Reset shop
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}