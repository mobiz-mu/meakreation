import Image from "next/image";
import Link from "next/link";

type BlogCardPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  cover_image_url?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BlogCard({ post }: { post: BlogCardPost }) {
  const date = formatDate(post.published_at || post.created_at);

  return (
    <article className="group overflow-hidden rounded-[26px] border border-neutral-200/80 bg-white shadow-[0_14px_45px_rgba(17,17,17,0.05)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_60px_rgba(17,17,17,0.10)]">
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-neutral-100">
          <Image
            src={post.cover_image_url || "/blog/style-turban-everyday.jpg"}
            alt={post.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.06]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        </div>
      </Link>

      <div className="p-5 md:p-6">
        {date ? (
          <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">
            {date}
          </p>
        ) : null}

        <h2 className="mt-3 text-[19px] font-semibold leading-snug text-neutral-950 line-clamp-2">
          <Link
            href={`/blog/${post.slug}`}
            className="transition hover:text-[hsl(var(--brand-pink-dark))]"
          >
            {post.title}
          </Link>
        </h2>

        {post.excerpt ? (
          <p className="mt-3 text-sm leading-7 text-neutral-600 line-clamp-3">
            {post.excerpt}
          </p>
        ) : null}

        <div className="mt-5">
          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--brand-pink-dark))] transition hover:gap-3"
          >
            Read Full Article <span>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}