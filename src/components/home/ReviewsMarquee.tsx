"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Review = {
  name: string;
  location: string;
  comment: string;
  avatar: string;
};

function useInViewOnce<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg
          key={i}
          width="15"
          height="15"
          viewBox="0 0 24 24"
          className="shrink-0"
          aria-hidden="true"
        >
          <path
            d="M12 17.3l-6.18 3.73 1.64-7.03L1.9 9.24l7.2-.62L12 2l2.9 6.62 7.2.62-5.56 4.76 1.64 7.03z"
            fill="#F5B301"
          />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewsMarquee() {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.12);

  const reviews: Review[] = useMemo(
    () => [
      {
        name: "Sophie L.",
        location: "Port Louis, Mauritius",
        comment:
          "Super qualité 💗 Le turban est doux, élégant et très confortable. Vraiment une belle finition premium.",
        avatar: "/comments/profilefrance.png",
      },
      {
        name: "Amandine R.",
        location: "Curepipe, Mauritius",
        comment:
          "Finition premium. Livraison rapide. Mo krwar krwar mo pou rekomand li! Packaging aussi très joli.",
        avatar: "/comments/profilefrance1.png",
      },
      {
        name: "Chloé M.",
        location: "Quatre Bornes, Mauritius",
        comment:
          "Magnifique travail fait main. Trousse top pou mo sak tous le jours. Très belle qualité.",
        avatar: "/comments/profilefrance3.png",
      },
      {
        name: "Léa P.",
        location: "Grand Baie, Mauritius",
        comment:
          "Très satisfaite! Couleur, couture, tout bien soigné ✨ On sent vraiment le travail artisanal.",
        avatar: "/comments/profileengland.png",
      },
      {
        name: "Emma K.",
        location: "Flic en Flac, Mauritius",
        comment:
          "Extra joli! Mo krwar li fer differans dan enn outfit 😍 Très élégant et facile à porter.",
        avatar: "/comments/profileengland1.png",
      },
      {
        name: "Nadia S.",
        location: "Rose Hill, Mauritius",
        comment:
          "Service chaleureux, produit super doux. Mo content bokou. La qualité est vraiment au rendez-vous.",
        avatar: "/comments/profilesouthafrica.png",
      },
      {
        name: "Ayesha R.",
        location: "Vacoas, Mauritius",
        comment:
          "Très belle qualité et confortable. Mo pou pran encore! J’adore le style raffiné de la marque.",
        avatar: "/comments/profilesouthafrica1.png",
      },
      {
        name: "Priya N.",
        location: "Phoenix, Mauritius",
        comment:
          "Tote bag bien solide, design élégant. Valeur sûre. Très pratique et très chic à la fois.",
        avatar: "/comments/profileindia.png",
      },
      {
        name: "Irina V.",
        location: "Tamarin, Mauritius",
        comment:
          "Très chic, finition parfaite. Merci pour le joli packaging. Une vraie sensation de luxe artisanal.",
        avatar: "/comments/profilerussia.png",
      },
      {
        name: "Sabrina D.",
        location: "Roche Bois, Mauritius",
        comment:
          "Mo krwar sa bann pièces-la ena enn vibe luxe 💎 Mo ador! Très féminin et très bien présenté.",
        avatar: "/comments/profilefrance.png",
      },
    ],
    []
  );

  const items = [...reviews, ...reviews];

  return (
    <section className="relative w-full overflow-hidden py-14 md:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[6%] top-8 h-44 w-44 rounded-full bg-[hsl(var(--brand-pink-light))]/25 blur-3xl" />
        <div className="absolute right-[8%] top-16 h-52 w-52 rounded-full bg-[#f3ddd3]/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[hsl(var(--brand-pink-dark))]/10 blur-3xl" />
      </div>

      <div
        ref={ref}
        className={[
          "relative transition-all duration-700",
          inView ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        ].join(" ")}
      >
        <div className="mx-auto max-w-[1600px] px-4 md:px-6 xl:px-8">
          <div className="relative overflow-hidden rounded-[34px] border border-black/10 bg-gradient-to-br from-[#fff4f8] via-white to-[#fffdfc] shadow-[0_24px_90px_rgba(0,0,0,0.06)]">
            {/* header */}
            <div className="relative px-5 py-6 md:px-8 md:py-8 xl:px-10">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/75 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-black/55 backdrop-blur">
                    Customer Love
                  </div>

                  <h2 className="mt-4 text-3xl font-semibold tracking-tight text-black md:text-4xl xl:text-5xl">
                    What our customers say
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60 md:text-[15px]">
                    Genuine reviews from women across Mauritius who love the handmade
                    elegance, comfort, and premium finish of Mea Kréation.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-[24px] border border-black/10 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
                  <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-black/10 bg-white">
                    <Image
                      src="/google.png"
                      alt="Google"
                      fill
                      className="object-contain p-2"
                      sizes="44px"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-black">5.0</span>
                      <Stars count={5} />
                    </div>
                    <div className="text-xs text-black/55">
                      Google Reviews • Mauritius
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* marquee */}
            <div className="relative pb-7 md:pb-9">
              <div className="mk-marquee-ultra">
                <div className="mk-track-ultra">
                  {items.map((r, idx) => (
                    <article
                      key={`${r.name}-${idx}`}
                      className="mk-card-ultra rounded-[28px] border border-black/10 bg-white/80 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.06)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(0,0,0,0.10)] md:p-5"
                    >
                      <div className="flex h-full flex-col">
                        <div className="flex items-start gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-black/10 bg-white">
                            <Image
                              src={r.avatar}
                              alt={r.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-black md:text-[15px]">
                                  {r.name}
                                </div>
                                <div className="truncate text-[11px] text-black/50 md:text-xs">
                                  {r.location}
                                </div>
                              </div>

                              <div className="shrink-0">
                                <Stars count={5} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-[13px] leading-7 text-black/75 md:text-[14px]">
                            “{r.comment}”
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* luxury edge fade */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white via-white/90 to-transparent md:w-20" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white via-white/90 to-transparent md:w-20" />
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .mk-marquee-ultra {
          position: relative;
          width: 100%;
          overflow: hidden;
        }

        .mk-track-ultra {
          display: flex;
          gap: 18px;
          width: max-content;
          will-change: transform;
          animation: mkScrollUltra 42s linear infinite;
          padding: 6px 20px 6px 20px;
        }

        .mk-card-ultra {
          width: min(440px, 84vw);
          min-height: 185px;
          flex-shrink: 0;
        }

        @media (min-width: 768px) {
          .mk-track-ultra {
            gap: 20px;
            padding: 6px 28px 6px 28px;
          }

          .mk-card-ultra {
            width: 430px;
            min-height: 200px;
          }
        }

        @media (min-width: 1280px) {
          .mk-card-ultra {
            width: 460px;
          }
        }

        @media (hover: hover) {
          .mk-marquee-ultra:hover .mk-track-ultra {
            animation-play-state: paused;
          }
        }

        @keyframes mkScrollUltra {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}