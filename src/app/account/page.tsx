import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | Mea Kréation",
  description: "Manage your Mea Kréation account.",
};

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">My Account</h1>
      <p className="mt-4 text-neutral-600">Your account dashboard will appear here.</p>
    </main>
  );
}