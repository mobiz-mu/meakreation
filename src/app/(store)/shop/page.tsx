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
      <section className="border-b border-black/5 bg-[radial-gradient(circle_at_top,rgba(255,236,242,0.62),rgba(255,250,247,1)_58%)]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[10px] font-medium uppercase tracking-[0.30em] text-[#9b6b79] sm:text-[11px]">
                Signature Boutique
              </p>

              <h1 className="mt-2 text-[2rem] font-semibold tracking-tight text-[#3f272d] sm:text-[2.5rem] lg:text-[3rem]">
                Shop Mea Kréation
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6f5a60] sm:text-[15px]">
                Explore our refined handmade creations, crafted in Mauritius with
                elegance, softness, and a premium feminine finish.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href="/best-sellers"
                  className="inline-flex items-center justify-center rounded-full bg-[#8f4f63] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  View Best Sellers
                </Link>

                <Link
                  href="/new-arrivals"
                  className="inline-flex items-center justify-center rounded-full border border-[#d9c2ca] bg-white px-5 py-3 text-sm font-medium text-[#4b2e26] transition hover:bg-[#fff3f7]"
                >
                  View New Arrivals
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#7f676e] lg:justify-end">
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
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="grid gap-6 lg:grid-cols-[285px_minmax(0,1fr)] xl:gap-8">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[28px] border border-[#ead7de] bg-white p-5 shadow-[0_20px_70px_-55px_rgba(80,40,50,0.25)]">
              <div className="border-b border-[#f0e4e8] pb-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#9b6b79]">
                  Filters
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#3f272d]">
                  Refine Shop
                </h2>
              </div>

              <form className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.20em] text-[#8b6b74]">
                    Search
                  </label>
                  <input
                    type="text"
                    name="q"
                    defaultValue={q}
                    placeholder="Search products..."
                    className="h-12 w-full rounded-2xl border border-[#ead7de] bg-[#fffdfc] px-4 text-sm text-[#3f272d] outline-none transition placeholder:text-[#a58e96] focus:border-[#cfa9b7]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.20em] text-[#8b6b74]">
                    Category
                  </label>
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-12 w-full rounded-2xl border border-[#ead7de] bg-[#fffdfc] px-4 text-sm text-[#3f272d] outline-none transition focus:border-[#cfa9b7]"
                  >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.20em] text-[#8b6b74]">
                    Sort By
                  </label>
                  <select
                    name="sort"
                    defaultValue={sort}
                    className="h-12 w-full rounded-2xl border border-[#ead7de] bg-[#fffdfc] px-4 text-sm text-[#3f272d] outline-none transition focus:border-[#cfa9b7]"
                  >
                    <option value="latest">Latest</option>
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                    <option value="name-desc">Name: Z to A</option>
                    <option value="oldest">Oldest</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#8f4f63] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Apply Filters
                </button>

                <Link
                  href="/shop"
                  className="block w-full rounded-full border border-[#d9c2ca] bg-white px-5 py-3 text-center text-sm font-medium text-[#4b2e26] transition hover:bg-[#fff3f7]"
                >
                  Reset Shop
                </Link>
              </form>
            </div>
          </aside>

          <div>
            <div className="mb-4 rounded-[24px] border border-[#ead7de] bg-white px-5 py-4 shadow-[0_20px_60px_-50px_rgba(80,40,50,0.18)]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.20em] text-[#9b6b79]">
                    Showing
                  </div>
                  <div className="mt-1 text-lg font-semibold text-[#3f272d]">
                    {products.length} Product{products.length === 1 ? "" : "s"}
                  </div>
                </div>

                <div className="text-sm text-[#7a666d]">
                  {category ? `Category: ${selectedCategory}` : "All collections"}{" "}
                  • {prettySortLabel(sort)}
                </div>
              </div>

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

            {products.length ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
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
          </div>
        </div>
      </section>
    </div>
  );
}