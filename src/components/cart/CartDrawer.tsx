"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { mur } from "@/lib/money";

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

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, setQty } = useCart();

  const safeItems = (items ?? []) as AnyCartItem[];

  const total = safeItems.reduce((sum, item) => {
    return sum + getUnitPrice(item) * getQty(item);
  }, 0);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px]"
        onClick={closeCart}
      />

      <aside className="fixed right-0 top-0 z-[95] flex h-full w-[92%] max-w-md flex-col bg-white shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
        <div className="flex items-center justify-between border-b px-5 pb-4 pt-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[#2b1d19]">
              Your Cart
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              {safeItems.length
                ? `${safeItems.reduce((sum, item) => sum + getQty(item), 0)} item(s) added`
                : "Your shopping bag is currently empty"}
            </p>
          </div>

          <button
            onClick={closeCart}
            className="rounded-full p-2 text-neutral-700 transition hover:bg-neutral-100"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {safeItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f8f2ee] text-[#8f4f63]">
                <ShoppingBag size={24} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#2b1d19]">
                Your cart is empty
              </h3>
              <p className="mt-2 max-w-[260px] text-sm leading-6 text-neutral-500">
                Add your favorite handmade pieces and continue shopping in style.
              </p>

              <Link
                href="/shop"
                onClick={closeCart}
                className="mt-6 inline-flex rounded-full bg-[#8f4f63] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {safeItems.map((item) => {
                const productId = getProductId(item);
                const variantId = getVariantId(item);
                const title = getTitle(item);
                const image = getImage(item);
                const unitPrice = getUnitPrice(item);
                const qty = getQty(item);

                return (
                  <div
                    key={`${productId}-${variantId ?? "default"}`}
                    className="flex gap-3 rounded-[20px] border border-neutral-200 p-3"
                  >
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[16px] bg-neutral-100">
                      {image ? (
                        <Image
                          src={image}
                          alt={title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[11px] text-neutral-500">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 text-sm font-semibold text-[#2b1d19]">
                        {title}
                      </div>

                      {item.variantLabel ? (
                        <div className="mt-1 text-xs text-neutral-500">
                          {item.variantLabel}
                        </div>
                      ) : null}

                      <div className="mt-2 text-sm font-semibold text-[#2b1d19]">
                        {mur(unitPrice)}
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center overflow-hidden rounded-full border border-neutral-200">
                          <button
                            onClick={() => setQty(productId, variantId, qty - 1)}
                            className="grid h-9 w-9 place-items-center transition hover:bg-neutral-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="min-w-[32px] text-center text-sm font-medium">
                            {qty}
                          </span>

                          <button
                            onClick={() => setQty(productId, variantId, qty + 1)}
                            className="grid h-9 w-9 place-items-center transition hover:bg-neutral-50"
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(productId, variantId)}
                          className="text-xs font-medium text-rose-600 transition hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {safeItems.length > 0 ? (
          <div className="border-t px-5 pb-5 pt-4">
            <div className="mb-4 flex items-center justify-between text-base font-semibold text-[#2b1d19]">
              <span>Total</span>
              <span>{mur(total)}</span>
            </div>

            <div className="space-y-3">
              <Link
                href="/cart"
                onClick={closeCart}
                className="block w-full rounded-full border border-neutral-200 px-6 py-3 text-center text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
              >
                View Cart
              </Link>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full rounded-full bg-[#8f4f63] py-3 text-center text-sm font-semibold text-white transition hover:opacity-95"
              >
                Checkout
              </Link>
            </div>
          </div>
        ) : null}
      </aside>
    </>
  );
}