"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const CATEGORIES = [
  {
    name: "Pochette",
    image:
      "/categories/Ultra luxury product photography of a handmade canvas pochette pouch placed perfectly centered, minimal elegant background with soft tropical palm leaf shadows, Mauritian island inspired aesthetic, neutral sand.jpg",
    href: "/shop?cat=pochette",
    caption: "Elegant handmade pouches",
  },
  {
    name: "Trousse",
    image:
      "/categories/Luxury handmade trousse bag centered in the middle, premium canvas fabric texture visible, minimal tropical background with soft palm leaves and warm sunlight, Mauritian island luxury aesthetic, fashion editori.jpg",
    href: "/shop?cat=trousse",
    caption: "Beauty & travel essentials",
  },
  {
    name: "Bags",
    image:
      "/categories/Ultra luxury handmade handbag centered in the middle, premium handcrafted fabric bag with elegant structure, tropical island inspired background with soft sand tones and palm leaves, Mauritian lifestyle luxury.jpg",
    href: "/shop?cat=bags",
    caption: "Stylish Womens everyday bags",
  },
  {
    name: "Hair Accessories",
    image:
      "/categories/Luxury hair accessories flat lay centered in the middle, handmade turbans, scrunchies and bows arranged beautifully, minimal pastel background with soft tropical lighting, feminine fashion editorial aesthetic,.jpg",
    href: "/shop?cat=hair-accessories",
    caption: "Turbans, bows & scrunchies",
  },
  {
    name: "Home Decoration",
    image:
      "/categories/Elegant handmade home decoration product centered in the middle, minimal luxury interior background with soft neutral tones, tropical island design inspiration, Mauritian handcrafted decor style, premium lighti.jpg",
    href: "/shop?cat=home-decoration",
    caption: "Warm handmade decor",
  },
  {
    name: "Leather Craft",
    image:
      "/categories/Luxury handcrafted leather accessory centered in the middle, premium leather wallet or pouch with rich texture, minimal beige luxury background with soft spotlight lighting, elegant artisan craftsmanship aesthe.jpg",
    href: "/shop?cat=leather-craft",
    caption: "Artisan leather pieces",
  },
];

function useInViewOnce<T extends HTMLElement>(threshold = 0.14) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export default function CategoriesSection() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.12);

  return (
    <section className="relative overflow-hidden bg-white py-14 md:py-20">
      {/* luxury ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-[hsl(var(--brand-pink-dark))]/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-[hsl(var(--brand-pink-light))]/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
        <div
          ref={ref}
          className={[
            "transition-all duration-700 ease-out",
            inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          ].join(" ")}
        >
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center rounded-full border border-black/10 bg-white/80 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-600 shadow-sm backdrop-blur">
              Mea Kreation Collections
            </div>

            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-black md:text-4xl">
              Shop by Category
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600 md:text-[15px]">
              Discover handmade elegance inspired by Mauritius — curated
              accessories, beautiful essentials, and crafted pieces designed
              with style and care.
            </p>
          </div>

          {/* Desktop / tablet premium grid */}
          <div className="mt-12 hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 lg:gap-6">
            {CATEGORIES.map((cat, idx) => (
              <Link
                key={cat.name}
                href={cat.href}
                className={[
                  "group relative overflow-hidden rounded-[32px] bg-white",
                  "border border-black/6 shadow-[0_30px_90px_rgba(17,17,17,0.08)]",
                  "transition-all duration-500 ease-out",
                  "hover:-translate-y-2 hover:shadow-[0_30px_90px_rgba(17,17,17,0.12)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--brand-pink-dark))]/40",
                  inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
                ].join(" ")}
                style={{
                  transitionDelay: inView ? `${Math.min(idx * 80, 400)}ms` : "0ms",
                }}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 1024px) 50vw, 16vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    priority={idx < 3}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-white/0" />

                  <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="rounded-[22px] border border-white/25 bg-white/55 p-4 backdrop-blur-lg transition-all duration-300 group-hover:bg-white/65">
                      <h3 className="text-sm font-semibold tracking-wide text-neutral-900">
                        {cat.name}
                      </h3>
                      <p className="mt-1 text-[12px] leading-relaxed text-neutral-800">
                        {cat.caption}
                      </p>

                      <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink-dark))] font-semibold">
                        Explore Collection
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile premium snap carousel */}
          <div className="mt-10 md:hidden">
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
              {CATEGORIES.map((cat, idx) => (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className={[
                    "group relative min-w-[82%] snap-center overflow-hidden rounded-[32px]",
                    "border border-black/6 bg-white shadow-[0_18px_55px_rgba(17,17,17,0.08)]",
                    "transition-all duration-500",
                    inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
                  ].join(" ")}
                  style={{
                    transitionDelay: inView ? `${Math.min(idx * 70, 350)}ms` : "0ms",
                  }}
                >
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="82vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      priority={idx < 2}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-black/0 to-transparent" />

                    <div className="absolute left-4 top-4 rounded-full border border-white/40 bg-white/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-neutral-700 backdrop-blur">
                      Mauritius
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="rounded-[22px] border border-white/35 bg-white/78 p-4 backdrop-blur-md">
                        <h3 className="text-base font-semibold tracking-tight text-black">
                          {cat.name}
                        </h3>
                        <p className="mt-1 text-[13px] text-neutral-600">
                          {cat.caption}
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink-dark))]">
                          Shop now
                          <span>→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <p className="mt-4 text-center text-[11px] uppercase tracking-[0.18em] text-neutral-500">
              Swipe to explore
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}