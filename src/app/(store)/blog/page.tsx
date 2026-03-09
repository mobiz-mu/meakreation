import type { Metadata } from "next";
import BlogCard from "@/components/blog/BlogCard";
import { getPublishedBlogPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog | Mea Kréation",
  description:
    "Read the latest stories, handmade inspiration, styling ideas, and updates from Mea Kréation.",
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts(24);

  return (
    <main className="relative overflow-hidden bg-[#fffdfb]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-16 h-32 w-32 rounded-full bg-[hsl(var(--brand-pink-light))]/18 blur-3xl" />
        <div className="absolute right-[8%] top-24 h-36 w-36 rounded-full bg-[#f2ddd0]/25 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        {/* Luxury Header */}
        <section className="relative overflow-hidden rounded-[30px] border border-neutral-200/80 bg-white px-6 py-8 shadow-[0_18px_60px_rgba(17,17,17,0.05)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full border border-neutral-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-neutral-500 shadow-sm md:text-[11px]">
              Journal
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl md:text-5xl">
              The Mea Kréation Blog
            </h1>

            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-neutral-600 md:text-base md:leading-8">
              Discover handmade inspiration, care tips, style stories, gifting
              ideas, and elegant updates from the world of Mea Kréation —
              crafted for women who love beauty, softness, and timeless detail.
            </p>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="mt-10 md:mt-12">
          {posts.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-[26px] border border-dashed border-neutral-300 bg-white p-10 text-center shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900">
                No blog posts yet
              </h2>
              <p className="mt-2 text-neutral-600 leading-7">
                Published articles will appear here once they are added to your
                blog dashboard.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}