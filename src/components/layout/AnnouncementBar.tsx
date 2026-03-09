"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "✨ Big Sales • Promotions • Limited Offers ✨",
  "🚚 Home Delivery Available Across Mauritius",
  "📦 Postage Available Islandwide • Shop with Confidence",
];

export default function AnnouncementBar() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(true);

      setTimeout(() => {
        setIdx((i) => (i + 1) % MESSAGES.length);
        setFade(false);
      }, 250);
    }, 8000);

    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative z-[60] w-full bg-[hsl(var(--brand-brown-dark))] text-white">
      <div className="px-4 py-2 md:px-6 md:py-2">
        <p
          className={[
            "text-center text-[11px] font-medium tracking-[0.16em] md:text-sm",
            "transition-opacity duration-300",
            fade ? "opacity-0" : "opacity-100",
          ].join(" ")}
        >
          {MESSAGES[idx]}
        </p>
      </div>
    </div>
  );
}