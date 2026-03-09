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
type ProductOption = {
  id: string;
  name: string;
  sort_order: number;
  product_option_values: OptionValue[];
};

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

function isProbablyValidImageUrl(src?: string) {
  const s = (src || "").trim();
  if (!s) return false;
  if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/") || s.startsWith("data:"))
    return true;
  return false;
}

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
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

  // --- normalize options (sort)
  const optList = useMemo(() => {
    return [...(options ?? [])]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((o) => ({
        ...o,
        product_option_values: [...(o.product_option_values ?? [])].sort(
          (x, y) => (x.sort_order ?? 0) - (y.sort_order ?? 0)
        ),
      }));
  }, [options]);

  // --- active variants only
  const variantsList = useMemo(() => (variants ?? []).filter((v) => v.is_active), [variants]);

  // --- initial selection
  const initialSelection = useMemo(() => {
    if (variantsList.length) return { ...(variantsList[0]?.options_json || {}) };
    const sel: Record<string, string> = {};
    for (const o of optList) sel[o.name] = o.product_option_values?.[0]?.value ?? "";
    return sel;
  }, [variantsList, optList]);

  const [selection, setSelection] = useState<Record<string, string>>(initialSelection);
  const [qty, setQty] = useState<number>(1);

  // --- match variant
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

  // --- base gallery: primary first
  const baseGallery = useMemo(() => {
    const sorted = [...(images ?? [])].sort(
      (a, b) =>
        (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) ||
        (a.sort_order ?? 0) - (b.sort_order ?? 0)
    );
    return sorted;
  }, [images]);

  // --- variant image override
  const activeImages = useMemo(() => {
    if (!matchedVariant) return baseGallery;
    const list = (variantImages ?? [])
      .filter((x) => x.variant_id === matchedVariant.id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    if (list.length) {
      return [
        ...list.map((x) => ({
          id: x.id,
          image_url: x.image_url,
          alt: x.alt,
          is_primary: true,
          sort_order: 0,
        })),
        ...baseGallery,
      ];
    }
    return baseGallery;
  }, [matchedVariant, variantImages, baseGallery]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [heroOk, setHeroOk] = useState(true);
  const [thumbOk, setThumbOk] = useState<Record<string, boolean>>({});

  const heroSrc = useMemo(() => {
    const src = activeImages?.[activeIdx]?.image_url || "";
    if (!heroOk) return "";
    if (!isProbablyValidImageUrl(src)) return "";
    return src;
  }, [activeImages, activeIdx, heroOk]);

  // --- availability map for disabling impossible combos
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
    setHeroOk(true);
    setSelection((s) => ({ ...s, [optName]: value }));
  }

  function onAddToCart() {
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
    <div className="bg-white">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="lg:sticky lg:top-6 h-fit">
          <div className="relative w-full aspect-[4/5] rounded-[22px] overflow-hidden border border-neutral-200 bg-neutral-50">
            {heroSrc ? (
              <Image
                src={heroSrc}
                alt={activeImages?.[activeIdx]?.alt || product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                onError={() => setHeroOk(false)}
              />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-xs text-neutral-500 shadow-sm">
                  No image
                </div>
              </div>
            )}

            {/* soft premium sheen */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_20%_0%,rgba(255,182,193,0.18),transparent_45%)]" />
          </div>

          {!!activeImages?.length && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {activeImages.slice(0, 10).map((im, idx) => {
                const ok = thumbOk[im.id] ?? true;
                const tSrc = ok && isProbablyValidImageUrl(im.image_url) ? im.image_url : "";

                const isActive = idx === activeIdx;

                return (
                  <button
                    key={im.id}
                    type="button"
                    onClick={() => {
                      setActiveIdx(idx);
                      setHeroOk(true);
                    }}
                    className={cx(
                      "relative h-[78px] w-[78px] rounded-[16px] overflow-hidden border bg-neutral-50 shrink-0 transition",
                      isActive
                        ? "border-pink-300 ring-2 ring-pink-200"
                        : "border-neutral-200 hover:border-neutral-300"
                    )}
                    aria-label={`View image ${idx + 1}`}
                  >
                    {tSrc ? (
                      <Image
                        src={tSrc}
                        alt={im.alt || ""}
                        fill
                        className="object-cover"
                        sizes="78px"
                        onError={() => setThumbOk((p) => ({ ...p, [im.id]: false }))}
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center text-[10px] text-neutral-500">
                        No image
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="min-w-0">
          <div className="rounded-[22px] border border-neutral-200 bg-white p-5 sm:p-6 shadow-[0_10px_30px_rgba(17,24,39,0.05)]">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900">
              {product.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-end gap-3">
              <div className="text-xl font-semibold text-neutral-900">{mur(price)}</div>
              {compareAt && compareAt > price ? (
                <div className="text-sm text-neutral-500 line-through">{mur(compareAt)}</div>
              ) : null}

              {optList.length ? (
                <span
                  className={cx(
                    "ml-auto inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
                    matchedVariant
                      ? inStock
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  )}
                >
                  {matchedVariant ? (inStock ? `In stock (${matchedVariant.stock_qty})` : "Out of stock") : "Not available"}
                </span>
              ) : null}
            </div>

            {product.short_description ? (
              <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
                {product.short_description}
              </p>
            ) : null}

            {/* Options */}
            {optList.length ? (
              <div className="mt-7 space-y-6">
                {optList.map((opt) => (
                  <div key={opt.id}>
                    <div className="text-sm font-semibold text-neutral-900">{opt.name}</div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {opt.product_option_values.map((v) => {
                        const selected = selection[opt.name] === v.value;
                        const ok = availability?.[opt.name]?.[v.value] ?? true;

                        return (
                          <button
                            key={v.id}
                            type="button"
                            onClick={() => ok && setOption(opt.name, v.value)}
                            disabled={!ok}
                            className={cx(
                              "px-4 py-2 rounded-full border text-sm font-medium transition",
                              selected
                                ? "border-pink-300 bg-pink-50 text-pink-700"
                                : "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
                              !ok && "opacity-40 cursor-not-allowed"
                            )}
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

            {/* Qty + Add */}
            <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="flex items-center border border-neutral-200 rounded-full overflow-hidden bg-white w-fit">
                <button
                  type="button"
                  className="px-4 py-3 hover:bg-neutral-50 transition"
                  onClick={() => setQty((q) => Math.max(1, (q || 1) - 1))}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  className="w-14 text-center outline-none py-3 text-sm"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || "1", 10)))}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  className="px-4 py-3 hover:bg-neutral-50 transition"
                  onClick={() => setQty((q) => Math.max(1, (q || 1) + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={onAddToCart}
                disabled={optList.length ? !matchedVariant || !inStock : false}
                className={cx(
                  "flex-1 rounded-full py-3 text-white font-semibold transition shadow-sm",
                  "bg-pink-600 hover:bg-pink-700",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                Add to cart
              </button>
            </div>

            {/* Long description */}
            {product.description ? (
              <div className="mt-9 pt-6 border-t border-neutral-200">
                <div className="text-sm font-semibold text-neutral-900">Details</div>
                <div className="mt-3 text-sm text-neutral-600 leading-relaxed whitespace-pre-wrap">
                  {product.description}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}