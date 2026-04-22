import type { Metadata } from "next";

import HeroSection from "@/components/home/HeroSection";
import SmallBannerSection from "@/components/home/SmallBannerSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import BestSellersSection from "@/components/home/BestSellersSection";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";
import MoreToExploreSection from "@/components/home/MoreToExploreSection";
import AboutSection from "@/components/home/AboutSection";
import BlogSection from "@/components/home/BlogSection";
import ContactSection from "@/components/home/ContactSection";
import ReviewsMarquee from "@/components/home/ReviewsMarquee";
import {
  getBestSellerProductsForHome,
  getNewArrivalProducts,
} from "@/lib/products";

export const metadata: Metadata = {
  title: "Mea Kréation | Handmade Fashion in Mauritius",
  description:
    "Discover handmade turbans, outfits, bags & accessories crafted with love in Mauritius. Premium feminine pieces for everyday queens.",
  openGraph: {
    title: "Mea Kréation",
    description: "Premium handmade pieces crafted with love in Mauritius.",
    type: "website",
  },
};

export default async function HomePage() {
  const bestSellerProducts = await getBestSellerProductsForHome(10);
  const newArrivalProducts = await getNewArrivalProducts(8);

  const excludeIds = [
    ...bestSellerProducts.map((p) => p.id),
    ...newArrivalProducts.map((p) => p.id),
  ];

  return (
    <>
      <HeroSection />
      <SmallBannerSection />
      <CategoriesSection />

      <BestSellersSection products={bestSellerProducts} />

      <NewArrivalsSection products={newArrivalProducts} />

      <MoreToExploreSection excludeIds={excludeIds} />

      <AboutSection />
      <BlogSection />
      <ContactSection />
      <ReviewsMarquee />
    </>
  );
}