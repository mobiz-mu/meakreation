import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Mea Kréation",
  description: "Learn more about Mea Kréation, our handmade creations, and our story from Mauritius.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">About Us</h1>
      <p className="mt-4 max-w-3xl text-neutral-600 leading-7">
        Mea Kréation creates premium handmade pieces crafted with love in Mauritius.
        Our collections celebrate femininity, elegance, and artisanal quality.
      </p>
    </main>
  );
}