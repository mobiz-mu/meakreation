import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Categories | Mea Kréation",
  description: "Explore all handmade product categories from Mea Kréation.",
};

export default function CategoriesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            className="rounded-2xl border border-neutral-200 bg-white p-5 transition hover:shadow-md"
          >
            <div className="text-lg font-medium">{cat.name}</div>
            <div className="mt-2 text-sm text-neutral-600">Explore this collection</div>
          </Link>
        ))}
      </div>
    </main>
  );
}