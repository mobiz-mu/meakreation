"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type HeroBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_href: string | null;
  image_url: string;
  mobile_image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function HeroSlider({
  banners,
}: {
  banners: HeroBanner[];
}) {
  const slides = useMemo(
    () => (banners ?? []).filter((b) => (b.image_url || "").trim().length > 0),
    [banners]
  );

  const [index, setIndex] = useState(0);
  const active = slides[index];

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 8000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  return (
    <section className="relative -mt-[88px] w-full overflow-hidden md:-mt-[104px]">
      {/* MOBILE */}
      <div className="relative block h-[118vw] min-h-[620px] max-h-[860px] w-full md:hidden">
        {slides.map((slide, i) => {
          const isActive = i === index;
          const mobileSrc =
            (slide.mobile_image_url || "").trim() || slide.image_url;

          return (
            <div
              key={slide.id}
              className={cx(
                "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
                isActive ? "opacity-100" : "opacity-0"
              )}
            >
              <Image
                src={mobileSrc}
                alt={slide.title || `Hero banner ${i + 1}`}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          );
        })}

        {/* subtle cinematic top fade only for header readability */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-[rgba(54,33,26,0.18)] via-[rgba(54,33,26,0.08)] to-transparent" />

        {/* mobile glass content */}
        <div className="absolute inset-x-4 bottom-10 z-10">
          <div className="mx-auto max-w-[360px] rounded-[30px] border border-white/25 bg-white/16 px-5 py-6 text-center shadow-[0_20px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <div className="animate-[fadeIn_1.2s_ease-out]">
              <p className="text-[11px] uppercase tracking-[0.34em] text-white/90 drop-shadow">
                Premium Handmade
              </p>

              <h2 className="mt-3 text-[1.9rem] font-semibold leading-tight tracking-tight text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]">
                {active?.title || "Luxury Handmade Collection"}
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/92 drop-shadow">
                {active?.subtitle ||
                  "Elegant pieces crafted in Mauritius for timeless feminine style."}
              </p>

              <Link
                href={active?.cta_href || "/shop"}
                className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-[#8f4f63] px-7 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(0,0,0,0.22)] transition duration-300 hover:scale-[1.02] hover:opacity-95"
              >
                {active?.cta_text || "Shop Now"}
              </Link>
            </div>
          </div>
        </div>

        {slides.length > 1 ? (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {slides.map((slide, i) => (
              <span
                key={slide.id}
                className={cx(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === index ? "w-7 bg-white/95" : "w-1.5 bg-white/55"
                )}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* DESKTOP */}
      <div className="relative hidden h-[52vw] min-h-[760px] max-h-[980px] w-full md:block">
        {slides.map((slide, i) => {
          const isActive = i === index;

          return (
            <div
              key={slide.id}
              className={cx(
                "absolute inset-0 transition-opacity duration-[1400ms] ease-out",
                isActive ? "opacity-100" : "opacity-0"
              )}
            >
              <Image
                src={slide.image_url}
                alt={slide.title || `Hero banner ${i + 1}`}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          );
        })}

        {/* subtle top fade for header readability */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-48 bg-gradient-to-b from-[rgba(54,33,26,0.18)] via-[rgba(54,33,26,0.08)] to-transparent" />

        {/* desktop glass content */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 pt-16">
          <div className="w-full max-w-[660px]">
            <div className="rounded-[36px] border border-white/25 bg-white/14 px-10 py-10 text-center shadow-[0_30px_120px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <div className="animate-[fadeIn_1.2s_ease-out]">
                <p className="text-[12px] uppercase tracking-[0.44em] text-white/90 drop-shadow">
                  Premium Handmade in Mauritius
                </p>

                <h1 className="mt-4 text-5xl font-semibold leading-[1.04] tracking-tight text-white drop-shadow-[0_12px_28px_rgba(0,0,0,0.38)] lg:text-[4.2rem]">
                  {active?.title || "Luxury Handmade Collection"}
                </h1>

                <p className="mx-auto mt-5 max-w-2xl text-[1.03rem] leading-8 text-white/92 drop-shadow">
                  {active?.subtitle ||
                    "Refined bags, turbans, outfits and accessories created with elegance, softness and timeless beauty."}
                </p>

                <Link
                  href={active?.cta_href || "/shop"}
                  className="mt-8 inline-flex h-14 items-center justify-center rounded-full bg-[#8f4f63] px-9 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(0,0,0,0.24)] transition duration-300 hover:scale-[1.02] hover:opacity-95"
                >
                  {active?.cta_text || "Shop Now"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {slides.length > 1 ? (
          <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {slides.map((slide, i) => (
              <span
                key={slide.id}
                className={cx(
                  "h-1.5 rounded-full transition-all duration-500",
                  i === index ? "w-8 bg-white/95" : "w-1.5 bg-white/55"
                )}
              />
            ))}
          </div>
        ) : null}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}