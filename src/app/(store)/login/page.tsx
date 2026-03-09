import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Mea Kréation",
  description: "Login to your Mea Kréation account.",
};

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Login</h1>
      <p className="mt-4 text-neutral-600">Login form goes here.</p>
    </main>
  );
}