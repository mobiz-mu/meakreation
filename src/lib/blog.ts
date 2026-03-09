import { supabaseServer } from "@/lib/supabase/server-public";

export type BlogPostCard = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
  seo_title: string | null;
  seo_description: string | null;
};

export type BlogPostFull = BlogPostCard & {
  content_md: string;
};

export async function getPublishedBlogPosts(limit = 24): Promise<BlogPostCard[]> {
  const { data, error } = await supabaseServer
    .from("blog_posts")
    .select(`
      id,
      title,
      slug,
      excerpt,
      cover_image_url,
      published_at,
      created_at,
      seo_title,
      seo_description
    `)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getPublishedBlogPosts error:", error);
    return [];
  }

  return (data as BlogPostCard[]) ?? [];
}

export async function getPublishedBlogPostBySlug(
  slug: string
): Promise<BlogPostFull | null> {
  const { data, error } = await supabaseServer
    .from("blog_posts")
    .select(`
      id,
      title,
      slug,
      excerpt,
      content_md,
      cover_image_url,
      published_at,
      created_at,
      seo_title,
      seo_description
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("getPublishedBlogPostBySlug error:", error);
    return null;
  }

  return (data as BlogPostFull | null) ?? null;
}