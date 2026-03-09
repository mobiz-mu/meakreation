import { supabaseServer } from "@/lib/supabase/server-public";
import HeroSlider from "@/components/home/HeroSlider";

type HeroBanner = {
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

export default async function HeroSection() {
  const { data, error } = await supabaseServer
    .from("hero_banners")
    .select(
      `
      id,
      title,
      subtitle,
      cta_text,
      cta_href,
      image_url,
      mobile_image_url,
      is_active,
      sort_order
    `
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("HeroSection load error:", error);
    return null;
  }

  const banners = (data as HeroBanner[]) ?? [];
  if (!banners.length) return null;

  return <HeroSlider banners={banners} />;
}