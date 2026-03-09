import type { Metadata } from "next";

import HeroSection from "@/components/home/HeroSection";
import SmallBannerSection from "@/components/home/SmallBannerSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import BestSellersSection from "@/components/home/BestSellersSection";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";
import AboutSection from "@/components/home/AboutSection";
import BlogSection from "@/components/home/BlogSection";
import ContactSection from "@/components/home/ContactSection";
import ReviewsMarquee from "@/components/home/ReviewsMarquee";

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

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* NEW LUXURY SLIDING SECTION */}
      <SmallBannerSection />

      <CategoriesSection />

      <BestSellersSection />

      <NewArrivalsSection />

      <AboutSection />

      <BlogSection />

      <ContactSection />

      <ReviewsMarquee />
    </>
  );
}