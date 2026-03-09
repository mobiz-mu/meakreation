"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useUI } from "@/store/ui";
import { useCart } from "@/store/cart";
import { mur } from "@/lib/money";

function lockBody(lock: boolean) {
  if (typeof document === "undefined") return;
  document.body.style.overflow = lock ? "hidden" : "";
}

export default function CartDrawer() {
  const { cartOpen, closeCart } = useUI();
  const items = useCart((s) => s.items);
  const removeItem = useCart((s) => s.removeItem);
  const setQty = useCart((s) => s.setQty);

  useEffect(() => {
    if (!cartOpen) return;
    lockBody(true);
    return () => lockBody(false);
  }, [cartOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!cartOpen) return;
      if (e.key === "Escape") closeCart();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cartOpen, closeCart]);

  const subtotal = items.reduce((sum, it) => sum + it.unitPriceMur * it.qty, 0);

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button className="absolute inset-0 bg-black/40" onClick={closeCart} aria-label="Close cart" />

      <div className="absolute right-0 top-0 h-full w-[92%] max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-200 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="font-semibold">Your Cart</div>
          <button className="h-10 w-10 rounded-2xl hover:bg-muted/40 flex items-center justify-center" onClick={closeCart} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="rounded-2xl border bg-muted/20 p-6 text-center">
              <div className="font-medium">Your cart is empty</div>
              <div className="text-sm text-muted-foreground mt-1">Add something beautiful ✨</div>
              <Link onClick={closeCart} href="/shop" className="inline-block mt-4 text-sm font-medium hover:text-[hsl(var(--brand-pink-dark))] transition">
                Shop now →
              </Link>
            </div>
          ) : (
            items.map((it) => (
              <div key={`${it.productId}-${it.variantId ?? "base"}`} className="rounded-2xl border p-4 bg-white">
                <div className="flex gap-4">
                  <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-muted border shrink-0">
                    {it.imageUrl ? (
                      <Image src={it.imageUrl} alt={it.title} fill className="object-cover" sizes="64px" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{it.title}</div>
                        {it.variantLabel ? (
                          <div className="text-xs text-muted-foreground truncate">{it.variantLabel}</div>
                        ) : null}
                      </div>

                      <button
                        className="h-9 w-9 rounded-xl hover:bg-muted/40 flex items-center justify-center"
                        onClick={() => removeItem(it.productId, it.variantId)}
                        aria-label="Remove"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-sm font-semibold">{mur(it.unitPriceMur)}</div>

                      <div className="flex items-center border rounded-xl overflow-hidden">
                        <button
                          className="px-3 py-2 hover:bg-muted/40"
                          onClick={() => setQty(it.productId, it.variantId, it.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>

                        <div className="w-10 text-center text-sm">{it.qty}</div>

                        <button
                          className="px-3 py-2 hover:bg-muted/40"
                          onClick={() => setQty(it.productId, it.variantId, it.qty + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Subtotal</div>
            <div className="font-semibold">{mur(subtotal)}</div>
          </div>

          <Link
            href="/checkout"
            onClick={closeCart}
            className="block text-center rounded-2xl py-3 text-white bg-[hsl(var(--brand-pink-dark))] hover:opacity-90 transition"
          >
            Checkout
          </Link>

          <Link
            href="/cart"
            onClick={closeCart}
            className="block text-center rounded-2xl py-3 border hover:bg-muted/30 transition"
          >
            View Cart
          </Link>

          <div className="text-[11px] text-muted-foreground text-center">
            Shipping calculated at checkout
          </div>
        </div>
      </div>
    </div>
  );
}