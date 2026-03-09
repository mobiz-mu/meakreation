import type { Metadata } from "next";
import WishlistPageClient from "@/components/wishlist/WishlistPageClient";

export const metadata: Metadata = {
  title: "Wishlist | Mea Kréation",
  description: "View your saved handmade favorites from Mea Kréation.",
};

export default function WishlistPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <WishlistPageClient />
    </main>
  );
}