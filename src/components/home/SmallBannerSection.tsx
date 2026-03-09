"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Slide = {
  id: number;
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

const SLIDES: Slide[] = [
  {
    id: 1,
    image: "/small-banner/headbandshair.png",
    eyebrow: "Luxury Hair Statement",
    title: "Elegant Bows & Hair Pieces for Refined Island Style",
    description:
      "Discover premium handmade hair accessories designed to elevate your everyday look with softness, femininity, and Mauritian elegance.",
    href: "/shop?cat=hair-accessories",
    cta: "Shop Hair Accessories",
  },
  {
    id: 2,
    image: "/small-banner/trousse.png",
    eyebrow: "Handmade Essentials",
    title: "Beautiful Trousses Crafted for Chic Daily Use",
    description:
      "From travel beauty essentials to elegant storage, our handmade trousses combine practical design with a luxury island-inspired aesthetic.",
    href: "/shop?cat=trousse",
    cta: "Explore Trousses",
  },
  {
    id: 3,
    image: "/small-banner/headaccessories.png",
    eyebrow: "Feminine Details",
    title: "Signature Accessories That Complete the Look",
    description:
      "Curated headwear and statement pieces designed to bring softness, confidence, and a polished finishing touch to your style.",
    href: "/shop?cat=hair-accessories",
    cta: "View Collection",
  },
  {
    id: 4,
    image: "/small-banner/headband.png",
    eyebrow: "Modern Headbands",
    title: "Premium Headbands with a Sophisticated Twist",
    description:
      "Designed for comfort and beauty, our headbands blend fashion-forward styling with handmade craftsmanship for a truly refined result.",
    href: "/shop?cat=hair-accessories",
    cta: "Shop Headbands",
  },
  {
    id: 5,
    image: "/small-banner/smallbag.png",
    eyebrow: "Small Bags",
    title: "Compact Luxury Bags for Elegant Everyday Moments",
    description:
      "Lightweight, stylish, and beautifully made, our small bags are designed for graceful daily wear with a touch of island luxury.",
    href: "/shop?cat=bags",
    cta: "Discover Bags",
  },
  {
    id: 6,
    image: "/small-banner/handtrousse.png",
    eyebrow: "Portable Beauty",
    title: "Carry Your Essentials in Style",
    description:
      "Our handcrafted trousses and pouches are perfect for beauty, travel, and gifting — practical pieces wrapped in premium elegance.",
    href: "/shop?cat=trousse",
    cta: "Shop Now",
  },
  {
    id: 7,
    image: "/small-banner/headbands.png",
    eyebrow: "Island Elegance",
    title: "Handmade Pieces Inspired by Luxury Mauritius",
    description:
      "A collection that captures femininity, craftsmanship, and tropical refinement — created for women who love timeless beauty.",
    href: "/shop",
    cta: "Explore All",
  },
];

export default function SmallBannerSection() {
  const slides = useMemo(() => SLIDES, []);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const current = slides[active];

  const goTo = (index: number) => setActive(index);
  const prevSlide = () =>
    setActive((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () =>
    setActive((prev) => (prev + 1) % slides.length);

  return (
    <section className="relative overflow-hidden bg-white py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 items-stretch gap-0 overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_30px_90px_rgba(17,17,17,0.08)] md:rounded-[34px] lg:grid-cols-[1.16fr_0.84fr]">
          {/* LEFT IMAGE PANEL */}
          <div className="relative">
            <div className="relative min-h-[320px] aspect-[16/10] w-full md:min-h-[420px] lg:h-full lg:min-h-[560px] lg:aspect-auto">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={[
                    "absolute inset-0 transition-all duration-[1400ms] ease-out",
                    index === active
                      ? "opacity-100 scale-100"
                      : "pointer-events-none opacity-0 scale-[1.035]",
                  ].join(" ")}
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/12 via-black/4 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/0" />
                </div>
              ))}

              {/* top floating label */}
              <div className="absolute left-4 top-4 md:left-6 md:top-6">
                <div className="rounded-full border border-white/30 bg-white/18 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-md shadow-[0_8px_30px_rgba(0,0,0,0.12)] md:text-[11px]">
                  Mea Kreation Luxury
                </div>
              </div>

              {/* bottom controls */}
              <div className="absolute inset-x-0 bottom-4 flex items-center justify-between px-4 md:bottom-5 md:px-5">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/28 bg-white/14 text-white backdrop-blur-md transition duration-300 hover:bg-white/24 md:h-12 md:w-12"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/28 bg-white/14 text-white backdrop-blur-md transition duration-300 hover:bg-white/24 md:h-12 md:w-12"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT TEXT PANEL */}
          <div className="relative bg-[#f7f0e8]">
            <div className="flex h-full flex-col justify-between p-6 md:p-8 lg:p-10 xl:p-12">
              {/* animated text block */}
              <div className="relative min-h-[280px] md:min-h-[320px]">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={[
                      "absolute inset-0 transition-all duration-700 ease-out",
                      index === active
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none translate-y-4 opacity-0",
                    ].join(" ")}
                  >
                    <div className="inline-flex rounded-full border border-[hsl(var(--brand-pink-dark))]/20 bg-white/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-[hsl(var(--brand-pink-dark))] md:text-[11px]">
                      {slide.eyebrow}
                    </div>

                    <h3 className="mt-6 max-w-[12ch] text-3xl font-semibold leading-[1.04] tracking-tight text-neutral-950 md:text-[2.55rem]">
                      {slide.title}
                    </h3>

                    <p className="mt-5 max-w-xl text-sm leading-8 text-neutral-700 md:text-[15px]">
                      {slide.description}
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={slide.href}
                        className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-neutral-900"
                      >
                        {slide.cta}
                      </Link>

                      <Link
                        href="/shop"
                        className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/70 px-6 py-3 text-sm font-medium text-neutral-900 transition duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                      >
                        View Boutique
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* progress + indicators */}
              <div className="mt-8">
                <div className="mb-4 h-[3px] w-full overflow-hidden rounded-full bg-black/8">
                  <div
                    key={active}
                    className="h-full rounded-full bg-[hsl(var(--brand-pink-dark))] animate-[smallBannerProgress_10s_linear_forwards]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => goTo(index)}
                      aria-label={`Go to slide ${index + 1}`}
                      className={[
                        "relative h-2.5 rounded-full transition-all duration-500",
                        index === active
                          ? "w-12 bg-[hsl(var(--brand-pink-dark))]"
                          : "w-2.5 bg-black/12 hover:bg-black/20",
                      ].join(" ")}
                    />
                  ))}

                  <div className="ml-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                    {String(active + 1).padStart(2, "0")} /{" "}
                    {String(slides.length).padStart(2, "0")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}