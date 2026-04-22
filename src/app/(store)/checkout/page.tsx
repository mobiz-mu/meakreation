import type { Metadata } from "next";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | Mea Kréation",
  description: "Complete your order securely with Mea Kréation.",
};

type ShippingMethod = {
  id: string;
  name: string;
  price_mur: number;
};

async function getShippingMethods(): Promise<ShippingMethod[]> {
  return [
    {
      id: "790203ba-147f-47ea-a456-22ef3c2bc4de",
      name: "Postage (Normal)",
      price_mur: 75,
    },
    {
      id: "b4c6d5b6-dac2-44ae-960b-cdf0b8991af3",
      name: "Postage (Express)",
      price_mur: 100,
    },
    {
      id: "7dc31447-c4cb-4caf-867c-f13855d57664",
      name: "Home Delivery",
      price_mur: 150,
    },
  ];
}

export default async function CheckoutPage() {
  const shippingMethods = await getShippingMethods();

  return (
    <main className="min-h-screen bg-[#fffaf7]">
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
        <CheckoutClient shippingMethods={shippingMethods} />
      </section>
    </main>
  );
}