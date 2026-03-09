"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { mur } from "@/lib/money";

function isProbablyValidImageUrl(src?: string) {
  const s = (src || "").trim();
  return (
    !!s &&
    (s.startsWith("http://") ||
      s.startsWith("https://") ||
      s.startsWith("/") ||
      s.startsWith("data:"))
  );
}

export default function WishlistPageClient() {
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);
  const clear = useWishlist((s) => s.clear);
  const addItem = useCart((s) => s.addItem);

  if (!items.length) {
    return (
      <div className="rounded-[28px] border border-neutral-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <p className="text-sm uppercase tracking-[0.22em] text-neutral-500">
          Wishlist
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
          Your wishlist is empty
        </h1>
        <p className="mt-4 text-neutral-600">
          Save the handmade pieces you love and come back to them anytime.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-[#6f4a3f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f3f36]"
          >
            Explore Shop
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
    <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-neutral-500">
            Saved Items
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
            Wishlist
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            {items.length} item{items.length > 1 ? "s" : ""} saved
          </p>
        </div>

        <button
          type="button"
          onClick={() => clear()}
          className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
        >
          Clear Wishlist
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const imageOk = isProbablyValidImageUrl(item.image);

          return (
            <article
              key={item.id}
              className="overflow-hidden rounded-[24px] border border-neutral-200 bg-white transition hover:-translate-y-1 hover:shadow-md"
            >
              <Link href={`/product/${item.slug}`} className="block">
                <div className="relative aspect-[4/5] bg-neutral-100">
                  {imageOk ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                      No image
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <h2 className="line-clamp-2 text-base font-semibold tracking-tight text-neutral-900">
                  {item.name}
                </h2>

                <div className="mt-2 text-sm font-semibold text-neutral-900">
                  {mur(item.price)}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      addItem({
                        productId: item.id,
                        variantId: null,
                        title: item.name,
                        variantLabel: null,
                        imageUrl: item.image || null,
                        unitPriceMur: item.price,
                        qty: 1,
                      })
                    }
                    className="rounded-full bg-[#6f4a3f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5f3f36]"
                  >
                    Add to Cart
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="rounded-full border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
                  >
                    Remove
                  </button>
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
          href="/cart"
          className="rounded-full bg-[#6f4a3f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5f3f36]"
        >
          View Cart
        </Link>
      </div>
    </div>
  );
}