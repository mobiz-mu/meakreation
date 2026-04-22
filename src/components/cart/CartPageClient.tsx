"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { mur } from "@/lib/money";
import { useCart } from "@/store/cart";

type AnyCartItem = {
  productId?: string;
  product_id?: string;
  variantId?: string | null;
  variant_id?: string | null;
  title?: string;
  name?: string;
  unitPriceMur?: number;
  price?: number;
  imageUrl?: string | null;
  image?: string | null;
  qty?: number;
  variantLabel?: string | null;
  slug?: string;
};

function getProductId(item: AnyCartItem) {
  return item.productId ?? item.product_id ?? "";
}

function getVariantId(item: AnyCartItem) {
  return item.variantId ?? item.variant_id ?? null;
}

function getTitle(item: AnyCartItem) {
  return item.title ?? item.name ?? "Product";
}

function getUnitPrice(item: AnyCartItem) {
  const value = item.unitPriceMur ?? item.price ?? 0;
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function getImage(item: AnyCartItem) {
  return item.imageUrl ?? item.image ?? null;
}

function getQty(item: AnyCartItem) {
  const value = item.qty ?? 1;
  return Math.max(1, Number(value) || 1);
}

export default function CartPageClient() {
  const items = useCart((s) => s.items) as AnyCartItem[];
  const removeItem = useCart((s) => s.removeItem);
  const setQty = useCart((s) => s.setQty);
  const clear = useCart((s) => s.clear);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => sum + getUnitPrice(item) * getQty(item), 0),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + getQty(item), 0),
    [items]
  );

  if (!items.length) {
    return (
      <div className="rounded-[28px] border border-neutral-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm uppercase tracking-[0.22em] text-neutral-500">
          Your Cart
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
          Your cart is empty
        </h1>
        <p className="mt-4 text-neutral-600">
          Browse our premium handmade collection and add your favorite pieces.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-[#6f4a3f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f3f36]"
          >
            Continue Shopping
          </Link>

          <Link
            href="/best-sellers"
            className="rounded-full border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            View Best Sellers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-neutral-500">
              Shopping Bag
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
              Your Cart
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              {totalItems} item{totalItems > 1 ? "s" : ""} in your cart
            </p>
          </div>

          <button
            type="button"
            onClick={() => clear()}
            className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Clear Cart
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {items.map((item) => {
            const productId = getProductId(item);
            const variantId = getVariantId(item);
            const title = getTitle(item);
            const image = getImage(item);
            const unitPrice = getUnitPrice(item);
            const qty = getQty(item);

            return (
              <article
                key={`${productId}-${variantId ?? "default"}`}
                className="flex gap-4 rounded-[24px] border border-neutral-100 bg-white p-4 transition hover:shadow-sm"
              >
                <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-[18px] bg-neutral-100 sm:h-32 sm:w-28">
                  {image ? (
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-neutral-500">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="line-clamp-2 text-base font-semibold tracking-tight text-neutral-900">
                        {title}
                      </h2>

                      {item.variantLabel ? (
                        <p className="mt-1 text-sm text-neutral-500">
                          {item.variantLabel}
                        </p>
                      ) : null}
                    </div>

                    <div className="text-base font-semibold text-neutral-900">
                      {mur(unitPrice * qty)}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-sm text-neutral-600">
                      Unit price:{" "}
                      <span className="font-medium text-neutral-900">
                        {mur(unitPrice)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center overflow-hidden rounded-full border border-neutral-200 bg-white">
                        <button
                          type="button"
                          onClick={() => setQty(productId, variantId, qty - 1)}
                          className="px-4 py-2 text-neutral-800 transition hover:bg-neutral-50"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>

                        <div className="min-w-[42px] text-center text-sm font-semibold text-neutral-900">
                          {qty}
                        </div>

                        <button
                          type="button"
                          onClick={() => setQty(productId, variantId, qty + 1)}
                          className="px-4 py-2 text-neutral-800 transition hover:bg-neutral-50"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(productId, variantId)}
                        className="text-sm font-medium text-rose-600 transition hover:text-rose-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/shop"
            className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            Continue Shopping
          </Link>

          <Link
            href="/best-sellers"
            className="rounded-full border border-neutral-200 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            Explore Best Sellers
          </Link>
        </div>
      </section>

      <aside className="h-fit rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm uppercase tracking-[0.22em] text-neutral-500">
          Summary
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900">
          Order Summary
        </h2>

        <div className="mt-8 space-y-4 border-b border-neutral-200 pb-6">
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <span>Items</span>
            <span>{totalItems}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-neutral-600">
            <span>Subtotal</span>
            <span>{mur(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-neutral-600">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <span className="text-base font-semibold text-neutral-900">
            Estimated Total
          </span>
          <span className="text-xl font-semibold tracking-tight text-neutral-900">
            {mur(subtotal)}
          </span>
        </div>

        <div className="mt-8 space-y-3">
          <Link
            href="/checkout"
            className="block rounded-full bg-[#6f4a3f] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#5f3f36]"
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/shop"
            className="block rounded-full border border-neutral-200 px-6 py-3 text-center text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            Continue Shopping
          </Link>
        </div>

        <div className="mt-6 rounded-[20px] border border-[#eadfd8] bg-[#fbf7f4] px-4 py-4 text-sm leading-6 text-[#6f5a52]">
          Handmade with care in Mauritius. Final shipping cost will be applied at
          checkout based on your selected delivery method.
        </div>
      </aside>
    </div>
  );
}