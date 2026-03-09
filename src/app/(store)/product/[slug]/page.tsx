import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import RelatedProducts from "@/components/product/RelatedProducts";
import {
  getProductBySlug,
  getPrimaryImage,
  getRelatedProducts,
  getLowestPrice,
  getTotalStock,
} from "@/lib/products";
import { supabaseServer } from "@/lib/supabase/server-public";

export const runtime = "nodejs";

function siteUrl() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(s: string, n = 155) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

function toISO(x: unknown) {
  try {
    const d = x ? new Date(String(x)) : null;
    return d && !isNaN(d.getTime()) ? d.toISOString() : undefined;
  } catch {
    return undefined;
  }
}

async function isDraftModeEnabled() {
  try {
    const { draftMode } = await import("next/headers");
    const dm = await draftMode();
    return dm.isEnabled;
  } catch {
    return false;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!slug?.trim()) return {};

  const SITE = siteUrl();
  const canonical = `${SITE}/product/${encodeURIComponent(slug)}`;

  const { data: product } = await supabaseServer
    .from("products")
    .select(
      `
      id,
      title,
      slug,
      seo_title,
      seo_description,
      short_description,
      description,
      is_active,
      updated_at,
      created_at,
      product_images (
        image_url,
        alt,
        is_primary,
        sort_order
      )
    `
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!product) {
    return {
      title: "Product not found | Mea Kréation",
      alternates: { canonical },
      robots: { index: false, follow: false },
    };
  }

  const draft = await isDraftModeEnabled();
  const active = !!product.is_active;

  const images = Array.isArray(product.product_images) ? product.product_images : [];
  const sortedImages = [...images].sort(
    (a: any, b: any) =>
      (b?.is_primary ? 1 : 0) - (a?.is_primary ? 1 : 0) ||
      (a?.sort_order ?? 0) - (b?.sort_order ?? 0)
  );

  const ogImage = sortedImages[0]?.image_url || undefined;
  const ogAlt = sortedImages[0]?.alt || product.title;

  const title = (product.seo_title || product.title || "Product").trim();
  const descSource =
    product.seo_description ||
    product.short_description ||
    product.description ||
    "Discover handmade creations crafted with love in Mauritius.";

  const description = truncate(stripHtml(descSource), 160);

  const robots =
    active && !draft
      ? { index: true, follow: true }
      : { index: false, follow: false, noarchive: true, nosnippet: true };

  return {
    title: `${title} | Mea Kréation`,
    description,
    alternates: { canonical },
    robots,
    openGraph: {
      type: "website",
      url: canonical,
      siteName: "Mea Kréation",
      title: `${title} | Mea Kréation`,
      description,
      images: ogImage ? [{ url: ogImage, alt: ogAlt }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: `${title} | Mea Kréation`,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!slug?.trim()) notFound();

  const product = await getProductBySlug(slug);

  if (!product || !product.is_active) {
    notFound();
  }

  const related = await getRelatedProducts(product.category_id, product.id);

  const SITE = siteUrl();
  const canonical = `${SITE}/product/${encodeURIComponent(product.slug)}`;
  const primaryImage = getPrimaryImage(product) || undefined;
  const price = getLowestPrice(product);
  const totalStock = getTotalStock(product);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      truncate(stripHtml(product.short_description || product.description || ""), 300) ||
      undefined,
    url: canonical,
    image: primaryImage ? [primaryImage] : undefined,
    offers: {
      "@type": "Offer",
      url: canonical,
      priceCurrency: "MUR",
      price: String(price),
      availability:
        totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    dateCreated: toISO(product.created_at),
    dateModified: toISO(product.updated_at),
  };

  return (
  <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24 lg:pt-10">
    <Script
      id="product-jsonld"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />

    <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.85fr)] lg:gap-12 xl:gap-16">
      <ProductGallery title={product.title} images={product.product_images || []} />
      <ProductInfo product={product} />
    </section>

    <div className="mt-16 lg:mt-24">
      <RelatedProducts items={related} />
    </div>
  </main>
);

}