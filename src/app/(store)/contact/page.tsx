import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Mea Kréation",
  description: "Get in touch with Mea Kréation for orders, questions, and support.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Contact Us</h1>

      <div className="mt-8 space-y-4 text-neutral-700">
        <p><strong>Phone:</strong> +230 5911 7549</p>
        <p><strong>WhatsApp:</strong> +230 5911 7549</p>
        <p><strong>Email:</strong> meakreation23@gmail.com</p>
      </div>
    </main>
  );
}