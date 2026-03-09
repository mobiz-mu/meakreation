"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { mur } from "@/lib/money";
import { useCart } from "@/store/cart";

type Product = {
  id: string;
  title: string;
  description: string | null;
  short_description: string | null;
  base_price_mur: number;
  compare_at_price_mur: number | null;
};

type ProductImage = {
  id: string;
  image_url: string;
  alt: string | null;
  is_primary: boolean;
  sort_order: number;
};

type OptionValue = { id: string; value: string; sort_order: number };
type ProductOption = { id: string; name: string; sort_order: number; product_option_values: OptionValue[] };

type Variant = {
  id: string;
  product_id: string;
  options_json: Record<string, string>;
  sku: string | null;
  price_mur: number | null;
  compare_at_price_mur: number | null;
  stock_qty: number;
  is_active: boolean;
};

type VariantImage = {
  id: string;
  variant_id: string;
  image_url: string;
  alt: string | null;
  sort_order: number;
};

function buildVariantLabel(sel: Record<string, string>) {
  const keys = Object.keys(sel);
  if (!keys.length) return null;
  return keys.map((k) => `${k}: ${sel[k]}`).join(" / ");
}

export default function ProductClient({
  product,
  images,
  options,
  variants,
  variantImages,
}: {
  product: Product;
  images: ProductImage[];
  options: ProductOption[];
  variants: Variant[];
  variantImages: VariantImage[];
}) {
  const addItem = useCart((s) => s.addItem);

  // Normalize options (sort)
  const optList = useMemo(() => {
    return [...options].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map((o) => ({
      ...o,
      product_option_values: [...(o.product_option_values ?? [])].sort((x, y) => (x.sort_order ?? 0) - (y.sort_order ?? 0)),
    }));
  }, [options]);

  // Build list of valid variants map
  const variantsList = useMemo(() => (variants ?? []).filter((v) => v.is_active), [variants]);

  // Initialize selection: choose first available variant’s options or first option values
  const initialSelection = useMemo(() => {
    if (variantsList.length) {
      const v0 = variantsList[0];
      return { ...(v0.options_json || {}) };
    }
    const sel: Record<string, string> = {};
    for (const o of optList) sel[o.name] = o.product_option_values?.[0]?.value ?? "";
    return sel;
  }, [variantsList, optList]);

  const [selection, setSelection] = useState<Record<string, string>>(initialSelection);
  const [qty, setQty] = useState<number>(1);

  // Find matched variant
  const matchedVariant = useMemo(() => {
    if (!variantsList.length) return null;
    return (
      variantsList.find((v) => {
        const selKeys = Object.keys(selection);
        for (const k of selKeys) {
          if ((v.options_json?.[k] ?? "") !== (selection[k] ?? "")) return false;
        }
        return true;
      }) ?? null
    );
  }, [variantsList, selection]);

  const price = matchedVariant?.price_mur ?? product.base_price_mur;
  const compareAt = matchedVariant?.compare_at_price_mur ?? product.compare_at_price_mur;
  const inStock = (matchedVariant?.stock_qty ?? 999999) > 0;

  // Gallery: primary image first
  const baseGallery = useMemo(() => {
    const sorted = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.sort_order ?? 0) - (b.sort_order ?? 0));
    return sorted;
  }, [images]);

  // Variant image overrides gallery if exists
  const activeImages = useMemo(() => {
    if (!matchedVariant) return baseGallery;
    const list = (variantImages ?? [])
      .filter((x) => x.variant_id === matchedVariant.id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    if (list.length) {
      // Convert to ProductImage shape
      return [
        ...list.map((x) => ({ id: x.id, image_url: x.image_url, alt: x.alt, is_primary: true, sort_order: 0 })),
        ...baseGallery,
      ];
    }
    return baseGallery;
  }, [matchedVariant, variantImages, baseGallery]);

  const [activeIdx, setActiveIdx] = useState(0);

  // Compute availability for each option value (disable impossible combinations)
  const availability = useMemo(() => {
    const map: Record<string, Record<string, boolean>> = {};
    for (const opt of optList) {
      map[opt.name] = {};
      for (const val of opt.product_option_values) {
        const trial = { ...selection, [opt.name]: val.value };
        const ok = variantsList.some((v) => {
          for (const k of Object.keys(trial)) {
            if ((v.options_json?.[k] ?? "") !== (trial[k] ?? "")) return false;
          }
          return true;
        });
        map[opt.name][val.value] = ok;
      }
    }
    return map;
  }, [optList, selection, variantsList]);

  function setOption(optName: string, value: string) {
    setActiveIdx(0);
    setSelection((s) => ({ ...s, [optName]: value }));
  }

  function onAddToCart() {
    // If product has options/variants but no match, stop
    if (optList.length && !matchedVariant) return;

    const chosenVariantId = matchedVariant?.id ?? null;
    const label = buildVariantLabel(selection);

    const imageUrl = activeImages?.[0]?.image_url ?? null;

    addItem({
      productId: product.id,
      variantId: chosenVariantId,
      title: product.title,
      variantLabel: label,
      imageUrl,
      unitPriceMur: price,
      qty: Math.max(1, Math.floor(qty || 1)),
    });
  }

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      {/* Gallery */}
      <div>
        <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border bg-muted">
          {activeImages?.[activeIdx]?.image_url ? (
            <Image
              src={activeImages[activeIdx].image_url}
              alt={activeImages[activeIdx].alt || product.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="absolute inset-0" />
          )}
        </div>

        {!!activeImages?.length && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {activeImages.slice(0, 10).map((im, idx) => (
              <button
                key={im.id}
                onClick={() => setActiveIdx(idx)}
                className={`relative h-20 w-20 rounded-xl overflow-hidden border bg-muted shrink-0 ${
                  idx === activeIdx ? "ring-2 ring-[hsl(var(--brand-pink-dark))]" : "opacity-90 hover:opacity-100"
                }`}
              >
                <Image src={im.image_url} alt={im.alt || ""} fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-wide">{product.title}</h1>

        <div className="mt-3 flex items-end gap-3">
          <div className="text-xl font-semibold">{mur(price)}</div>
          {compareAt && compareAt > price ? (
            <div className="text-sm text-muted-foreground line-through">{mur(compareAt)}</div>
          ) : null}
        </div>

        {product.short_description ? (
          <p className="mt-3 text-muted-foreground">{product.short_description}</p>
        ) : null}

        {/* Options */}
        {optList.length ? (
          <div className="mt-8 space-y-6">
            {optList.map((opt) => (
              <div key={opt.id}>
                <div className="text-sm font-medium">{opt.name}</div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {opt.product_option_values.map((v) => {
                    const selected = selection[opt.name] === v.value;
                    const ok = availability?.[opt.name]?.[v.value] ?? true;

                    return (
                      <button
                        key={v.id}
                        onClick={() => ok && setOption(opt.name, v.value)}
                        disabled={!ok}
                        className={[
                          "px-4 py-2 rounded-xl border text-sm transition",
                          selected
                            ? "bg-[hsl(var(--brand-brown-dark))] text-white border-transparent"
                            : "bg-white hover:bg-muted",
                          !ok ? "opacity-40 cursor-not-allowed" : "",
                        ].join(" ")}
                      >
                        {v.value}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Variant status */}
        {optList.length ? (
          <div className="mt-6 text-sm">
            {matchedVariant ? (
              <div className={inStock ? "text-foreground" : "text-red-600"}>
                {inStock ? `In stock (${matchedVariant.stock_qty})` : "Out of stock"}
              </div>
            ) : (
              <div className="text-red-600">This combination is not available.</div>
            )}
          </div>
        ) : null}

        {/* Qty + Add */}
        <div className="mt-8 flex gap-3 items-center">
          <div className="flex items-center border rounded-xl overflow-hidden">
            <button
              className="px-4 py-3 hover:bg-muted"
              onClick={() => setQty((q) => Math.max(1, (q || 1) - 1))}
            >
              -
            </button>
            <input
              className="w-14 text-center outline-none py-3"
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || "1", 10)))}
            />
            <button
              className="px-4 py-3 hover:bg-muted"
              onClick={() => setQty((q) => Math.max(1, (q || 1) + 1))}
            >
              +
            </button>
          </div>

          <button
            onClick={onAddToCart}
            disabled={optList.length ? !matchedVariant || !inStock : false}
            className="flex-1 rounded-xl py-3 text-white bg-[hsl(var(--brand-pink-dark))] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Add to cart
          </button>
        </div>

        {/* Long description */}
        {product.description ? (
          <div className="mt-10">
            <div className="text-sm font-medium">Details</div>
            <div className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}