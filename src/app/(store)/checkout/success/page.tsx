import type { Metadata } from "next";
import CheckoutSuccessClient from "@/components/checkout/CheckoutSuccessClient";

export const metadata: Metadata = {
  title: "Order Confirmation | Mea Kréation",
  description: "Your order has been received by Mea Kréation.",
};

type Props = {
  searchParams: Promise<{
    orderNo?: string;
    t?: string;
  }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const sp = await searchParams;

  return (
    <main className="bg-[#fffaf7] min-h-screen">
      <CheckoutSuccessClient
        orderNo={sp.orderNo ?? ""}
        publicToken={sp.t ?? ""}
      />
    </main>
  );
}