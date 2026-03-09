import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Mea Kréation",
  description: "Frequently asked questions about Mea Kréation.",
};

export default function FAQPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">FAQ</h1>
      <p className="mt-4 text-neutral-600">Common questions and answers will appear here.</p>
    </main>
  );
}