import type { Metadata } from "next";
import CollectionPageClient from "@/components/store/CollectionPageClient";
import { getNewArrivalProducts } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "New Arrivals | Mea Kréation",
  description: "Discover the latest handmade arrivals from Mea Kréation.",
};

export default async function NewArrivalsPage() {
  const items = await getNewArrivalProducts(36);

  return (
    <CollectionPageClient
      eyebrow="Latest Collection"
      title="New Arrivals"
      subtitle="Explore the newest handmade pieces from Mea Kréation — fresh, refined creations designed with softness, elegance, and a luxury boutique touch."
      items={items}
      primaryCtaHref="/shop"
      primaryCtaLabel="Shop All Products"
      secondaryCtaHref="/best-sellers"
      secondaryCtaLabel="View Best Sellers"
      emptyTitle="No new arrivals yet"
      emptyText="Newly added products will appear here as soon as they are published."
    />
  );
}