import Link from "next/link";

export default function BlogPostNotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="rounded-[28px] border border-neutral-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.22em] text-neutral-500">
          Mea Kréation Journal
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950">
          Article Not Found
        </h1>
        <p className="mt-4 text-neutral-600 leading-7">
          This blog article may not exist yet, may still be a draft, or the link
          may be incorrect.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm font-medium text-neutral-900 shadow-sm transition hover:bg-neutral-50"
          >
            Back to Blog
          </Link>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-900"
          >
            Visit Shop
          </Link>
        </div>
      </div>
    </main>
  );
}