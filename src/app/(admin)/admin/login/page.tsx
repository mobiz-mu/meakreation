import React, { Suspense } from "react";
import LoginClient from "./LoginClient";

export const dynamic = "force-dynamic";

function LoginFallback() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#0f0908] px-4">
      <div className="rounded-[28px] border border-white/10 bg-white/[0.05] px-6 py-4 text-sm text-[#ffd2df]/70 backdrop-blur-xl">
        Loading secure access…
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  );
}