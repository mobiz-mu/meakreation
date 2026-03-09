"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Upload, Image as ImageIcon } from "lucide-react";

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  cta_text: string | null;
  cta_href: string | null;
  image_url: string;
  mobile_image_url: string | null;
  is_active: boolean;
  sort_order: number;
};

const RECOMMENDED = {
  desktop: "2000 × 900 px",
  mobile: "1080 × 1350 px",
  maxMB: 3,
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaText, setCtaText] = useState("Shop Now");
  const [ctaHref, setCtaHref] = useState("/shop");
  const [desktopImage, setDesktopImage] = useState("");
  const [mobileImage, setMobileImage] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const desktopRef = useRef<HTMLInputElement | null>(null);
  const mobileRef = useRef<HTMLInputElement | null>(null);

  async function adminToken() {
    const sess = await supabase.auth.getSession();
    const token = sess.data.session?.access_token;
    if (!token) throw new Error("Not logged in");
    return token;
  }

  async function load() {
    setLoading(true);
    setErr(null);

    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      setErr(error.message);
      setBanners([]);
    } else {
      setBanners((data as Banner[]) || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function validateImageFile(file: File) {
    const maxBytes = RECOMMENDED.maxMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File too large. Recommended max is ${RECOMMENDED.maxMB}MB.`;
    }
    if (!file.type.startsWith("image/")) {
      return "Invalid file type. Please upload an image.";
    }
    return null;
  }

  async function uploadBannerImage(file: File, kind: "desktop" | "mobile") {
    const v = validateImageFile(file);
    if (v) throw new Error(v);

    const ext = file.name.split(".").pop() || "jpg";
    const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `hero-banners/${kind}/${crypto.randomUUID()}.${safeExt}`;

    const { error: upErr } = await supabase.storage.from("banners").upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type || undefined,
    });

    if (upErr) throw upErr;

    const { data: pub } = supabase.storage.from("banners").getPublicUrl(path);
    return pub.publicUrl;
  }

  async function createBanner() {
    if (!title.trim() || !desktopImage.trim()) {
      setErr("Title and desktop banner image are required.");
      return;
    }

    setCreating(true);
    setErr(null);

    try {
      const token = await adminToken();
      const res = await fetch("/api/admin/hero-banners/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || null,
          cta_text: ctaText.trim() || "Shop Now",
          cta_href: ctaHref.trim() || "/shop",
          image_url: desktopImage.trim(),
          mobile_image_url: mobileImage.trim() || null,
          is_active: true,
          sort_order: sortOrder,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to create banner");

      setTitle("");
      setSubtitle("");
      setCtaText("Shop Now");
      setCtaHref("/shop");
      setDesktopImage("");
      setMobileImage("");
      setSortOrder(0);

      await load();
    } catch (e: any) {
      setErr(e?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function deleteBanner(id: string) {
    try {
      const token = await adminToken();
      const res = await fetch("/api/admin/hero-banners/delete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Delete failed");

      await load();
    } catch (e: any) {
      setErr(e?.message || "Delete failed");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-black">Hero Banners</h1>
        <p className="mt-2 text-sm text-black/60">
          Desktop recommended: <strong>{RECOMMENDED.desktop}</strong> • Mobile recommended:{" "}
          <strong>{RECOMMENDED.mobile}</strong> • Max: <strong>{RECOMMENDED.maxMB}MB</strong>
        </p>
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      ) : null}

      <Card className="rounded-[26px] border-black/10 bg-white">
        <CardHeader>
          <CardTitle className="text-base text-black">Add New Hero Banner</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Banner title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 rounded-2xl border-black/10"
            />
            <Input
              placeholder="Subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="h-11 rounded-2xl border-black/10"
            />
            <Input
              placeholder="CTA text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              className="h-11 rounded-2xl border-black/10"
            />
            <Input
              placeholder="CTA href (e.g. /shop)"
              value={ctaHref}
              onChange={(e) => setCtaHref(e.target.value)}
              className="h-11 rounded-2xl border-black/10"
            />
            <Input
              type="number"
              placeholder="Sort order"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="h-11 rounded-2xl border-black/10"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-black/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-black">Desktop Banner</div>
                  <div className="text-xs text-black/55">{RECOMMENDED.desktop}</div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-black/10"
                  onClick={() => desktopRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
                <input
                  ref={desktopRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const url = await uploadBannerImage(file, "desktop");
                      setDesktopImage(url);
                    } catch (ex: any) {
                      setErr(ex?.message || "Upload failed");
                    } finally {
                      e.target.value = "";
                    }
                  }}
                />
              </div>

              <Input
                placeholder="Desktop image URL"
                value={desktopImage}
                onChange={(e) => setDesktopImage(e.target.value)}
                className="mt-4 h-11 rounded-2xl border-black/10"
              />
            </div>

            <div className="rounded-2xl border border-black/10 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-black">Mobile Banner</div>
                  <div className="text-xs text-black/55">{RECOMMENDED.mobile}</div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-black/10"
                  onClick={() => mobileRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
                <input
                  ref={mobileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const url = await uploadBannerImage(file, "mobile");
                      setMobileImage(url);
                    } catch (ex: any) {
                      setErr(ex?.message || "Upload failed");
                    } finally {
                      e.target.value = "";
                    }
                  }}
                />
              </div>

              <Input
                placeholder="Mobile image URL"
                value={mobileImage}
                onChange={(e) => setMobileImage(e.target.value)}
                className="mt-4 h-11 rounded-2xl border-black/10"
              />
            </div>
          </div>

          <Button
            onClick={createBanner}
            className="rounded-2xl bg-black text-white hover:bg-black/90"
            disabled={creating}
          >
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
            {creating ? "Creating..." : "Add Banner"}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {banners.map((b) => (
            <Card key={b.id} className="rounded-[26px] border-black/10 bg-white">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-medium text-black">{b.title}</div>
                    <div className="mt-1 text-xs text-black/55 break-all">
                      {b.image_url}
                    </div>
                    {b.mobile_image_url ? (
                      <div className="mt-1 text-xs text-black/45 break-all">
                        Mobile: {b.mobile_image_url}
                      </div>
                    ) : null}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-2xl border-black/10"
                    onClick={() => deleteBanner(b.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-black/[0.03]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={b.image_url}
                    alt={b.title}
                    className="h-[180px] w-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}