"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/shop/ProductCard";

type Item = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  slug: string;
};

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: Item[];
  primaryCtaHref: string;
  primaryCtaLabel: string;
  secondaryCtaHref: string;
  secondaryCtaLabel: string;
  emptyTitle: string;
  emptyText: string;
  heroImage?: string | null;
};

type SortFilter = "featured" | "az" | "priceLow" | "priceHigh";

export default function CollectionPageClient({
  eyebrow,
  title,
  subtitle,
  items,
  primaryCtaHref,
  primaryCtaLabel,
  secondaryCtaHref,
  secondaryCtaLabel,
  emptyTitle,
  emptyText,
  heroImage = null,
}: Props) {
  const prices = items.map((item) => Number(item.price) || 0);
  const absoluteMin = prices.length ? Math.min(...prices) : 0;
  const absoluteMax = prices.length ? Math.max(...prices) : 5000;

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortFilter>("featured");
  const [minPrice, setMinPrice] = useState<number>(absoluteMin);
  const [maxPrice, setMaxPrice] = useState<number>(absoluteMax);

  const filteredItems = useMemo(() => {
    let list = [...items];

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => item.name.toLowerCase().includes(q));
    }

    list = list.filter((item) => {
      const price = Number(item.price) || 0;
      return price >= minPrice && price <= maxPrice;
    });

    if (sortBy === "az") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "priceLow") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceHigh") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [items, maxPrice, minPrice, search, sortBy]);

  function resetFilters() {
    setSearch("");
    setSortBy("featured");
    setMinPrice(absoluteMin);
    setMaxPrice(absoluteMax);
  }

  return (
    <div className="bg-[#fffaf7]">
      <section className="border-b border-black/5 bg-[radial-gradient(circle_at_top,rgba(255,236,242,0.60),rgba(255,250,247,1)_58%)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.30em] text-[#9b6b79] sm:text-[11px]">
                {eyebrow}
              </p>

              <h1 className="mt-2 text-[2rem] font-semibold tracking-tight text-[#3f272d] sm:text-[2.5rem] lg:text-[3rem]">
                {title}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6f5a60] sm:text-[15px]">
                {subtitle}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Link
                  href={primaryCtaHref}
                  className="inline-flex items-center justify-center rounded-full bg-[#8f4f63] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  {primaryCtaLabel}
                </Link>

                <Link
                  href={secondaryCtaHref}
                  className="inline-flex items-center justify-center rounded-full border border-[#d9c2ca] bg-white px-5 py-3 text-sm font-medium text-[#4b2e26] transition hover:bg-[#fff3f7]"
                >
                  {secondaryCtaLabel}
                </Link>
              </div>
            </div>

            {heroImage ? (
              <div className="hidden lg:block">
                <div className="relative min-h-[180px] overflow-hidden rounded-[26px] border border-[#ead7de] bg-white shadow-[0_18px_55px_-40px_rgba(80,40,50,0.22)]">
                  <Image
                    src={heroImage}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3f272d]/60 to-transparent p-4">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-white/80">
                      Signature Collection
                    </div>
                    <div className="mt-1 text-lg font-semibold text-white">
                      {title}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:gap-8">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-[28px] border border-[#ead7de] bg-white p-5 shadow-[0_20px_70px_-55px_rgba(80,40,50,0.25)]">
              <div className="border-b border-[#f0e4e8] pb-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#9b6b79]">
                  Filters
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#3f272d]">
                  Refine Collection
                </h2>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.20em] text-[#8b6b74]">
                    Search
                  </label>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search product name..."
                    className="h-12 w-full rounded-2xl border border-[#ead7de] bg-[#fffdfc] px-4 text-sm text-[#3f272d] outline-none transition placeholder:text-[#a58e96] focus:border-[#cfa9b7] focus:ring-2 focus:ring-[#f3d7e0]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.20em] text-[#8b6b74]">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortFilter)}
                    className="h-12 w-full rounded-2xl border border-[#ead7de] bg-[#fffdfc] px-4 text-sm text-[#3f272d] outline-none transition focus:border-[#cfa9b7] focus:ring-2 focus:ring-[#f3d7e0]"
                  >
                    <option value="featured">Featured Order</option>
                    <option value="az">Name A–Z</option>
                    <option value="priceLow">Price Low to High</option>
                    <option value="priceHigh">Price High to Low</option>
                  </select>
                </div>

                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.20em] text-[#8b6b74]">
                    Price Range
                  </div>

                  <div className="rounded-[22px] border border-[#efe4e8] bg-[#fffafb] p-4">
                    <div className="mb-4 flex items-center justify-between text-sm font-medium text-[#4b2e26]">
                      <span>Rs {minPrice.toLocaleString("en-MU")}</span>
                      <span>Rs {maxPrice.toLocaleString("en-MU")}</span>
                    </div>

                    <div className="space-y-4">
                      <input
                        type="range"
                        min={absoluteMin}
                        max={absoluteMax}
                        step={50}
                        value={minPrice}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setMinPrice(Math.min(value, maxPrice));
                        }}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#edd8df] accent-[#8f4f63]"
                      />

                      <input
                        type="range"
                        min={absoluteMin}
                        max={absoluteMax}
                        step={50}
                        value={maxPrice}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setMaxPrice(Math.max(value, minPrice));
                        }}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[#edd8df] accent-[#8f4f63]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full rounded-full border border-[#d9c2ca] bg-white px-5 py-3 text-sm font-medium text-[#4b2e26] transition hover:bg-[#fff3f7]"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex flex-col gap-3 rounded-[24px] border border-[#ead7de] bg-white px-5 py-4 shadow-[0_20px_60px_-50px_rgba(80,40,50,0.18)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.20em] text-[#9b6b79]">
                  Showing
                </div>
                <div className="mt-1 text-lg font-semibold text-[#3f272d]">
                  {filteredItems.length} Product{filteredItems.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="text-sm text-[#7a666d]">
                A refined boutique selection with a luxury finish.
              </div>
            </div>

            {filteredItems.length ? (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {filteredItems.map((product) => (
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
                  {emptyTitle}
                </h2>
                <p className="mt-2 text-[#6f5a60]">{emptyText}</p>

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
          </div>
        </div>
      </section>
    </div>
  );
}