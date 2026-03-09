import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Product not found</h1>
      <p className="mt-3 text-neutral-600">
        The product you are looking for does not exist or is no longer available.
      </p>
      <Link
        href="/shop"
        className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-medium text-white"
      >
        Continue shopping
      </Link>
    </main>
  );
}