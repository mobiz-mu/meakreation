"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { mur } from "@/lib/money";
import { useCart } from "@/store/cart";

type ShippingMethod = {
  id: string;
  name: string;
  price_mur: number;
};

export default function CheckoutClient({
  shippingMethods,
}: {
  shippingMethods: ShippingMethod[];
}) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    whatsapp: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    postalCode: "",
    country: "Mauritius",
    notes: "",
    paymentMethod: "cash-on-delivery",
    shippingMethodId:
     shippingMethods.find((m) => m.name.toLowerCase().includes("home"))?.id ||
     shippingMethods[0]?.id ||
     "",
  });

  const [submitting, setSubmitting] = useState(false);

  const selectedShipping = useMemo(
    () => shippingMethods.find((m) => m.id === form.shippingMethodId) || null,
    [shippingMethods, form.shippingMethodId]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPriceMur * item.qty, 0),
    [items]
  );

  const shipping = Number(selectedShipping?.price_mur ?? 0);
  const total = subtotal + shipping;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!items.length) {
      alert("Your cart is empty.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          items,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Unable to place order.");
      }

      clear();
      router.push(`/checkout/success?orderNo=${encodeURIComponent(json.orderNo)}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to place order.";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <form
        onSubmit={onSubmit}
        className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <p className="text-sm uppercase tracking-[0.22em] text-neutral-500">
          Checkout
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
          Complete Your Order
        </h1>

        {!items.length ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your cart is empty. Please add products before placing an order.
        </div>
        ) : null}

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-900">
              First Name
            </label>
            <input
              type="text"
              required
              value={form.firstName}
              onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
              className="h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none transition focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-900">
              Last Name
            </label>
            <input
              type="text"
              required
              value={form.lastName}
              onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
              className="h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none transition focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-900">
              Phone
            </label>
            <input
              type="text"
              required
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none transition focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-900">
              WhatsApp
            </label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value }))}
              className="h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none transition focus:border-neutral-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-neutral-900">
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none transition focus:border-neutral-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-neutral-900">
              Address Line 1
            </label>
            <input
              type="text"
              required
              value={form.addressLine1}
              onChange={(e) =>
                setForm((p) => ({ ...p, addressLine1: e.target.value }))
              }
              className="h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none transition focus:border-neutral-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-neutral-900">
              Address Line 2
            </label>
            <input
              type="text"
              value={form.addressLine2}
              onChange={(e) =>
                setForm((p) => ({ ...p, addressLine2: e.target.value }))
              }
              className="h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none transition focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-900">
              City
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
              className="h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none transition focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-900">
              District
            </label>
            <input
              type="text"
              value={form.district}
              onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))}
              className="h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none transition focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-900">
              Postal Code
            </label>
            <input
              type="text"
              value={form.postalCode}
              onChange={(e) =>
                setForm((p) => ({ ...p, postalCode: e.target.value }))
              }
              className="h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none transition focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-900">
              Country
            </label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
              className="h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none transition focus:border-neutral-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-900">
              Shipping Method
            </label>
            <select
              required
              value={form.shippingMethodId}
              onChange={(e) =>
                setForm((p) => ({ ...p, shippingMethodId: e.target.value }))
              }
              className="h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none transition focus:border-neutral-400"
            >
              {shippingMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name} — {mur(method.price_mur)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-900">
              Payment Method
            </label>
            <select
              value={form.paymentMethod}
              onChange={(e) =>
                setForm((p) => ({ ...p, paymentMethod: e.target.value }))
              }
              className="h-12 w-full rounded-2xl border border-neutral-200 px-4 outline-none transition focus:border-neutral-400"
            >
              <option value="cash-on-delivery">Cash on Delivery</option>
              <option value="bank-transfer">Bank Transfer</option>
              <option value="juice">MCB Juice</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-neutral-900">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={4}
              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-neutral-400"
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            disabled={submitting || !items.length}
            className="rounded-full bg-[#6f4a3f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f3f36] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </form>

      <aside className="h-fit rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900">
          Order Summary
        </h2>

        <div className="mt-6 space-y-4">
          {items.length ? (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex gap-3 rounded-2xl border border-neutral-100 p-3"
              >
                <div className="relative h-20 w-16 overflow-hidden rounded-xl bg-neutral-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-medium text-neutral-900">
                    {item.title}
                  </div>
                  {item.variantLabel ? (
                    <div className="mt-1 text-xs text-neutral-500">
                      {item.variantLabel}
                    </div>
                  ) : null}
                  <div className="mt-2 text-sm text-neutral-600">
                    Qty: {item.qty}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-neutral-900">
                    {mur(item.unitPriceMur * item.qty)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-neutral-600">Your cart is empty.</p>
          )}
        </div>

        <div className="mt-8 space-y-3 border-t border-neutral-200 pt-6">
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <span>Subtotal</span>
            <span>{mur(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-neutral-600">
            <span>Shipping</span>
            <span>{mur(shipping)}</span>
          </div>

          <div className="flex items-center justify-between text-base font-semibold text-neutral-900">
            <span>Total</span>
            <span>{mur(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}