"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

function fmtMUR(n?: number) {
  const x = Number.isFinite(Number(n)) ? Number(n) : 0;
  return `Rs ${x.toLocaleString("en-MU")}`;
}

function isProbablyValidImageUrl(src?: string) {
  const s = (src || "").trim();
  if (!s) return false;
  return (
    s.startsWith("http://") ||
    s.startsWith("https://") ||
    s.startsWith("/") ||
    s.startsWith("data:")
  );
}

const BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjI1IiBmaWxsPSIjZjVmNWY1Ii8+PC9zdmc+";

export default function ProductCard({
  product,
  showQuickAdd = false,
}: {
  product: Product;
  showQuickAdd?: boolean;
}) {
  const addWish = useWishlist((s) => s.add);
  const removeWish = useWishlist((s) => s.remove);
  const isInWishlist = useWishlist((s) => s.isInWishlist);
  const inWishlist = isInWishlist(product.id);

  const addToCart = useCart((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [imgOk, setImgOk] = useState(true);

  const imgSrc = useMemo(() => {
    const src = (product.image || "").trim();
    if (!imgOk) return "";
    if (!isProbablyValidImageUrl(src)) return "";
    return src;
  }, [product.image, imgOk]);

  function add() {
    addToCart({
      productId: product.id,
      variantId: null,
      title: product.name,
      variantLabel: null,
      imageUrl: imgSrc || null,
      unitPriceMur: product.price,
      qty: Math.max(1, qty),
    });
  }

  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-neutral-200/70 bg-white shadow-[0_10px_26px_rgba(17,24,39,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(17,24,39,0.10)]">
      <button
        type="button"
        onClick={() =>
          inWishlist
            ? removeWish(product.id)
            : addWish({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: imgSrc || "",
             })
        }
        className="absolute top-3 right-3 z-10 grid h-10 w-10 place-items-center rounded-full border border-neutral-200 bg-white/90 shadow-sm backdrop-blur transition hover:scale-[1.04] active:scale-[0.98]"
        aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          size={18}
          className={inWishlist ? "fill-pink-600 text-pink-600" : "text-neutral-700"}
        />
      </button>

      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] bg-neutral-50">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
              onError={() => setImgOk(false)}
              placeholder="blur"
              blurDataURL={BLUR}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center">
              <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                <div className="text-center text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                  Mea Kréation
                </div>
                <div className="mt-1 text-center text-xs font-medium text-neutral-600">
                  Image coming soon
                </div>
              </div>
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
        </div>
      </Link>

      <div className="p-4">
        <div className="min-h-[44px]">
          <h3 className="line-clamp-2 text-[14.5px] font-semibold leading-snug tracking-tight text-neutral-900">
            {product.name}
          </h3>
        </div>

        <div className="mt-1 text-sm font-semibold text-neutral-800">
          {fmtMUR(product.price)}
        </div>

        {showQuickAdd ? (
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center overflow-hidden rounded-full border border-neutral-200 bg-white">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-10 w-10 place-items-center transition hover:bg-neutral-50"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>

              <div className="grid h-10 w-8 place-items-center text-sm font-semibold text-neutral-900">
                {qty}
              </div>

              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="grid h-10 w-10 place-items-center transition hover:bg-neutral-50"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={add}
              className="grid h-10 w-10 place-items-center rounded-full bg-pink-600 text-white shadow-sm transition hover:bg-pink-700 hover:shadow-md active:scale-[0.98]"
              aria-label="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex w-full items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
            >
              View product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}