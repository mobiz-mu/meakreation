"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Save, Trash2, FileText, RefreshCw } from "lucide-react";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_md: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type FormState = {
  id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  content_md: string;
  cover_image_url: string;
  is_published: boolean;
  published_at: string;
  seo_title: string;
  seo_description: string;
};

const EMPTY_FORM: FormState = {
  id: null,
  title: "",
  slug: "",
  excerpt: "",
  content_md: "",
  cover_image_url: "",
  is_published: false,
  published_at: "",
  seo_title: "",
  seo_description: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function toDatetimeLocal(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function getErrorMessage(error: unknown) {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;

  if (typeof error === "object") {
    const e = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    return [
      e.message,
      e.details,
      e.hint,
      e.code ? `(code: ${e.code})` : "",
    ]
      .filter(Boolean)
      .join(" | ") || JSON.stringify(error);
  }

  return "Unknown error";
}

function fromDatetimeLocal(value: string) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [message, setMessage] = useState<string>("");

  async function load() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        content_md,
        cover_image_url,
        is_published,
        published_at,
        seo_title,
        seo_description,
        created_at,
        updated_at
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to load blog posts:", error);
      setMessage("Failed to load blog posts.");
      setPosts([]);
      setLoading(false);
      return;
    }

    setPosts((data as BlogPost[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(EMPTY_FORM);
    setMessage("");
  }

  function editPost(post: BlogPost) {
    setForm({
      id: post.id,
      title: post.title || "",
      slug: post.slug || "",
      excerpt: post.excerpt || "",
      content_md: post.content_md || "",
      cover_image_url: post.cover_image_url || "",
      is_published: !!post.is_published,
      published_at: toDatetimeLocal(post.published_at),
      seo_title: post.seo_title || "",
      seo_description: post.seo_description || "",
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const isEditing = useMemo(() => !!form.id, [form.id]);

  async function savePost() {
  if (!form.title.trim()) {
    setMessage("Title is required.");
    return;
  }

  const finalSlug = slugify(form.slug || form.title);

  if (!finalSlug) {
    setMessage("Slug is required.");
    return;
  }

  setSaving(true);
  setMessage("");

  const payload = {
    title: form.title.trim(),
    slug: finalSlug,
    excerpt: form.excerpt.trim() || null,
    content_md: form.content_md || "",
    cover_image_url: form.cover_image_url.trim() || null,
    is_published: form.is_published,
    published_at: form.is_published
      ? fromDatetimeLocal(form.published_at) || new Date().toISOString()
      : null,
    seo_title: form.seo_title.trim() || null,
    seo_description: form.seo_description.trim() || null,
  };

  try {
    let result;

    if (form.id) {
      result = await supabase
        .from("blog_posts")
        .update(payload)
        .eq("id", form.id)
        .select("id")
        .single();
    } else {
      result = await supabase
        .from("blog_posts")
        .insert(payload)
        .select("id")
        .single();
    }

    if (result.error) {
      console.error("Failed to save blog post:", {
        error: result.error,
        payload,
        result,
      });
      setMessage(getErrorMessage(result.error));
      setSaving(false);
      return;
    }

    setMessage(form.id ? "Blog post updated successfully." : "Blog post created successfully.");
    setSaving(false);
    await load();
    resetForm();
  } catch (error) {
    console.error("Unexpected save error:", error);
    setMessage(getErrorMessage(error));
    setSaving(false);
  }
}

  async function deletePost(id: string) {
  const ok = window.confirm("Delete this blog post permanently?");
  if (!ok) return;

  setDeletingId(id);
  setMessage("");

  try {
    const result = await supabase.from("blog_posts").delete().eq("id", id);

    if (result.error) {
      console.error("Failed to delete blog post:", result.error);
      setMessage(getErrorMessage(result.error));
      setDeletingId(null);
      return;
    }

    if (form.id === id) {
      resetForm();
    }

    setDeletingId(null);
    setMessage("Blog post deleted.");
    await load();
  } catch (error) {
    console.error("Unexpected delete error:", error);
    setMessage(getErrorMessage(error));
    setDeletingId(null);
  }
}

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-950">
            Blog Manager
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, publish, and manage Mea Kréation blog articles.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" onClick={load}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button className="rounded-xl" onClick={resetForm}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>

      {message ? (
        <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <Card className="rounded-3xl border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Blog Post" : "Create Blog Post"}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="5 Ways to Style a Turban for Everyday Elegance"
                value={form.title}
                onChange={(e) => {
                  const nextTitle = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    title: nextTitle,
                    slug: prev.id ? prev.slug : slugify(nextTitle),
                  }));
                }}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug</label>
              <Input
                placeholder="style-turban-everyday"
                value={form.slug}
                onChange={(e) => updateField("slug", slugify(e.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            <div className="space-y-2">
              <label className="text-sm font-medium">Excerpt</label>
              <textarea
                className="min-h-[100px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Simple and refined ways to wear your turban from casual mornings to elegant evening moments."
                value={form.excerpt}
                onChange={(e) => updateField("excerpt", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cover Image URL</label>
              <Input
                placeholder="/blog/style-turban-everyday.jpg"
                value={form.cover_image_url}
                onChange={(e) => updateField("cover_image_url", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use local blog images like: <span className="font-medium">/blog/style-turban-everyday.jpg</span>
              </p>
            </div>
          </div>

          {form.cover_image_url ? (
            <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
              <div className="p-4">
                <p className="mb-3 text-sm font-medium text-neutral-700">Image Preview</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.cover_image_url}
                  alt="Blog preview"
                  className="aspect-square w-full max-w-[280px] rounded-2xl object-cover border border-neutral-200"
                />
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">SEO Title</label>
              <Input
                placeholder="5 Ways to Style a Turban for Everyday Elegance | Mea Kréation"
                value={form.seo_title}
                onChange={(e) => updateField("seo_title", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Published At</label>
              <Input
                type="datetime-local"
                value={form.published_at}
                onChange={(e) => updateField("published_at", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            <div className="space-y-2">
              <label className="text-sm font-medium">SEO Description</label>
              <textarea
                className="min-h-[100px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Discover 5 elegant ways to style a handmade turban for everyday wear in Mauritius."
                value={form.seo_description}
                onChange={(e) => updateField("seo_description", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-1">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Article Content</label>
              <textarea
                className="min-h-[420px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm leading-7 outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Paste the full blog article content here..."
                value={form.content_md}
                onChange={(e) => updateField("content_md", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3">
            <label className="inline-flex items-center gap-3 text-sm font-medium text-neutral-800">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => updateField("is_published", e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300"
              />
              Publish this article
            </label>

            {form.is_published ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Published
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                Draft
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="rounded-xl" onClick={savePost} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditing ? "Update Post" : "Create Post"}
            </Button>

            <Button variant="outline" className="rounded-xl" onClick={resetForm}>
              Clear Form
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle>All Blog Posts</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading blog posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-8 text-center text-sm text-muted-foreground">
              No blog posts yet.
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((p) => (
                <Card key={p.id} className="rounded-2xl border-neutral-200 shadow-none">
                  <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-neutral-950">{p.title}</div>
                        {p.is_published ? (
                          <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-medium text-green-700">
                            Published
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                            Draft
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-xs text-muted-foreground">{p.slug}</div>

                      {p.cover_image_url ? (
                        <div className="mt-2 text-xs text-neutral-500 line-clamp-1">
                          {p.cover_image_url}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="rounded-xl"
                        onClick={() => editPost(p)}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Edit
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl"
                        onClick={() => deletePost(p.id)}
                        disabled={deletingId === p.id}
                      >
                        {deletingId === p.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}