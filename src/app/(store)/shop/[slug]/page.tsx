import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default async function LegacyShopProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/product/${slug}`);
}