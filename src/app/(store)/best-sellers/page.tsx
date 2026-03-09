import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { getBestSellerProducts } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Best Sellers | Mea Kréation",
  description: "Shop the most loved handmade pieces from Mea Kréation.",
};

export default async function BestSellersPage() {
  const items = await getBestSellerProducts(36);

  return (
    <div className="bg-[#fffaf7]">
      <section className="border-b border-black/5 bg-[radial-gradient(circle_at_top,rgba(255,233,240,0.9),rgba(255,250,247,1)_55%)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="overflow-hidden rounded-[32px] border border-[#ead7de] bg-white/80 p-6 shadow-[0_30px_90px_-55px_rgba(80,40,50,0.28)] backdrop-blur sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#9b6b79]">
                  Curated Picks
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#3f272d] sm:text-4xl lg:text-5xl">
                  Best Sellers
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f5a60] sm:text-base">
                  Discover the most loved handmade pieces from Mea Kréation —
                  elegant creations designed in limited batches with a premium
                  artisanal touch.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#8f4f63] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                  >
                    Shop All Products
                  </Link>

                  <Link
                    href="/new-arrivals"
                    className="inline-flex items-center justify-center rounded-2xl border border-[#d9c2ca] bg-white px-5 py-3 text-sm font-medium text-[#4b2e26] transition hover:bg-[#fff3f7]"
                  >
                    View New Arrivals
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:max-w-[320px]">
                <div className="rounded-2xl border border-[#ecd8de] bg-[#fff6f8] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-[#9b6b79]">
                    Collection
                  </div>
                  <div className="mt-2 text-lg font-semibold text-[#3f272d]">
                    Handmade Luxury
                  </div>
                </div>

                <div className="rounded-2xl border border-[#ecd8de] bg-[#fff6f8] px-4 py-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-[#9b6b79]">
                    Pieces
                  </div>
                  <div className="mt-2 text-lg font-semibold text-[#3f272d]">
                    {items.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[#7f676e]">
            <span className="rounded-full border border-[#e8d7dc] bg-white px-3 py-1.5">
              Premium Handmade
            </span>
            <span className="rounded-full border border-[#e8d7dc] bg-white px-3 py-1.5">
              Limited Batches
            </span>
            <span className="rounded-full border border-[#e8d7dc] bg-white px-3 py-1.5">
              Mauritius Crafted
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {items.length ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {items.map((product) => (
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
              No best sellers yet
            </h2>
            <p className="mt-2 text-[#6f5a60]">
              Once products are marked as best sellers, they will appear here.
            </p>

            <div className="mt-6">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-2xl bg-[#8f4f63] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Browse Shop
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}