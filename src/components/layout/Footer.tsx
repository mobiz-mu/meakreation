"use client";

import Image from "next/image";
import Link from "next/link";

const QUICK_LINKS = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Shop", href: "/shop" },
  { name: "Best Sellers", href: "/best-sellers" },
  { name: "New Arrivals", href: "/new-arrivals" },
  { name: "Categories", href: "/categories" },
  { name: "Blog", href: "/blog" },
  { name: "Contact Us", href: "/contact" },
];

const POLICIES = [
  { name: "Shipping Policy", href: "/policies/shipping" },
  { name: "Returns & Exchange", href: "/policies/returns" },
  { name: "Privacy Policy", href: "/policies/privacy" },
  { name: "Terms & Conditions", href: "/policies/terms" },
  { name: "FAQ", href: "/faq" },
];

const SOCIALS = [
  { name: "Facebook", href: "#", icon: "/socialmedia/facebook.png" },
  { name: "Instagram", href: "#", icon: "/socialmedia/instagram.png" },
  { name: "LinkedIn", href: "#", icon: "/socialmedia/linkedin.png" },
  { name: "TikTok", href: "#", icon: "/socialmedia/tiktok.png" },
  { name: "YouTube", href: "#", icon: "/socialmedia/youtube.png" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 text-white bg-[#5a3b2a]">
      {/* Luxury top highlight */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-white/35 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 md:px-10">
        <div className="py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-2xl overflow-hidden border border-white/15 bg-white/5 shadow-sm">
                <Image
                  src="/logo.png"
                  alt="Mea Kréation logo"
                  fill
                  className="object-contain p-1"
                  sizes="48px"
                />
              </div>

              <div className="leading-tight">
                <div className="text-lg font-semibold tracking-tight">Mea Kréation</div>
                <div className="text-xs text-white/70">Handmade in Mauritius</div>
              </div>
            </div>

            <p className="mt-5 text-sm text-white/80 leading-relaxed max-w-sm">
              Premium handmade pieces crafted with love — accessories, bags and home décor designed for everyday queens.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="text-[11px] px-3 py-1 rounded-full border border-white/15 bg-white/5 text-white/85">
                Crafted in Mauritius
              </span>
              <span className="text-[11px] px-3 py-1 rounded-full border border-white/15 bg-white/5 text-white/85">
                Limited Batches
              </span>
              <span className="text-[11px] px-3 py-1 rounded-full border border-white/15 bg-white/5 text-white/85">
                Premium Finish
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <nav aria-label="Footer Quick Links">
            <div className="text-sm font-semibold tracking-wide">Quick Links</div>
            <ul className="mt-4 space-y-3 text-sm">
              {QUICK_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/80 hover:text-white transition"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3: Policies */}
          <nav aria-label="Footer Policies">
            <div className="text-sm font-semibold tracking-wide">Our Policies</div>
            <ul className="mt-4 space-y-3 text-sm">
              {POLICIES.map((p) => (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    className="text-white/80 hover:text-white transition"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4: Company Info */}
          <div>
            <div className="text-sm font-semibold tracking-wide">Company Information</div>

            <div className="mt-4 space-y-3 text-sm text-white/80">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-white/60">
                  Phone
                </div>
                <a href="tel:+23059117549" className="hover:text-white transition">
                  +230 5911 7549
                </a>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wider text-white/60">
                  WhatsApp
                </div>
                <a
                  href="https://wa.me/23059117549"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  +230 5911 7549
                </a>
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-wider text-white/60">
                  Email
                </div>
                <a
                  href="mailto:meakreation23@gmail.com"
                  className="hover:text-white transition break-all"
                >
                  meakreation23@gmail.com
                </a>
              </div>
            </div>

            {/* Social icons */}
            <div className="mt-6">
              <div className="text-[11px] uppercase tracking-wider text-white/60">
                Follow us
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.name}
                    title={s.name}
                    className="group relative h-10 w-10 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition shadow-sm overflow-hidden"
                  >
                    <Image
                      src={s.icon}
                      alt={s.name}
                      fill
                      className="object-contain p-2.5 group-hover:scale-105 transition"
                      sizes="40px"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar (CENTERED) */}
        <div className="border-t border-white/10 py-7">
          <div className="text-center text-sm text-white/75">
            © {year} <span className="font-semibold text-white">Mea Kréation</span>. All rights reserved.
          </div>

          <div className="mt-2 text-center text-sm text-white/75 flex items-center justify-center gap-2 flex-wrap">
            <span>Built with</span>
            <span className="mk-heart" aria-label="love">
              ❤
            </span>
            <span>by</span>
            <a
              href="https://mobiz.mu"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-white hover:opacity-90 transition underline underline-offset-4 decoration-white/30 hover:decoration-white"
            >
              MoBiz.mu
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .mk-heart {
          display: inline-block;
          font-size: 20px;
          line-height: 1;
          transform-origin: center;
          animation: mk-pulse 1.15s ease-in-out infinite;
          color: #ff2d2d; /* RED heart */
          filter: drop-shadow(0 10px 18px rgba(255, 45, 45, 0.35));
        }
        @keyframes mk-pulse {
          0% {
            transform: scale(1);
          }
          40% {
            transform: scale(1.25);
          }
          70% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </footer>
  );
}