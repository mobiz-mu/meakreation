"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Heart,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";

import { useUI } from "@/store/ui";
import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";
import { supabase } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/categories";

const POLICIES = [
  { name: "Shipping Policy", href: "/policies/shipping" },
  { name: "Returns & Exchange", href: "/policies/returns" },
  { name: "Privacy Policy", href: "/policies/privacy" },
  { name: "Terms & Conditions", href: "/policies/terms" },
];

function useOutside(close: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) close();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [close]);

  return ref;
}

function Badge({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="absolute -right-1 -top-1 min-w-[18px] h-[18px] rounded-full bg-[#8f4f63] px-1 text-center text-[11px] leading-[18px] text-white">
      {n > 99 ? "99+" : n}
    </span>
  );
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function Header() {
  const openSearch = useUI((s) => s.openSearch);
  const openCart = useCart((s) => s.openCart);

  const wishlistCount = useWishlist((s) => s.items.length);
  const cartCount = useCart((s) =>
    s.items.reduce((sum, item) => sum + item.qty, 0)
  );

  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [bestOpen, setBestOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const catRef = useOutside(() => setCatOpen(false));
  const bestRef = useOutside(() => setBestOpen(false));
  const contactRef = useOutside(() => setContactOpen(false));
  const accountRef = useOutside(() => setAccountOpen(false));

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 16);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setCatOpen(false);
      setBestOpen(false);
      setContactOpen(false);
      setMobileOpen(false);
      setAccountOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;
        setUser(user ?? null);
      } catch {
        if (!mounted) return;
        setUser(null);
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  function closeAll() {
    setCatOpen(false);
    setBestOpen(false);
    setContactOpen(false);
    setAccountOpen(false);
    setMobileOpen(false);
  }

  const shellClass = scrolled
    ? "bg-[rgba(255,250,247,0.88)] border-white/55 shadow-[0_14px_42px_rgba(51,28,24,0.10)]"
    : "bg-[rgba(255,250,247,0.58)] border-white/35 shadow-[0_14px_42px_rgba(51,28,24,0.08)]";

  const menuText = "text-[#4b2e26]";
  const hoverText = "hover:text-[#8f4f63]";
  const iconClass = "text-[#4b2e26] hover:bg-white/35";

  return (
    <header className="sticky top-0 z-50">
      <div className="px-3 pt-0 md:px-5 md:pt-0">
        <div
          className={cx(
            "mx-auto max-w-[1840px] rounded-[26px] border backdrop-blur-xl transition-all duration-300",
            shellClass
          )}
        >
          <div className="px-4 md:px-7 xl:px-8">
            <div className="flex items-center justify-between py-3.5 md:py-4.5">
              <Link
                href="/"
                className="flex min-w-0 items-center gap-3 md:gap-4"
                onClick={closeAll}
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-transparent md:h-14 md:w-14">
                  <Image
                    src="/logo.png"
                    alt="Mea Kréation"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                <div className="min-w-0 leading-tight">
                  <div className="truncate text-[1.1rem] font-semibold tracking-[0.01em] text-[#4b2e26] md:text-[1.85rem]">
                    Mea Kréation
                  </div>
                  <div className="hidden text-[11px] tracking-[0.14em] text-[#6e5a53] md:block">
                    Handmade in Mauritius
                  </div>
                </div>
              </Link>

              <nav
                className={cx(
                  "hidden items-center gap-8 xl:gap-10 text-[15px] font-medium lg:flex",
                  menuText
                )}
              >
                <Link className={cx("transition", hoverText)} href="/" onClick={closeAll}>
                  Home
                </Link>

                <Link className={cx("transition", hoverText)} href="/about" onClick={closeAll}>
                  About Us
                </Link>

                <div ref={bestRef} className="relative">
                  <button
                    type="button"
                    onClick={() => (
                      setBestOpen((v) => !v),
                      setCatOpen(false),
                      setContactOpen(false),
                      setAccountOpen(false)
                    )}
                    className={cx("inline-flex items-center gap-2 transition", hoverText)}
                  >
                    Best Sellers
                    <ChevronDown
                      size={16}
                      className={bestOpen ? "rotate-180 transition" : "transition"}
                    />
                  </button>

                  {bestOpen && (
                    <div className="absolute left-1/2 top-full mt-4 w-56 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/60 bg-white/96 shadow-[0_30px_80px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                      <Link
                        className="block px-4 py-3 text-sm text-[#4b2e26] hover:bg-black/[0.04]"
                        href="/best-sellers"
                        onClick={closeAll}
                      >
                        Best Sellers
                      </Link>
                      <Link
                        className="block px-4 py-3 text-sm text-[#4b2e26] hover:bg-black/[0.04]"
                        href="/new-arrivals"
                        onClick={closeAll}
                      >
                        New Arrivals
                      </Link>
                    </div>
                  )}
                </div>

                <div ref={catRef} className="relative">
                  <button
                    type="button"
                    onClick={() => (
                      setCatOpen((v) => !v),
                      setBestOpen(false),
                      setContactOpen(false),
                      setAccountOpen(false)
                    )}
                    className={cx("inline-flex items-center gap-2 transition", hoverText)}
                  >
                    Categories
                    <ChevronDown
                      size={16}
                      className={catOpen ? "rotate-180 transition" : "transition"}
                    />
                  </button>

                  {catOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-black/10"
                        onClick={() => setCatOpen(false)}
                      />

                      <div className="absolute left-1/2 top-full z-50 mt-4 w-[min(920px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-3xl border border-white/60 bg-white/96 shadow-[0_40px_120px_rgba(0,0,0,0.16)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 md:p-7">
                          <div className="mb-5 flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold tracking-wide text-[#4b2e26]">
                                Shop by Category
                              </div>
                              <div className="text-xs text-black/55">
                                Discover our handmade collections
                              </div>
                            </div>
                            <Link
                              href="/shop"
                              onClick={closeAll}
                              className="rounded-xl border border-black/10 px-3 py-2 text-xs font-medium text-[#4b2e26] transition hover:bg-black/[0.04]"
                            >
                              View All
                            </Link>
                          </div>

                          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            {CATEGORIES.map((cat) => (
                              <Link
                                key={cat.name}
                                href={cat.href}
                                onClick={closeAll}
                                className="group flex items-center gap-4 rounded-2xl border border-black/8 bg-white p-3 transition hover:bg-black/[0.03]"
                              >
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-black/10 bg-muted">
                                  <Image
                                    src={cat.image}
                                    alt={cat.name}
                                    fill
                                    className="object-cover transition group-hover:scale-105"
                                    sizes="56px"
                                  />
                                </div>

                                <div className="min-w-0">
                                  <div className="truncate text-sm font-medium text-[#4b2e26] transition group-hover:text-[#8f4f63]">
                                    {cat.name}
                                  </div>
                                  <div className="truncate text-[11px] text-black/50">
                                    Explore products
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-black/6 bg-[#fbf3f6]/90 px-6 py-4 md:px-7">
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                            <div className="text-xs text-black/55">
                              Premium handmade pieces • Limited batches • Crafted with love
                            </div>
                            <Link
                              href="/shop"
                              onClick={closeAll}
                              className="text-xs font-medium text-[#4b2e26] transition hover:text-[#8f4f63]"
                            >
                              Shop Now →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Link className={cx("transition", hoverText)} href="/shop" onClick={closeAll}>
                  Shop
                </Link>

                <Link className={cx("transition", hoverText)} href="/blog" onClick={closeAll}>
                  Blog
                </Link>

                <div ref={contactRef} className="relative">
                  <button
                    type="button"
                    onClick={() => (
                      setContactOpen((v) => !v),
                      setCatOpen(false),
                      setBestOpen(false),
                      setAccountOpen(false)
                    )}
                    className={cx("inline-flex items-center gap-2 transition", hoverText)}
                  >
                    Contact Us
                    <ChevronDown
                      size={16}
                      className={contactOpen ? "rotate-180 transition" : "transition"}
                    />
                  </button>

                  {contactOpen && (
                    <div className="absolute left-1/2 top-full mt-4 w-72 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/60 bg-white/96 shadow-[0_30px_80px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                      <Link
                        className="block px-4 py-3 text-sm text-[#4b2e26] hover:bg-black/[0.04]"
                        href="/contact"
                        onClick={closeAll}
                      >
                        Contact Us
                      </Link>

                      <div className="px-4 pb-2 pt-3 text-[11px] uppercase tracking-wider text-black/45">
                        Our Policies
                      </div>

                      {POLICIES.map((p) => (
                        <Link
                          key={p.href}
                          className="block px-4 py-2 text-sm text-[#4b2e26] hover:bg-black/[0.04]"
                          href={p.href}
                          onClick={closeAll}
                        >
                          {p.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </nav>

              <div className="hidden items-center gap-2 xl:gap-3 lg:flex">
                <button
                  type="button"
                  className={cx("rounded-xl p-2.5 transition", iconClass)}
                  aria-label="Search"
                  onClick={openSearch}
                >
                  <Search size={21} />
                </button>

                <Link
                  href="/wishlist"
                  aria-label="Wishlist"
                  className={cx("relative rounded-xl p-2.5 transition", iconClass)}
                  onClick={closeAll}
                >
                  <Heart size={21} />
                  <Badge n={wishlistCount} />
                </Link>

                <div ref={accountRef} className="relative">
                  <button
                    type="button"
                    className={cx("rounded-xl p-2.5 transition", iconClass)}
                    aria-label="Account"
                    onClick={() => {
                      setAccountOpen((v) => !v);
                      setCatOpen(false);
                      setBestOpen(false);
                      setContactOpen(false);
                    }}
                  >
                    <User size={21} />
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-white/60 bg-white/96 shadow-[0_30px_80px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                      {user ? (
                        <>
                          <Link
                            className="block px-4 py-3 text-sm text-[#4b2e26] hover:bg-black/[0.04]"
                            href="/account"
                            onClick={closeAll}
                          >
                            My Account
                          </Link>

                          <button
                            type="button"
                            onClick={async () => {
                              await supabase.auth.signOut({ scope: "local" });
                              closeAll();
                              window.location.href = "/";
                            }}
                            className="block w-full px-4 py-3 text-left text-sm text-[#4b2e26] hover:bg-black/[0.04]"
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            className="block px-4 py-3 text-sm text-[#4b2e26] hover:bg-black/[0.04]"
                            href="/login"
                            onClick={closeAll}
                          >
                            Sign In
                          </Link>

                          <Link
                            className="block px-4 py-3 text-sm text-[#4b2e26] hover:bg-black/[0.04]"
                            href="/signup"
                            onClick={closeAll}
                          >
                            Sign Up
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className={cx("relative rounded-xl p-2.5 transition", iconClass)}
                  aria-label="Cart"
                  onClick={openCart}
                >
                  <ShoppingCart size={21} />
                  <Badge n={cartCount} />
                </button>
              </div>

              <button
                className={cx("rounded-xl p-2.5 transition lg:hidden", iconClass)}
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={25} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-[#fffaf7] p-5 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 overflow-hidden rounded-full bg-transparent">
                  <Image
                    src="/logo.png"
                    alt="Mea Kréation"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="font-semibold text-[#4b2e26]">Mea Kréation</div>
              </div>
              <button
                className="rounded-xl p-2 hover:bg-black/[0.04]"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              <button
                type="button"
                className="flex justify-center rounded-2xl border p-3 transition hover:bg-black/[0.04]"
                aria-label="Search"
                onClick={() => {
                  setMobileOpen(false);
                  openSearch();
                }}
              >
                <Search size={18} />
              </button>

              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative flex justify-center rounded-2xl border p-3 transition hover:bg-black/[0.04]"
                onClick={closeAll}
              >
                <Heart size={18} />
                {wishlistCount > 0 && (
                  <span className="absolute -right-2 -top-2 min-w-[18px] h-[18px] rounded-full bg-[#8f4f63] px-1 text-center text-[11px] leading-[18px] text-white">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                className="flex justify-center rounded-2xl border p-3 transition hover:bg-black/[0.04]"
                href={user ? "/account" : "/login"}
                aria-label="Account"
                onClick={closeAll}
              >
                <User size={18} />
              </Link>

              <button
                type="button"
                className="relative flex justify-center rounded-2xl border p-3 transition hover:bg-black/[0.04]"
                aria-label="Cart"
                onClick={() => {
                  setMobileOpen(false);
                  openCart();
                }}
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 min-w-[18px] h-[18px] rounded-full bg-[#8f4f63] px-1 text-center text-[11px] leading-[18px] text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            </div>

            <div className="mt-6 space-y-2 text-sm text-[#4b2e26]">
              <Link className="block rounded-2xl px-3 py-3 transition hover:bg-black/[0.04]" href="/" onClick={closeAll}>
                Home
              </Link>

              <Link className="block rounded-2xl px-3 py-3 transition hover:bg-black/[0.04]" href="/about" onClick={closeAll}>
                About Us
              </Link>

              <details className="group rounded-2xl border">
                <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-3">
                  <span>Best Sellers</span>
                  <ChevronDown size={18} className="transition group-open:rotate-180" />
                </summary>
                <div className="space-y-1 px-3 pb-3">
                  <Link className="block rounded-xl px-3 py-2 transition hover:bg-black/[0.04]" href="/best-sellers" onClick={closeAll}>
                    Best Sellers
                  </Link>
                  <Link className="block rounded-xl px-3 py-2 transition hover:bg-black/[0.04]" href="/new-arrivals" onClick={closeAll}>
                    New Arrivals
                  </Link>
                </div>
              </details>

              <details className="group rounded-2xl border">
                <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-3">
                  <span>Categories</span>
                  <ChevronDown size={18} className="transition group-open:rotate-180" />
                </summary>
                <div className="space-y-2 px-3 pb-3">
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.name}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-black/[0.04]"
                      href={c.href}
                      onClick={closeAll}
                    >
                      <span className="text-sm">{c.name}</span>
                    </Link>
                  ))}
                </div>
              </details>

              <Link className="block rounded-2xl px-3 py-3 transition hover:bg-black/[0.04]" href="/shop" onClick={closeAll}>
                Shop
              </Link>

              <Link className="block rounded-2xl px-3 py-3 transition hover:bg-black/[0.04]" href="/blog" onClick={closeAll}>
                Blog
              </Link>

              <details className="group rounded-2xl border">
                <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-3">
                  <span>Contact Us</span>
                  <ChevronDown size={18} className="transition group-open:rotate-180" />
                </summary>
                <div className="space-y-1 px-3 pb-3">
                  <Link className="block rounded-xl px-3 py-2 transition hover:bg-black/[0.04]" href="/contact" onClick={closeAll}>
                    Contact Us
                  </Link>
                  <div className="px-3 pb-1 pt-2 text-[11px] uppercase tracking-wider text-black/45">
                    Our Policies
                  </div>
                  {POLICIES.map((p) => (
                    <Link
                      key={p.href}
                      className="block rounded-xl px-3 py-2 transition hover:bg-black/[0.04]"
                      href={p.href}
                      onClick={closeAll}
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              </details>

              {!user && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    className="rounded-2xl border px-4 py-3 text-center transition hover:bg-black/[0.04]"
                    href="/login"
                    onClick={closeAll}
                  >
                    Login
                  </Link>
                  <Link
                    className="rounded-2xl bg-[#8f4f63] px-4 py-3 text-center text-white transition hover:opacity-90"
                    href="/signup"
                    onClick={closeAll}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {user && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link
                    className="rounded-2xl border px-4 py-3 text-center transition hover:bg-black/[0.04]"
                    href="/account"
                    onClick={closeAll}
                  >
                    My Account
                  </Link>
                  <button
                    type="button"
                    className="rounded-2xl bg-[#8f4f63] px-4 py-3 text-center text-white transition hover:opacity-90"
                    onClick={async () => {
                      await supabase.auth.signOut({ scope: "local" });
                      closeAll();
                      window.location.href = "/";
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 text-xs text-black/45">
              © Mea Kréation
            </div>
          </div>
        </div>
      )}
    </header>
  );
}