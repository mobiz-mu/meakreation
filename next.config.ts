import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  async redirects() {
    return [
      {
        source: "/shop/:slug",
        destination: "/product/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;