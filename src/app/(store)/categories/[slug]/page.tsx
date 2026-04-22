import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CollectionPageClient from "@/components/store/CollectionPageClient";
import {
  getActiveCategories,
  getCategoryBySlug,
  getProductsByCategoryId,
} from "@/lib/storefront";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const categories = await getActiveCategories();

  return categories.map((category) => ({
    slug: category.slug,
  }));
}

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
    <CollectionPageClient
      eyebrow="Category"
      title={category.name}
      subtitle={
        category.description ||
        `Discover refined handmade pieces from the ${category.name} collection, thoughtfully curated with elegance, softness, and a premium boutique finish.`
      }
      items={items}
      primaryCtaHref="/shop"
      primaryCtaLabel="Shop All Products"
      secondaryCtaHref="/categories"
      secondaryCtaLabel="View All Categories"
      emptyTitle="No products yet"
      emptyText="We are preparing this collection. Please check back soon."
      heroImage={category.image_url}
    />
  );
}