import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getActiveCategories } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Categories | Mea Kréation",
  description: "Explore all handmade product categories from Mea Kréation.",
};

export default async function CategoriesPage() {
  const categories = await getActiveCategories();

  return (
    <main className="bg-[#fffaf7]">
      <section className="border-b border-black/5 bg-[radial-gradient(circle_at_top,rgba(255,236,242,0.60),rgba(255,250,247,1)_58%)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
          <div className="max-w-3xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.30em] text-[#9b6b79] sm:text-[11px]">
              Curated Collections
            </p>

            <h1 className="mt-2 text-[2rem] font-semibold tracking-tight text-[#3f272d] sm:text-[2.5rem] lg:text-[3rem]">
              Categories
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#6f5a60] sm:text-[15px]">
              Explore each handmade collection through a refined boutique
              experience, with every category connected directly to your backend.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        {categories.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group overflow-hidden rounded-[28px] border border-[#ead7de] bg-white shadow-[0_20px_70px_-55px_rgba(80,40,50,0.20)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_85px_-50px_rgba(80,40,50,0.28)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#f6eef1]">
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#9b6b79]">
                      Mea Kréation
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-6">
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#9b6b79]">
                    Category
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#3f272d]">
                    {cat.name}
                  </h2>

                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#6f5a60]">
                    {cat.description || `Explore the ${cat.name} collection.`}
                  </p>

                  <div className="mt-5 inline-flex items-center justify-center rounded-full border border-[#d9c2ca] bg-[#fff7fa] px-4 py-2 text-sm font-medium text-[#4b2e26] transition group-hover:bg-[#8f4f63] group-hover:text-white">
                    Explore Collection
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
      </section>
    </main>
  );
}