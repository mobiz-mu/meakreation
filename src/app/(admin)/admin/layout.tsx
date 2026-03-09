"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { supabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabaseBrowser.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;

      if (error || !data.user) {
        setEmail(null);
        return;
      }

      setEmail(data.user.email ?? null);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const nav = useMemo(
    () => [
      { href: "/admin", label: "Dashboard", icon: "▦" },
      { href: "/admin/orders", label: "Orders", icon: "🧾" },
      { href: "/admin/products", label: "Products", icon: "📦" },
      { href: "/admin/categories", label: "Categories", icon: "🏷️" },
      { href: "/admin/banners", label: "Banners", icon: "🖼️" },
      { href: "/admin/blog", label: "Blog", icon: "✍️" },
      { href: "/admin/newsletter", label: "Newsletter", icon: "✉️" },
      { href: "/admin/settings", label: "Settings", icon: "⚙️" },
    ],
    []
  );

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);

    try {
      await Promise.race([
        supabaseBrowser.auth.signOut({ scope: "local" }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Sign out timeout")), 2500)
        ),
      ]);
    } catch (error) {
      console.error("signOut error:", error);
    } finally {
      try {
        localStorage.removeItem("sb-bzglgqdclfbhaksvtxmc-auth-token");
        sessionStorage.removeItem("sb-bzglgqdclfbhaksvtxmc-auth-token");
      } catch {}
      window.location.href = "/admin/login";
    }
  }

  function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <aside className="h-full border-r border-black/10 bg-[#ffe6ef] px-4 py-5 shadow-[0_30px_80px_-65px_rgba(0,0,0,0.30)]">
        <div className="mb-4 rounded-2xl border border-black/10 bg-white/55 px-3 py-3">
          <div className="text-[12px] text-black/55">Navigation</div>
          <div className="text-[13px] font-semibold tracking-tight text-black">
            Back-office
          </div>
        </div>

        <nav className="space-y-1.5">
          {nav.map((n) => {
            const active =
              pathname === n.href ||
              (n.href !== "/admin" && pathname?.startsWith(n.href));

            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={onNavigate}
                className={cx(
                  "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[13px] transition",
                  active
                    ? "border border-black/10 bg-white text-black shadow-[0_14px_40px_-30px_rgba(0,0,0,0.35)]"
                    : "text-black/70 hover:bg-white/50 hover:text-black"
                )}
              >
                <span
                  className={cx(
                    "grid h-9 w-9 place-items-center rounded-2xl border transition",
                    active
                      ? "border-black/10 bg-[#ffb3cc]/35 text-black"
                      : "border-black/10 bg-white/55 text-black/70 group-hover:bg-white"
                  )}
                >
                  <span className="text-[14px] leading-none">{n.icon}</span>
                </span>

                <span className="font-medium">{n.label}</span>

                {active ? (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#ff6fa0]" />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 rounded-2xl border border-black/10 bg-white/55 px-3 py-3 text-[12px] text-black/55">
          Access is restricted to admins only.
        </div>
      </aside>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffafb]">
      <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-black/10 bg-white/90 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-black/10 bg-white transition hover:bg-black/[0.02] lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              type="button"
            >
              <span className="text-lg text-black">≡</span>
            </button>

            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-black/10 bg-white shadow-[0_10px_26px_-18px_rgba(0,0,0,0.25)]">
                <Image
                  src="/logo.png"
                  alt="Mea Kréation"
                  fill
                  className="object-contain p-1.5"
                  sizes="40px"
                  priority
                />
              </div>

              <div className="leading-tight">
                <div className="text-[15px] font-semibold tracking-tight text-black">
                  Mea Kréation
                </div>
                <div className="text-[11px] text-black/55">
                  Admin Dashboard
                </div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-2xl border border-black/10 bg-white px-3 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#ff6fa0]" />
              <div className="max-w-[220px] truncate text-[12px] text-black/70">
                {email || "Admin access"}
              </div>
            </div>

            <Button
              variant="outline"
              className="rounded-2xl border-black/10 bg-white text-black hover:bg-black/[0.02]"
              onClick={signOut}
              disabled={signingOut}
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>
      </header>

      <div className="pt-16">
        <div className="hidden lg:block">
          <div className="fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] w-[290px]">
            <Sidebar />
          </div>
        </div>

        <div className="lg:ml-[290px]">
          <div className="px-4 py-6 sm:px-6">
            <main className="min-w-0">
              <div className="rounded-[28px] border border-black/10 bg-white shadow-[0_24px_70px_-60px_rgba(0,0,0,0.25)]">
                <div className="p-4 sm:p-6">{children}</div>
              </div>

              <div className="mt-4 text-center text-[11px] text-black/45">
                Built by{" "}
                <a
                  href="https://mobiz.mu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#ff6fa0] underline decoration-[#ff6fa0]/40 transition hover:text-black"
                >
                  Mobiz.mu
                </a>
              </div>
            </main>
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[88%] max-w-[340px] overflow-y-auto border-r border-black/10 bg-white">
            <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border border-black/10 bg-white shadow-[0_10px_26px_-18px_rgba(0,0,0,0.25)]">
                  <Image
                    src="/logo.png"
                    alt="Mea Kréation"
                    fill
                    className="object-contain p-1.5"
                    sizes="40px"
                    priority
                  />
                </div>
                <div className="leading-tight">
                  <div className="text-[14px] font-semibold text-black">
                    Mea Kréation
                  </div>
                  <div className="text-[11px] text-black/55">Menu</div>
                </div>
              </div>

              <button
                className="h-10 w-10 rounded-2xl border border-black/10 bg-white transition hover:bg-black/[0.02]"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                type="button"
              >
                <span className="text-lg text-black">×</span>
              </button>
            </div>

            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}