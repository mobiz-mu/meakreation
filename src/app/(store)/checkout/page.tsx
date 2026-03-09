import type { Metadata } from "next";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import { supabaseServer } from "@/lib/supabase/server-public";

export const metadata: Metadata = {
  title: "Checkout | Mea Kréation",
  description: "Complete your order with Mea Kréation.",
};

export default async function CheckoutPage() {
  const { data } = await supabaseServer
    .from("shipping_methods")
    .select("id,name,price_mur,is_active,sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const shippingMethods = (data ?? []).map((item: any) => ({
    id: item.id,
    name: item.name,
    price_mur: Number(item.price_mur ?? 0),
  }));

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      {shippingMethods.length ? (
        <CheckoutClient shippingMethods={shippingMethods} />
      ) : (
        <div className="rounded-[24px] border border-dashed border-neutral-300 bg-white p-10 text-center">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Shipping methods unavailable
          </h1>
          <p className="mt-3 text-neutral-600">
            Please add at least one active shipping method in Supabase before using checkout.
          </p>
        </div>
      )}
    </main>
  );
}