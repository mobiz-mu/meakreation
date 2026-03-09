"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { X, Search } from "lucide-react";
import { useUI } from "@/store/ui";

type Suggestion = { title: string; href: string; subtitle?: string };

const DEMO_SUGGESTIONS: Suggestion[] = [
  { title: "Turbans", href: "/shop?cat=hair-accessories", subtitle: "Hair Accessories" },
  { title: "Silk Bonnets", href: "/shop?cat=hair-accessories", subtitle: "Hair Accessories" },
  { title: "Pochette", href: "/shop?cat=pochette", subtitle: "Accessories" },
  { title: "Tote Bags", href: "/shop?cat=bags", subtitle: "Bags" },
  { title: "Home Decoration", href: "/shop?cat=home-decoration", subtitle: "Decor" },
];

function lockBody(lock: boolean) {
  if (typeof document === "undefined") return;
  document.body.style.overflow = lock ? "hidden" : "";
}

export default function SearchModal() {
  const { searchOpen, closeSearch } = useUI();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!searchOpen) return;
    lockBody(true);
    setTimeout(() => inputRef.current?.focus(), 50);
    return () => lockBody(false);
  }, [searchOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!searchOpen) return;
      if (e.key === "Escape") closeSearch();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, closeSearch]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return DEMO_SUGGESTIONS;
    return DEMO_SUGGESTIONS.filter((x) => x.title.toLowerCase().includes(s) || (x.subtitle || "").toLowerCase().includes(s));
  }, [q]);

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[80]">
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="Close search"
        onClick={closeSearch}
      />

      <div className="absolute left-1/2 top-6 w-[min(920px,calc(100vw-1.5rem))] -translate-x-1/2">
        <div className="rounded-3xl border bg-white shadow-[0_40px_120px_rgba(0,0,0,0.18)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="p-4 md:p-5 border-b flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-muted/50 flex items-center justify-center">
              <Search size={18} />
            </div>

            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, categories…"
              className="flex-1 h-12 outline-none bg-transparent text-sm md:text-base"
            />

            <button
              onClick={closeSearch}
              className="h-10 w-10 rounded-2xl hover:bg-muted/40 flex items-center justify-center"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-3 md:p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground px-2 pb-2">
              Suggestions
            </div>

            <div className="grid md:grid-cols-2 gap-2">
              {results.map((r) => (
                <Link
                  key={r.href + r.title}
                  href={r.href}
                  onClick={closeSearch}
                  className="rounded-2xl border bg-white hover:bg-muted/30 transition p-4 flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.title}</div>
                    {r.subtitle ? (
                      <div className="text-xs text-muted-foreground truncate">{r.subtitle}</div>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground">↵</div>
                </Link>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between px-2">
              <div className="text-xs text-muted-foreground">
                Tip: Press <span className="font-medium">ESC</span> to close
              </div>

              <Link
                href={q.trim() ? `/shop?search=${encodeURIComponent(q.trim())}` : "/shop"}
                onClick={closeSearch}
                className="text-xs font-medium hover:text-[hsl(var(--brand-pink-dark))] transition"
              >
                View all results →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}