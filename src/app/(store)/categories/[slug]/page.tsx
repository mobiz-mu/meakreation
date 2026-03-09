import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductCard from "@/components/shop/ProductCard";
import { getCategoryBySlug, getProductsByCategoryId } from "@/lib/storefront";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category not found | Mea Kréation",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${category.name} | Mea Kréation`,
    description:
      category.description ||
      `Explore ${category.name} handmade products from Mea Kréation.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const items = await getProductsByCategoryId(category.id, 36);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm uppercase tracking-[0.22em] text-neutral-500">
          Category
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {category.name}
        </h1>
        {category.description ? (
          <p className="mt-4 max-w-3xl text-neutral-600 leading-7">
            {category.description}
          </p>
        ) : null}
      </section>

      <section className="mt-10">
        {items.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
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
          <div className="rounded-[24px] border border-dashed border-neutral-300 bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-neutral-900">
              No products yet
            </h2>
            <p className="mt-2 text-neutral-600">
              We are preparing this collection. Please check back soon.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}