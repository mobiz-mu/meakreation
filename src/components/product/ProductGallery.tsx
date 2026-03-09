"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/products";

type Props = {
  title: string;
  images: ProductImage[];
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isValidImage(src?: string) {
  const s = (src || "").trim();
  return !!s;
}

export default function ProductGallery({ title, images }: Props) {
  const validImages = useMemo(
    () => (images ?? []).filter((img) => isValidImage(img.image_url)),
    [images]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [title]);

  const active = validImages[activeIndex];

  function goTo(index: number) {
    if (index === activeIndex) return;
    setIsFading(true);
    window.setTimeout(() => {
      setActiveIndex(index);
      setIsFading(false);
    }, 140);
  }

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-[28px] border border-[#e8ddd6] bg-[#f7f2ee] shadow-[0_20px_60px_rgba(76,47,39,0.08)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(255,255,255,0.55),transparent_45%)] z-[1]" />

        <div className="relative aspect-[4/5] w-full">
          {active?.image_url ? (
            <Image
              key={active.id}
              src={active.image_url}
              alt={active.alt || title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={cx(
                "object-cover transition-all duration-500 ease-out",
                isFading ? "scale-[1.02] opacity-0" : "scale-100 opacity-100"
              )}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#8a766d]">
              No image available
            </div>
          )}
        </div>
      </div>

      {validImages.length > 1 ? (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {validImages.slice(0, 10).map((img, index) => {
            const activeThumb = activeIndex === index;

            return (
              <button
                key={img.id}
                type="button"
                onClick={() => goTo(index)}
                className={cx(
                  "relative aspect-square overflow-hidden rounded-[18px] border bg-[#f7f2ee] transition-all duration-300",
                  activeThumb
                    ? "border-[#6f4a3f] ring-2 ring-[#c9a99b]/50 shadow-[0_10px_24px_rgba(76,47,39,0.12)]"
                    : "border-[#eadfd8] hover:border-[#c9a99b]"
                )}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={img.image_url}
                  alt={img.alt || `${title} ${index + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}