import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { getActiveCategories } from "@/lib/storefront";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Categories | Mea Kréation",
  description: "Explore all handmade product categories from Mea Kréation.",
};

export default async function CategoriesPage() {
  const categories = await getActiveCategories();

  return (
    <main className="min-h-screen bg-[#fffaf7] text-[#3f272d]">
      {/* Compact Premium Header */}
      <section className="sticky top-0 z-30 border-b border-[#ead7de]/80 bg-[#fffaf7]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.30em] text-[#9b6b79]">
              Curated Collections
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Categories
            </h1>
          </div>

          <div className="hidden rounded-full border border-[#ead7de] bg-white px-4 py-2 text-xs font-medium text-[#6f5a60] shadow-sm sm:flex">
            {categories.length} Collections
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        {/* Fixed / Sticky Left Sidebar */}
        <aside className="lg:sticky lg:top-[86px] lg:h-[calc(100vh-110px)] lg:self-start">
          <div className="overflow-hidden rounded-[28px] border border-[#ead7de] bg-white shadow-[0_24px_80px_-60px_rgba(80,40,50,0.35)]">
            <div className="border-b border-[#ead7de] bg-[#fff4f7] p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8f4f63] text-white">
                  <Sparkles size={16} />
                </span>
                <div>
                  <p className="text-sm font-semibold">Mea Kréation</p>
                  <p className="text-xs text-[#8d747b]">Handmade boutique</p>
                </div>
              </div>
            </div>

            <div className="max-h-[55vh] space-y-1 overflow-y-auto p-3 lg:max-h-[calc(100vh-230px)]">
              {categories.length ? (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className="group flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium text-[#5f474d] transition hover:bg-[#fff4f7] hover:text-[#8f4f63]"
                  >
                    <span className="line-clamp-1">{cat.name}</span>
                    <ArrowRight
                      size={14}
                      className="opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
                    />
                  </Link>
                ))
              ) : (
                <p className="p-3 text-sm text-[#8d747b]">No categories yet.</p>
              )}
            </div>

            <div className="border-t border-[#ead7de] p-4">
              <Link
                href="/products"
                className="flex w-full items-center justify-center rounded-full bg-[#3f272d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8f4f63]"
              >
                View All Products
              </Link>
            </div>
          </div>
        </aside>

        {/* Scrollable Main Content */}
        <div className="min-w-0">
          <div className="mb-5 rounded-[28px] border border-[#ead7de] bg-[radial-gradient(circle_at_top_left,rgba(255,236,242,0.9),#ffffff_55%)] p-5 shadow-[0_24px_80px_-65px_rgba(80,40,50,0.35)] sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#9b6b79]">
              Explore by Collection
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Discover handmade pieces by category
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6f5a60]">
              Browse every collection in a refined boutique layout, connected
              directly to your live backend.
            </p>
          </div>

          {categories.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group overflow-hidden rounded-[30px] border border-[#ead7de] bg-white shadow-[0_24px_80px_-60px_rgba(80,40,50,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_90px_-55px_rgba(80,40,50,0.42)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#f6eef1]">
                    {cat.image_url ? (
                      <Image
                        src={cat.image_url}
                        alt={cat.name}
                        fill
                        priority={false}
                        className="object-cover transition duration-700 group-hover:scale-[1.06]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-medium text-[#9b6b79]">
                        Mea Kréation
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#3f272d]/55 via-transparent to-transparent opacity-80" />

                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8f4f63] backdrop-blur">
                        Category
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <h2 className="text-2xl font-semibold tracking-tight text-[#3f272d]">
                      {cat.name}
                    </h2>

                    <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#6f5a60]">
                      {cat.description || `Explore the ${cat.name} collection.`}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#8f4f63]">
                        Explore Collection
                      </span>

                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c2ca] bg-[#fff7fa] text-[#4b2e26] transition group-hover:bg-[#8f4f63] group-hover:text-white">
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-[#d9c2ca] bg-white p-10 text-center shadow-[0_20px_70px_-55px_rgba(80,40,50,0.25)]">
              <h2 className="text-xl font-semibold text-[#3f272d]">
                No categories yet
              </h2>
              <p className="mt-2 text-[#6f5a60]">
                Categories created in your backend will appear here.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}