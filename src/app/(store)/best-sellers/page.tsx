import type { Metadata } from "next";
import CollectionPageClient from "@/components/store/CollectionPageClient";
import { getBestSellerProducts } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "Best Sellers | Mea Kréation",
  description: "Shop the most loved handmade pieces from Mea Kréation.",
};

export default async function BestSellersPage() {
  const items = await getBestSellerProducts(36);

  return (
    <CollectionPageClient
      eyebrow="Curated Picks"
      title="Best Sellers"
      subtitle="Discover the most loved handmade pieces from Mea Kréation — elegant creations chosen for their charm, femininity, and premium artisanal finish."
      items={items}
      primaryCtaHref="/shop"
      primaryCtaLabel="Shop All Products"
      secondaryCtaHref="/new-arrivals"
      secondaryCtaLabel="View New Arrivals"
      emptyTitle="No best sellers yet"
      emptyText="Once products are marked as best sellers, they will appear here."
    />
  );
}