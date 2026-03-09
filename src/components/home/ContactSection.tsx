"use client";

import { useMemo, useState } from "react";
import { Mail, Sparkles, Heart, Gift } from "lucide-react";

function isValidEmail(email: string) {
  const e = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export default function ContactSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  const canSubmit = useMemo(
    () => isValidEmail(email) && status !== "loading",
    [email, status]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const value = email.trim().toLowerCase();

    if (!isValidEmail(value)) {
      setStatus("error");
      setMsg("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source: "homepage" }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus("error");
        setMsg(data?.error || "Something went wrong. Please try again.");
        return;
      }

      setStatus("ok");
      setMsg("Thank you — you’re now subscribed to Mea Kréation.");
      setEmail("");
    } catch {
      setStatus("error");
      setMsg("Network error. Please try again.");
    }
  }

  return (
    <section className="relative overflow-hidden bg-white py-14 md:py-20">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-10 h-40 w-40 rounded-full bg-[hsl(var(--brand-pink-light))]/20 blur-3xl" />
        <div className="absolute right-[8%] bottom-10 h-44 w-44 rounded-full bg-[#efd8cd]/30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[30px] border border-neutral-200/80 bg-white shadow-[0_24px_80px_rgba(17,17,17,0.06)] md:rounded-[36px]">
          <div className="grid items-stretch gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            {/* LEFT COPY */}
            <div className="relative bg-white px-6 py-8 md:px-10 md:py-12 lg:px-12">
              <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500 shadow-sm md:text-[11px]">
                Mea Kréation Journal
              </div>

              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-neutral-950 md:text-4xl xl:text-[2.8rem] xl:leading-[1.05]">
                Join our world of handmade elegance
              </h2>

              <p className="mt-5 max-w-2xl text-[15px] leading-8 text-neutral-600 md:text-base">
                Subscribe to receive <span className="font-medium text-neutral-900">new arrivals</span>,
                exclusive offers, styling inspiration, and refined handmade stories from
                <span className="font-medium text-neutral-900"> Mea Kréation in Mauritius</span>.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] border border-neutral-200 bg-[#fffaf8] p-4">
                  <Sparkles className="h-5 w-5 text-[hsl(var(--brand-pink-dark))]" />
                  <h3 className="mt-3 text-sm font-semibold text-neutral-950">
                    Early Access
                  </h3>
                  <p className="mt-1 text-[13px] leading-6 text-neutral-600">
                    Be first to discover fresh drops and limited handmade pieces.
                  </p>
                </div>

                <div className="rounded-[22px] border border-neutral-200 bg-[#fffaf8] p-4">
                  <Gift className="h-5 w-5 text-[hsl(var(--brand-pink-dark))]" />
                  <h3 className="mt-3 text-sm font-semibold text-neutral-950">
                    Private Offers
                  </h3>
                  <p className="mt-1 text-[13px] leading-6 text-neutral-600">
                    Enjoy subscriber-only updates, seasonal edits, and elegant surprises.
                  </p>
                </div>

                <div className="rounded-[22px] border border-neutral-200 bg-[#fffaf8] p-4">
                  <Heart className="h-5 w-5 text-[hsl(var(--brand-pink-dark))]" />
                  <h3 className="mt-3 text-sm font-semibold text-neutral-950">
                    Brand Stories
                  </h3>
                  <p className="mt-1 text-[13px] leading-6 text-neutral-600">
                    Follow behind-the-scenes moments and inspiration from our atelier.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT FORM PANEL */}
            <div className="relative border-t border-neutral-200/70 bg-[#f7efe7] px-6 py-8 md:px-10 md:py-12 lg:border-l lg:border-t-0 lg:px-12">
              <div className="mx-auto max-w-xl">
                <div className="rounded-[28px] border border-white/40 bg-white/70 p-5 shadow-[0_16px_50px_rgba(17,17,17,0.06)] backdrop-blur md:p-6">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--brand-pink-dark))]/10">
                      <Mail className="h-5 w-5 text-[hsl(var(--brand-pink-dark))]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-950">
                        Subscribe to our newsletter
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Elegant updates, directly to your inbox.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="newsletter-email"
                        className="text-sm font-medium text-neutral-800"
                      >
                        Email address
                      </label>

                      <input
                        id="newsletter-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        inputMode="email"
                        autoComplete="email"
                        className="h-13 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none transition focus:border-[hsl(var(--brand-pink-dark))]/30 focus:ring-2 focus:ring-[hsl(var(--brand-pink-dark))]/20"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-black px-5 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {status === "loading" ? "Subscribing..." : "Subscribe Now"}
                    </button>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[12px] leading-6 text-neutral-500">
                        No spam. Only refined updates, new drops, and exclusive news.
                      </p>

                      {msg ? (
                        <p
                          className={[
                            "text-[12px] font-medium",
                            status === "ok" ? "text-emerald-600" : "text-rose-600",
                          ].join(" ")}
                          aria-live="polite"
                        >
                          {msg}
                        </p>
                      ) : null}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent" />
        </div>
      </div>
    </section>
  );
}