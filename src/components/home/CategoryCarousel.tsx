"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const CATEGORIES = [
  {
    slug: "pochette",
    name: "Pochette",
    image:
      "/categories/Ultra luxury product photography of a handmade canvas pochette pouch placed perfectly centered, minimal elegant background with soft tropical palm leaf shadows, Mauritian island inspired aesthetic, neutral sand.jpg",
    href: "/categories/pochette",
    eyebrow: "Handmade",
  },
  {
    slug: "trousse",
    name: "Trousse",
    image:
      "/categories/Luxury handmade trousse bag centered in the middle, premium canvas fabric texture visible, minimal tropical background with soft palm leaves and warm sunlight, Mauritian island luxury aesthetic, fashion editori.jpg",
    href: "/categories/trousse",
    eyebrow: "Travel",
  },
  {
    slug: "bags",
    name: "Bags",
    image:
      "/categories/Ultra luxury handmade handbag centered in the middle, premium handcrafted fabric bag with elegant structure, tropical island inspired background with soft sand tones and palm leaves, Mauritian lifestyle luxury.jpg",
    href: "/categories/bags",
    eyebrow: "Luxury",
  },
  {
    slug: "hair-accessories",
    name: "Hair Accessories",
    image:
      "/categories/Luxury hair accessories flat lay centered in the middle, handmade turbans, scrunchies and bows arranged beautifully, minimal pastel background with soft tropical lighting, feminine fashion editorial aesthetic,.jpg",
    href: "/categories/hair-accessories",
    eyebrow: "Beauty",
  },
  {
    slug: "home-decoration",
    name: "Home Decoration",
    image:
      "/categories/Elegant handmade home decoration product centered in the middle, minimal luxury interior background with soft neutral tones, tropical island design inspiration, Mauritian handcrafted decor style, premium lighti.jpg",
    href: "/categories/home-decoration",
    eyebrow: "Artisan",
  },
  {
    slug: "leather-craft",
    name: "Leather Craft",
    image:
      "/categories/Luxury handcrafted leather accessory centered in the middle, premium leather wallet or pouch with rich texture, minimal beige luxury background with soft spotlight lighting, elegant artisan craftsmanship aesthe.jpg",
    href: "/categories/leather-craft",
    eyebrow: "Crafted",
  },
];

function useInViewOnce<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export default function CategoryCarousel() {
  const items = useMemo(() => CATEGORIES, []);
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.12);

  return (
    <section className="relative overflow-hidden bg-[#fffaf9] py-14 md:py-18">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-8 top-10 h-28 w-28 rounded-full bg-[hsl(var(--brand-pink-dark))]/8 blur-3xl" />
        <div className="absolute bottom-6 right-8 h-28 w-28 rounded-full bg-[hsl(var(--brand-pink-light))]/20 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
        <div
          ref={ref}
          className={[
            "transition-all duration-700 ease-out",
            inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
          ].join(" ")}
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.26em] text-neutral-500">
                Curated Collections
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black md:text-3xl">
                Discover the world of Mea Kreation
              </h2>
            </div>

            <Link
              href="/categories"
              className="hidden rounded-full border border-black/10 bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:inline-flex"
            >
              View All
            </Link>
          </div>

          <div className="mt-10 hidden gap-5 md:grid md:grid-cols-3 lg:grid-cols-6">
            {items.map((c, idx) => (
              <Link
                key={c.slug}
                href={c.href}
                className={[
                  "group rounded-[26px] border border-black/6 bg-white p-3",
                  "shadow-[0_18px_50px_rgba(17,17,17,0.06)]",
                  "transition-all duration-500 ease-out",
                  "hover:-translate-y-2 hover:shadow-[0_28px_70px_rgba(17,17,17,0.12)]",
                  inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
                ].join(" ")}
                style={{
                  transitionDelay: inView ? `${Math.min(idx * 70, 350)}ms` : "0ms",
                }}
              >
                <div className="relative aspect-square overflow-hidden rounded-[22px]">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                    priority={idx < 3}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/0" />
                </div>

                <div className="px-1 pb-1 pt-4 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[hsl(var(--brand-pink-dark))]">
                    {c.eyebrow}
                  </div>
                  <div className="mt-2 text-sm font-semibold tracking-wide text-black">
                    {c.name}
                  </div>
                  <div className="mt-1 text-[12px] text-neutral-500 transition-colors group-hover:text-neutral-700">
                    Explore products
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 md:hidden">
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
              {items.map((c, idx) => (
                <Link
                  key={c.slug}
                  href={c.href}
                  className={[
                    "group min-w-[72%] snap-center rounded-[26px] border border-black/6 bg-white p-3",
                    "shadow-[0_16px_45px_rgba(17,17,17,0.08)]",
                    "transition-all duration-500",
                    inView ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
                  ].join(" ")}
                  style={{
                    transitionDelay: inView ? `${Math.min(idx * 70, 350)}ms` : "0ms",
                  }}
                >
                  <div className="relative aspect-square overflow-hidden rounded-[22px]">
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      sizes="72vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      priority={idx < 2}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                  </div>

                  <div className="px-1 pb-1 pt-4 text-center">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[hsl(var(--brand-pink-dark))]">
                      {c.eyebrow}
                    </div>
                    <div className="mt-2 text-base font-semibold tracking-tight text-black">
                      {c.name}
                    </div>
                    <div className="mt-1 text-[12px] text-neutral-500">
                      Explore products
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center">
              <Link
                href="/categories"
                className="rounded-full border border-black/10 bg-white px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black shadow-sm"
              >
                View All Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}