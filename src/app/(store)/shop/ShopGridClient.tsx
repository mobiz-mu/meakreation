"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

type Product = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  base_price_mur: number;
  compare_at_price_mur: number | null;
  is_active: boolean;
  category_id: string | null;
  created_at?: string;
};

type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  alt: string | null;
  is_primary: boolean;
  sort_order: number;
};

type Category = {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
};

function fmtMUR(n?: number) {
  const x = Number.isFinite(Number(n)) ? Number(n) : 0;
  return `Rs ${x.toLocaleString("en-MU")}`;
}

export default function ShopGridClient() {
  const sp = useSearchParams();
  const catSlug = (sp.get("cat") || "").trim();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<Record<string, ProductImage | null>>({});

  // Resolve category slug -> category_id (optional)
  async function resolveCategoryId(slug: string) {
    if (!slug) return null;

    const { data: cat, error } = await supabase
      .from("categories")
      .select("id,slug,is_active")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) return null;
    return cat?.id ?? null;
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      setErr(null);
      setLoading(true);

      try {
        const categoryId = await resolveCategoryId(catSlug);

        // Products
        let q = supabase
          .from("products")
          .select("id,title,slug,short_description,base_price_mur,compare_at_price_mur,is_active,category_id,created_at")
          .eq("is_active", true);

        if (categoryId) q = q.eq("category_id", categoryId);

        const { data: prods, error: pErr } = await q.order("created_at", { ascending: false }).limit(60);
        if (pErr) throw pErr;

        const list = (prods ?? []) as Product[];

        // Primary images for these products (1 per product)
        const ids = list.map((p) => p.id);
        let imgMap: Record<string, ProductImage | null> = {};
        if (ids.length) {
          const { data: imgs, error: iErr } = await supabase
            .from("product_images")
            .select("id,product_id,image_url,alt,is_primary,sort_order")
            .in("product_id", ids);

          if (!iErr && imgs?.length) {
            // choose best image per product: is_primary desc, sort_order asc
            const byProduct: Record<string, ProductImage[]> = {};
            for (const im of imgs as any[]) {
              byProduct[im.product_id] = byProduct[im.product_id] || [];
              byProduct[im.product_id].push(im);
            }
            for (const pid of Object.keys(byProduct)) {
              const sorted = byProduct[pid].sort(
                (a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.sort_order ?? 0) - (b.sort_order ?? 0)
              );
              imgMap[pid] = sorted[0] ?? null;
            }
          }
        }

        if (!alive) return;
        setProducts(list);
        setImages(imgMap);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load products");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [catSlug]);

  const emptyMsg = useMemo(() => {
    if (!catSlug) return "No products yet.";
    return "No products in this category yet.";
  }, [catSlug]);

  if (loading) {
    return (
      <div className="py-10 text-sm text-muted-foreground flex items-center">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading products…
      </div>
    );
  }

  if (err) {
    return <div className="py-10 text-sm text-red-600">{err}</div>;
  }

  if (!products.length) {
    return <div className="py-10 text-sm text-muted-foreground">{emptyMsg}</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p) => {
        const im = images[p.id] || null;
        const price = p.base_price_mur;
        const compareAt = p.compare_at_price_mur;

        return (
          <Link
            key={p.id}
            href={`/shop/${p.slug}`}
            className="group border rounded-2xl p-4 hover:shadow-lg transition bg-white"
          >
            <div className="relative aspect-square bg-muted rounded-xl mb-4 overflow-hidden">
              {im?.image_url ? (
                <Image
                  src={im.image_url}
                  alt={im.alt || p.title}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              ) : null}
            </div>

            <div className="font-medium group-hover:text-[hsl(var(--brand-pink-dark))] line-clamp-1">
              {p.title}
            </div>

            <div className="mt-1 flex items-end gap-2">
              <div className="text-sm font-semibold">{fmtMUR(price)}</div>
              {compareAt && compareAt > price ? (
                <div className="text-xs text-muted-foreground line-through">{fmtMUR(compareAt)}</div>
              ) : null}
            </div>

            {p.short_description ? (
              <div className="mt-2 text-xs text-muted-foreground line-clamp-2">{p.short_description}</div>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}