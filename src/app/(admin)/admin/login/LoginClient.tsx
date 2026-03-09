"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";

function getNext(sp: ReturnType<typeof useSearchParams>) {
  const n = sp.get("next");
  return n && n.startsWith("/admin") ? n : "/admin";
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function LoginClient() {
  const sp = useSearchParams();
  const next = useMemo(() => getNext(sp), [sp]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Login succeeded but user could not be verified.");
      }

      window.location.href = next;
    } catch (e: any) {
      setErr(e?.message || "Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8dfe7] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_12%_10%,rgba(255,255,255,0.45),transparent_60%),radial-gradient(700px_420px_at_88%_14%,rgba(141,74,86,0.16),transparent_60%),radial-gradient(900px_620px_at_50%_100%,rgba(120,64,56,0.18),transparent_60%)]" />

        <svg
          className="absolute inset-0 h-full w-full opacity-[0.18]"
          viewBox="0 0 1440 1024"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="mkLine1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#8d4a56" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="mkLine2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff7fa" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#b56576" stopOpacity="0.18" />
            </linearGradient>
          </defs>

          <g>
            <path
              d="M-80 170 C 220 40, 420 300, 760 180 S 1230 10, 1540 180"
              stroke="url(#mkLine1)"
              strokeWidth="1.4"
            >
              <animate
                attributeName="d"
                dur="12s"
                repeatCount="indefinite"
                values="
                  M-80 170 C 220 40, 420 300, 760 180 S 1230 10, 1540 180;
                  M-80 190 C 180 10, 430 340, 760 160 S 1210 40, 1540 210;
                  M-80 170 C 220 40, 420 300, 760 180 S 1230 10, 1540 180
                "
              />
            </path>

            <path
              d="M-120 410 C 200 260, 470 520, 780 430 S 1210 240, 1530 420"
              stroke="url(#mkLine2)"
              strokeWidth="1.1"
            >
              <animate
                attributeName="d"
                dur="16s"
                repeatCount="indefinite"
                values="
                  M-120 410 C 200 260, 470 520, 780 430 S 1210 240, 1530 420;
                  M-120 450 C 240 240, 500 560, 780 390 S 1190 260, 1530 460;
                  M-120 410 C 200 260, 470 520, 780 430 S 1210 240, 1530 420
                "
              />
            </path>

            <path
              d="M-70 760 C 280 620, 500 860, 820 740 S 1210 560, 1510 700"
              stroke="url(#mkLine1)"
              strokeWidth="1.2"
            >
              <animate
                attributeName="d"
                dur="14s"
                repeatCount="indefinite"
                values="
                  M-70 760 C 280 620, 500 860, 820 740 S 1210 560, 1510 700;
                  M-70 720 C 300 600, 520 900, 820 760 S 1180 590, 1510 740;
                  M-70 760 C 280 620, 500 860, 820 740 S 1210 560, 1510 700
                "
              />
            </path>
          </g>
        </svg>

        <div className="absolute left-[8%] top-[10%] h-48 w-48 rounded-full bg-white/25 blur-3xl animate-pulse" />
        <div className="absolute right-[10%] top-[18%] h-56 w-56 rounded-full bg-[#8d4a56]/12 blur-3xl animate-pulse" />
        <div className="absolute bottom-[8%] left-[44%] h-60 w-60 rounded-full bg-[#b56576]/12 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-[34px] border border-white/25 bg-white/20 p-5 shadow-[0_35px_120px_-45px_rgba(72,24,30,0.45)] backdrop-blur-xl md:p-6">
            <div className="rounded-[28px] border border-white/10 bg-[#3b1f1b] p-6 md:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="mb-6 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-[20px] border border-white/15 bg-white/10 shadow-[0_14px_40px_-20px_rgba(255,255,255,0.22)]">
                  <span className="text-sm font-semibold tracking-[0.18em] text-white">
                    MK
                  </span>
                </div>

                <div className="mt-4 text-[12px] uppercase tracking-[0.34em] text-white/70">
                  Admin Access
                </div>

                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-[2rem]">
                  Mea Kréation
                </h1>

                <p className="mt-2 text-sm leading-6 text-white/70">
                  Sign in to access the premium back-office console.
                </p>
              </div>

              {err ? (
                <div className="mb-4 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white">
                  {err}
                </div>
              ) : null}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="admin-email"
                    className="text-sm font-medium text-white/90"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/65">
                      <Mail className="h-4 w-4" />
                    </span>

                    <input
                      id="admin-email"
                      className={cx(
                        "h-12 w-full rounded-2xl border border-white/10 bg-white/8 pl-11 pr-4 text-sm text-white outline-none transition",
                        "placeholder:text-white/35",
                        "focus:border-[#d97c98]/40 focus:bg-white/10 focus:ring-2 focus:ring-[#d97c98]/20"
                      )}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      type="email"
                      placeholder="meakreation23@gmail.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="admin-password"
                    className="text-sm font-medium text-white/90"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/65">
                      <LockKeyhole className="h-4 w-4" />
                    </span>

                    <input
                      id="admin-password"
                      className={cx(
                        "h-12 w-full rounded-2xl border border-white/10 bg-white/8 pl-11 pr-12 text-sm text-white outline-none transition",
                        "placeholder:text-white/35",
                        "focus:border-[#d97c98]/40 focus:bg-white/10 focus:ring-2 focus:ring-[#d97c98]/20"
                      )}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-white/65 transition hover:bg-white/10 hover:text-white"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  disabled={loading}
                  className={cx(
                    "inline-flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold transition",
                    "bg-[#b54b6a] text-white shadow-[0_18px_50px_-25px_rgba(181,75,106,0.75)]",
                    "hover:bg-[#a84260] hover:-translate-y-0.5",
                    "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  )}
                  type="submit"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in to Admin"
                  )}
                </button>
              </form>

              <div className="mt-5 flex items-center justify-between gap-3 text-xs text-white/65">
                <Link className="transition hover:text-white" href="/">
                  ← Back to store
                </Link>

                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-white/75">
                  Secure Access
                </span>
              </div>

              <div className="mt-6 text-center text-[11px] text-white/40">
                © Mea Kréation • Built by{" "}
                <a
                  href="https://mobiz.mu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline decoration-white/25 transition hover:text-[#ffd9e4]"
                >
                  Mobiz.mu
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}