import type { Metadata } from "next";
import CartPageClient from "@/components/cart/CartPageClient";

export const metadata: Metadata = {
  title: "Cart | Mea Kréation",
  description: "Review your selected handmade pieces before checkout.",
};

export default function CartPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <CartPageClient />
    </main>
  );
}