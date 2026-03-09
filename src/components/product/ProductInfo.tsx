"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { mur } from "@/lib/money";
import { useCart } from "@/store/cart";
import type { ProductVariant, ProductWithRelations } from "@/lib/products";
import {
  findVariantByOptions,
  formatVariantLabel,
  getHighestComparePrice,
  getLowestPrice,
  getPrimaryImage,
  getTotalStock,
  getVariantGroups,
} from "@/lib/products";

type Props = {
  product: ProductWithRelations;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function ProductInfo({ product }: Props) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);

  const variants = product.product_variants ?? [];
  const variantGroups = useMemo(() => getVariantGroups(variants), [variants]);

  const initialSelectedOptions = useMemo(() => {
    const first = variants[0];
    return first?.options_json ? { ...first.options_json } : {};
  }, [variants]);

  const [selectedOptions, setSelectedOptions] =
    useState<Record<string, string>>(initialSelectedOptions);
  const [qty, setQty] = useState<number>(1);

  useEffect(() => {
    setSelectedOptions(initialSelectedOptions);
  }, [initialSelectedOptions]);

  const selectedVariant = useMemo<ProductVariant | null>(() => {
    if (!variants.length) return null;
    if (!Object.keys(selectedOptions).length) return variants[0] ?? null;
    return findVariantByOptions(variants, selectedOptions);
  }, [variants, selectedOptions]);

  const price = selectedVariant?.price_mur ?? getLowestPrice(product);
  const comparePrice =
    selectedVariant?.compare_at_price_mur ?? getHighestComparePrice(product);

  const stockQty = selectedVariant
    ? Number(selectedVariant.stock_qty ?? 0)
    : getTotalStock(product);

  const inStock = variants.length ? stockQty > 0 : true;

  const hasDiscount =
    Number(comparePrice ?? 0) > 0 && Number(comparePrice ?? 0) > Number(price ?? 0);

  const availability = useMemo(() => {
    const map: Record<string, Record<string, boolean>> = {};

    for (const [groupKey, values] of Object.entries(variantGroups)) {
      map[groupKey] = {};

      for (const value of values) {
        const trial = { ...selectedOptions, [groupKey]: value };

        const ok = variants.some((variant) => {
          const opts = variant.options_json || {};
          for (const key of Object.keys(trial)) {
            if ((opts[key] ?? "") !== (trial[key] ?? "")) return false;
          }
          return true;
        });

        map[groupKey][value] = ok;
      }
    }

    return map;
  }, [variantGroups, selectedOptions, variants]);

  function onSelectOption(groupKey: string, value: string) {
    setSelectedOptions((prev) => ({
      ...prev,
      [groupKey]: value,
    }));
  }

  function onAddToCart() {
    if (variants.length && !selectedVariant) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      title: product.title,
      variantLabel: selectedVariant
        ? formatVariantLabel(selectedVariant.options_json)
        : null,
      imageUrl: getPrimaryImage(product),
      unitPriceMur: price,
      qty: Math.max(1, Math.floor(qty || 1)),
    });
  }

  function onBuyNow() {
    if (variants.length && !selectedVariant) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      title: product.title,
      variantLabel: selectedVariant
        ? formatVariantLabel(selectedVariant.options_json)
        : null,
      imageUrl: getPrimaryImage(product),
      unitPriceMur: price,
      qty: Math.max(1, Math.floor(qty || 1)),
    });

    router.push("/checkout");
  }

  return (
    <div className="min-w-0">
      <div className="relative overflow-hidden rounded-[30px] border border-[#eadfd8] bg-[linear-gradient(180deg,#fffdfb_0%,#fcf7f3_100%)] p-5 shadow-[0_24px_70px_rgba(76,47,39,0.08)] sm:p-7 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_110%_-10%,rgba(201,169,155,0.18),transparent_34%)]" />

        <div className="relative">
          <p className="text-[12px] uppercase tracking-[0.34em] text-[#8a766d]">
            Mea Kréation
          </p>

          <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-[#241815] sm:text-4xl lg:text-[42px]">
            {product.title}
          </h1>

          {(product.short_description || product.description) ? (
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#6f5a52] sm:text-base">
              {product.short_description || product.description}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="text-[28px] font-semibold tracking-tight text-[#2e1d18]">
              {mur(price)}
            </div>

            {hasDiscount ? (
              <div className="text-base text-[#9e8f89] line-through">
                {mur(comparePrice)}
              </div>
            ) : null}

            <span
              className={cx(
                "ml-0 inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-medium sm:ml-2",
                inStock
                  ? "border-[#d9c6bb] bg-[#f7efe9] text-[#6f4a3f]"
                  : "border-[#efd8d8] bg-[#fbf1f1] text-[#b44f4f]"
              )}
            >
              {variants.length
                ? selectedVariant
                  ? inStock
                    ? `In stock (${selectedVariant.stock_qty})`
                    : "Out of stock"
                  : "Not available"
                : inStock
                  ? "In stock"
                  : "Out of stock"}
            </span>
          </div>

          {variants.length > 0 ? (
            <div className="mt-8 space-y-6">
              {Object.entries(variantGroups).map(([groupKey, values]) => (
                <div key={groupKey}>
                  <div className="text-sm font-semibold capitalize tracking-wide text-[#2e1d18]">
                    {groupKey}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {values.map((value) => {
                      const selected = selectedOptions[groupKey] === value;
                      const ok = availability[groupKey]?.[value] ?? true;

                      return (
                        <button
                          key={`${groupKey}-${value}`}
                          type="button"
                          onClick={() => {
                            if (ok) onSelectOption(groupKey, value);
                          }}
                          disabled={!ok}
                          className={cx(
                            "rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300",
                            selected
                              ? "border-[#6f4a3f] bg-[#6f4a3f] text-white shadow-[0_10px_24px_rgba(76,47,39,0.18)]"
                              : "border-[#e7d8cf] bg-white text-[#3d2a24] hover:border-[#c9a99b] hover:bg-[#fbf6f2]",
                            !ok && "cursor-not-allowed opacity-35"
                          )}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {selectedVariant ? (
                <div className="rounded-[20px] border border-[#eadfd8] bg-[#f8f2ee] px-4 py-3 text-sm text-[#6f5a52]">
                  Selected: {formatVariantLabel(selectedVariant.options_json)}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-9 flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="flex h-[58px] w-full items-center justify-between overflow-hidden rounded-full border border-[#e5d8d0] bg-white xl:w-[170px]">
              <button
                type="button"
                className="h-full px-5 text-lg text-[#4c2f27] transition hover:bg-[#faf4ef]"
                onClick={() => setQty((q) => Math.max(1, (q || 1) - 1))}
                aria-label="Decrease quantity"
              >
                -
              </button>

              <input
                className="w-12 bg-transparent text-center text-sm font-semibold text-[#2e1d18] outline-none"
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, parseInt(e.target.value || "1", 10) || 1))
                }
                inputMode="numeric"
              />

              <button
                type="button"
                className="h-full px-5 text-lg text-[#4c2f27] transition hover:bg-[#faf4ef]"
                onClick={() => setQty((q) => Math.max(1, (q || 1) + 1))}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={onAddToCart}
              disabled={variants.length ? !selectedVariant || !inStock : !inStock}
              className={cx(
                "h-[58px] flex-1 rounded-full px-6 text-sm font-semibold text-white transition-all duration-300",
                "bg-[#6f4a3f] shadow-[0_16px_36px_rgba(76,47,39,0.18)] hover:bg-[#5f3f36] hover:shadow-[0_20px_40px_rgba(76,47,39,0.22)]",
                "disabled:cursor-not-allowed disabled:opacity-40"
              )}
            >
              Add to cart
            </button>

            <button
              type="button"
              onClick={onBuyNow}
              disabled={variants.length ? !selectedVariant || !inStock : !inStock}
              className={cx(
                "h-[58px] rounded-full border px-7 text-sm font-semibold transition-all duration-300",
                "border-[#cdb2a5] bg-[#8b5e50] text-white hover:bg-[#7a5145] hover:border-[#7a5145]",
                "disabled:cursor-not-allowed disabled:opacity-40"
              )}
            >
              Buy now
            </button>
          </div>

          <div className="mt-8 grid gap-3 border-t border-[#eee2db] pt-6 text-sm text-[#6f5a52]">
            {product.sku ? (
              <div>
                <span className="font-semibold text-[#2e1d18]">SKU:</span> {product.sku}
              </div>
            ) : null}

            {product.barcode ? (
              <div>
                <span className="font-semibold text-[#2e1d18]">Barcode:</span>{" "}
                {product.barcode}
              </div>
            ) : null}

            {product.categories?.name ? (
              <div>
                <span className="font-semibold text-[#2e1d18]">Category:</span>{" "}
                {product.categories.name}
              </div>
            ) : null}
          </div>

          {product.description ? (
            <div className="mt-9 border-t border-[#eee2db] pt-6">
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8a766d]">
                Product Details
              </div>
              <div className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-[#6f5a52]">
                {product.description}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}