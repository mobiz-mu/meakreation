"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SOCIALS = [
  { name: "Facebook", href: "#", icon: "/socialmedia/facebook.png" },
  { name: "Instagram", href: "#", icon: "/socialmedia/instagram.png" },
  { name: "LinkedIn", href: "#", icon: "/socialmedia/linkedin.png" },
  { name: "TikTok", href: "#", icon: "/socialmedia/tiktok.png" },
  { name: "WhatsApp", href: "#", icon: "/socialmedia/whatsapp.png" },
  { name: "YouTube", href: "#", icon: "/socialmedia/youtube.png" },
];

export default function AboutSection() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold: 0.2 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="py-12 md:py-14">
      <div className="mx-auto max-w-7xl px-4 md:px-10">
        {/* Title centered */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            The Story Behind Atelier de Méa
          </h2>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            Handmade pieces crafted with love in Mauritius
          </p>
        </div>

        {/* Premium container */}
        <div
          ref={ref}
          className={[
            "mt-8 md:mt-10 overflow-hidden rounded-3xl border",
            "bg-gradient-to-br from-[hsl(var(--brand-pink-light))]/35 via-white to-white",
            "shadow-[0_18px_60px_rgba(0,0,0,0.06)]",
            "transition-all duration-700",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          ].join(" ")}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            {/* LEFT: Image (small height) */}
            <div className="md:col-span-5 p-6 md:p-8 flex items-center justify-center">
              <div className="relative w-full max-w-[360px] h-[180px] md:h-[240px]">
                <Image
                  src="/meakreation.png"
                  alt="Mea Kréation"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 90vw, 420px"
                  priority
                />
              </div>
            </div>

            {/* RIGHT: Text */}
            <div className="md:col-span-7 p-6 md:p-10 flex flex-col justify-center">
              <div className="text-[15px] md:text-[16px] leading-relaxed text-neutral-800">
                <p>
                  Atelier de Mea is a small Mauritian brand born from a simple idea:
                  help everyday queens feel beautiful, confident and comfortable in
                  their own style — with handmade turbans, outfits and bags crafted
                  with love in Roche Bois.
                </p>

                <p className="mt-4 text-neutral-700">
                  Every piece is cut, sewn and finished by hand, in small batches. We
                  focus on soft fabrics, feminine colours and practical designs that
                  fit real life — school runs, office days, celebrations and cosy
                  weekends.
                </p>
              </div>

              {/* Social icons row */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {SOCIALS.map((s) => (
                  <Link
                    key={s.name}
                    href={s.href}
                    aria-label={s.name}
                    className="group inline-flex items-center justify-center h-10 w-10 rounded-full border bg-white/80 backdrop-blur hover:bg-white shadow-sm hover:shadow-md transition"
                  >
                    <span className="relative h-5 w-5">
                      <Image
                        src={s.icon}
                        alt={s.name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    </span>
                  </Link>
                ))}

                <div className="ml-1 text-xs text-muted-foreground">
                  Follow for new drops & limited releases ✨
                </div>
              </div>

              {/* Micro badges */}
              <div className="mt-5 flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-full border bg-white/70">
                  Crafted in Mauritius
                </span>
                <span className="px-3 py-1 rounded-full border bg-white/70">
                  Premium finish
                </span>
                <span className="px-3 py-1 rounded-full border bg-white/70">
                  Limited batches
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}