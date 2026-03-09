"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  image: string;
  category?: string;
};

const POSTS: BlogPost[] = [
  {
    id: "1",
    title: "5 Ways to Style a Turban for Everyday Elegance",
    excerpt:
      "Simple and refined ways to wear your turban from casual mornings to elegant evening moments.",
    slug: "5-ways-to-style-a-turban-for-everyday-elegance",
    image: "/blog/style-turban-everyday.jpg",
    category: "Style",
  },
  {
    id: "2",
    title: "How to Choose the Perfect Pochette",
    excerpt:
      "Find the right size, texture, and finish for a pochette that feels both practical and luxurious.",
    slug: "how-to-choose-the-perfect-pochette",
    image: "/blog/choose-perfect-pochette.jpg",
    category: "Guide",
  },
  {
    id: "3",
    title: "Behind the Scenes: Handmade in Mauritius",
    excerpt:
      "A closer look at the small-batch craftsmanship and feminine care behind each Mea Kréation piece.",
    slug: "behind-the-scenes-handmade-in-mauritius",
    image: "/blog/behind-the-scenes-mauritius.jpg",
    category: "Brand",
  },
  {
    id: "4",
    title: "Soft Fabrics: What Makes Them Feel Luxury?",
    excerpt:
      "Discover why softness, texture, and finish matter when creating elegant handmade accessories.",
    slug: "soft-fabrics-what-makes-them-feel-luxury",
    image: "/blog/soft-fabrics-luxury.jpg",
    category: "Materials",
  },
  {
    id: "5",
    title: "Gift Ideas: Small Pieces, Big Impact",
    excerpt:
      "Thoughtful handmade gift ideas for birthdays, bridal moments, celebrations, and elegant surprises.",
    slug: "gift-ideas-small-pieces-big-impact",
    image: "/blog/gift-ideas-handmade.jpg",
    category: "Gifting",
  },
  {
    id: "6",
    title: "Care Tips: Keep Your Pieces Looking New",
    excerpt:
      "Simple care habits to preserve softness, shape, and beauty in your handmade accessories.",
    slug: "care-tips-keep-your-pieces-looking-new",
    image: "/blog/care-tips.jpg",
    category: "Care",
  },
  {
    id: "7",
    title: "New Arrivals: What’s Dropping This Month",
    excerpt:
      "Fresh colors, elegant silhouettes, and limited-batch handmade pieces arriving this month.",
    slug: "new-arrivals-whats-dropping-this-month",
    image: "/blog/new-arrivals-month.jpg",
    category: "New",
  },
  {
    id: "8",
    title: "How to Build a Capsule Accessories Wardrobe",
    excerpt:
      "Create a refined collection of versatile accessories that elevate every outfit with ease.",
    slug: "how-to-build-a-capsule-accessories-wardrobe",
    image: "/blog/capsule-accessories.jpg",
    category: "Style",
  },
  {
    id: "9",
    title: "From Sketch to Stitch: Our Design Story",
    excerpt:
      "See how inspiration becomes a finished piece through thoughtful details and luxury craftsmanship.",
    slug: "from-sketch-to-stitch-our-design-story",
    image: "/blog/design-story.jpg",
    category: "Brand",
  },
  {
    id: "10",
    title: "Weekend Looks: Effortless & Comfortable",
    excerpt:
      "Relaxed and feminine styling ideas perfect for sunshine, brunches, and elegant weekends in Mauritius.",
    slug: "weekend-looks-effortless-comfortable",
    image: "/blog/weekend-looks.jpg",
    category: "Style",
  },
];

export default function BlogSection() {
  const items = useMemo(() => [...POSTS, ...POSTS], []);

  return (
    <section className="relative overflow-hidden bg-white py-14 md:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-10 h-28 w-28 rounded-full bg-[hsl(var(--brand-pink-light))]/20 blur-3xl" />
        <div className="absolute right-[10%] top-14 h-32 w-32 rounded-full bg-[#f2ddd0]/25 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
        <div className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full border border-neutral-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500 shadow-sm md:text-[11px]">
              Journal
            </div>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 md:text-4xl">
              Our Blog
            </h2>

            <p className="mt-3 text-sm leading-7 text-neutral-600 md:text-[15px]">
              Styling inspiration, handmade stories, care tips, and elegant
              ideas from the world of Mea Kréation.
            </p>
          </div>

          <div>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-900 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:bg-neutral-50 hover:shadow-md"
            >
              View All Articles
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[30px] border border-neutral-100 bg-white shadow-[0_24px_80px_rgba(17,17,17,0.06)]">
          <style>{`
            @keyframes premiumBlogMarquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }

            .premium-blog-track {
              width: max-content;
              display: flex;
              animation: premiumBlogMarquee 10s linear infinite;
              will-change: transform;
            }

            .premium-blog-wrap:hover .premium-blog-track {
              animation-play-state: paused;
            }

            @media (max-width: 768px) {
              .premium-blog-track {
                animation-duration: 14s;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .premium-blog-track {
                animation: none;
                transform: none;
              }
            }
          `}</style>

          <div className="premium-blog-wrap">
            <div className="premium-blog-track gap-4 px-4 py-5 md:gap-5 md:px-5 md:py-6">
              {items.map((post, idx) => (
                <article
                  key={`${post.id}-${idx}`}
                  className="group w-[250px] shrink-0 overflow-hidden rounded-[26px] border border-neutral-100 bg-white shadow-[0_14px_45px_rgba(17,17,17,0.05)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(17,17,17,0.10)] md:w-[290px]"
                >
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-[1.06]"
                        sizes="(max-width: 768px) 250px, 290px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                      {post.category && (
                        <div className="absolute left-4 top-4">
                          <span className="inline-flex items-center rounded-full border border-white/30 bg-white/80 px-3 py-1 text-[11px] font-medium text-neutral-800 backdrop-blur">
                            {post.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="p-5">
                    <h3 className="text-[16px] font-semibold leading-snug text-neutral-950 line-clamp-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="transition hover:text-[hsl(var(--brand-pink-dark))]"
                      >
                        {post.title}
                      </Link>
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-neutral-600 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="mt-5">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--brand-pink-dark))] transition hover:gap-3"
                      >
                        Read Full Article <span>→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent md:w-16" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent md:w-16" />
        </div>
      </div>
    </section>
  );
}