import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedBlogPostBySlug } from "@/lib/blog";

type Props = {
  params: Promise<{ slug: string }>;
};

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Article not found | Mea Kréation",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${post.seo_title || post.title} | Mea Kréation`,
    description:
      post.seo_description ||
      post.excerpt ||
      "Read the latest stories from Mea Kréation.",
    openGraph: {
      title: `${post.seo_title || post.title} | Mea Kréation`,
      description:
        post.seo_description ||
        post.excerpt ||
        "Read the latest stories from Mea Kréation.",
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);

  if (!post) notFound();

  const date = formatDate(post.published_at || post.created_at);

  return (
    <main className="relative overflow-hidden bg-[#fffdfb]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-14 h-28 w-28 rounded-full bg-[hsl(var(--brand-pink-light))]/18 blur-3xl" />
        <div className="absolute right-[8%] top-24 h-36 w-36 rounded-full bg-[#f2ddd0]/25 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <article className="overflow-hidden rounded-[30px] border border-neutral-200/80 bg-white shadow-[0_18px_70px_rgba(17,17,17,0.06)]">
          <div className="px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-[hsl(var(--brand-pink-dark))]"
            >
              <span>←</span>
              Back to Blog
            </Link>

            {date ? (
              <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-neutral-500">
                {date}
              </p>
            ) : null}

            <h1 className="mt-3 max-w-4xl text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl md:text-5xl">
              {post.title}
            </h1>

            {post.excerpt ? (
              <p className="mt-5 max-w-3xl text-base leading-8 text-neutral-600">
                {post.excerpt}
              </p>
            ) : null}
          </div>

          {post.cover_image_url ? (
            <div className="px-4 pb-4 sm:px-6 lg:px-8">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[26px] bg-neutral-100">
                <Image
                  src={post.cover_image_url}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          ) : null}

          <div className="px-6 pb-8 pt-4 sm:px-8 lg:px-10 lg:pb-10">
            <div className="mx-auto max-w-3xl">
              <div className="prose prose-neutral max-w-none prose-headings:font-semibold prose-p:text-neutral-700 prose-p:leading-8 prose-li:text-neutral-700 prose-li:leading-8">
                <div className="whitespace-pre-wrap text-[15px] leading-8 text-neutral-700 md:text-[16px]">
                  {post.content_md}
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}