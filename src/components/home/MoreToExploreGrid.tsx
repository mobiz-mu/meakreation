"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import {
  getLowestPrice,
  getPrimaryImage,
  type ProductWithRelations,
} from "@/lib/products";
import { useCart } from "@/store/cart";

type Props = {
  products: ProductWithRelations[];
};

function fmtMUR(n?: number) {
  const x = Number.isFinite(Number(n)) ? Number(n) : 0;
  return `Rs ${x.toLocaleString("en-MU")}`;
}

function MoreToExploreCard({ product }: { product: ProductWithRelations }) {
  const image = getPrimaryImage(product) || "/logo.png";
  const price = getLowestPrice(product);

  const addItem = useCart((s: any) => s.addItem ?? s.addToCart ?? s.add);
  const [qty, setQty] = useState(1);

  const cartPayload = useMemo(
  () => ({
    productId: product.id,
    variantId: null,
    title: product.title,
    variantLabel: null,
    imageUrl: image,
    unitPriceMur: price,
    qty,
  }),
  [product.id, product.title, image, price, qty]
);

  function decrease() {
    setQty((v) => Math.max(1, v - 1));
  }

  function increase() {
    setQty((v) => Math.min(99, v + 1));
  }

  function handleAddToCart(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (typeof addItem === "function") {
      addItem(cartPayload);
    } else {
      console.warn("Cart store add method not found. Check useCart implementation.");
    }
  }

  return (
    <div className="group overflow-hidden rounded-[28px] border border-[#ead7de] bg-[#f7f7f7] shadow-[0_20px_60px_-45px_rgba(80,40,50,0.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_-40px_rgba(80,40,50,0.24)]">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f3ecef]">
          <Image
            src={image}
            alt={product.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 50vw, 20vw"
          />
        </div>
      </Link>

      <div className="p-3 sm:p-4">
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="line-clamp-1 text-[15px] font-semibold text-[#1f1b1c] sm:text-[16px]">
            {product.title}
          </h3>
        </Link>

        <div className="mt-8 text-[15px] font-semibold text-[#1f1b1c] sm:text-[16px]">
          {fmtMUR(price)}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex h-[52px] items-center rounded-full border border-[#d8d1d3] bg-[#f3f3f3] px-2 shadow-inner">
            <button
              type="button"
              onClick={decrease}
              className="grid h-10 w-10 place-items-center rounded-full text-[#1f1b1c] transition hover:bg-white"
              aria-label="Decrease quantity"
            >
              <Minus size={18} strokeWidth={2.2} />
            </button>

            <div className="min-w-[34px] text-center text-[15px] font-semibold text-[#1f1b1c]">
              {qty}
            </div>

            <button
              type="button"
              onClick={increase}
              className="grid h-10 w-10 place-items-center rounded-full text-[#1f1b1c] transition hover:bg-white"
              aria-label="Increase quantity"
            >
              <Plus size={18} strokeWidth={2.2} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full bg-[#ec0a8c] text-white shadow-[0_10px_24px_-10px_rgba(236,10,140,0.75)] transition hover:scale-[1.03] hover:bg-[#d70880]"
            aria-label={`Add ${product.title} to cart`}
          >
            <ShoppingCart size={21} strokeWidth={2.1} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MoreToExploreGrid({ products }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-5">
      {products.map((product) => (
        <MoreToExploreCard key={product.id} product={product} />
      ))}
    </div>
  );
}