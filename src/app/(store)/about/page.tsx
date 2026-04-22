import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | Mea Kréation",
  description:
    "Learn more about Mea Kréation, our handmade creations, our vision, and our story from Mauritius.",
};

export default function AboutPage() {
  return (
    <main className="bg-white">
      <section className="border-b border-black/5 bg-[radial-gradient(circle_at_top,rgba(255,236,242,0.58),rgba(255,255,255,1)_58%)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="max-w-3xl">
            <p className="text-[10px] font-medium uppercase tracking-[0.30em] text-[#9b6b79] sm:text-[11px]">
              Mea Kréation
            </p>

            <h1 className="mt-2 text-[2rem] font-semibold tracking-tight text-[#3f272d] sm:text-[2.5rem] lg:text-[3rem]">
              About Us
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6f5a60] sm:text-[15px]">
              A handmade brand from Mauritius where creativity meets elegance,
              crafted with love, beauty, and attention to detail.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-[#8f4f63] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Explore Our Collection
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-[#d9c2ca] bg-white px-5 py-3 text-sm font-medium text-[#4b2e26] transition hover:bg-[#fff3f7]"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-[#ead7de] bg-white p-6 shadow-[0_24px_70px_-55px_rgba(80,40,50,0.24)] sm:p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#9b6b79]">
              Our Story
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#3f272d] sm:text-3xl">
              Welcome to Mea Kréation — where creativity meets elegance
            </h2>

            <div className="mt-5 space-y-5 text-sm leading-8 text-[#6f5a60] sm:text-[15px]">
              <p>
                Established in <span className="font-semibold text-[#3f272d]">2020</span>,
                Mea Kréation specializes in handmade accessories and personalized
                creations designed with love and attention to detail.
              </p>

              <p>
                From satin scrunchies, elegant pouches, turbans, tote bags, and
                home décor items to unique gift ideas, each product is carefully
                crafted to bring beauty, comfort, and style into everyday life.
              </p>

              <p>
                At Mea Kréation, we believe that handmade products carry a
                special touch that makes every piece unique. Our mission is to
                offer quality, stylish, and affordable creations that reflect
                personality and originality.
              </p>

              <p>
                Whether you are looking for a special gift, a fashionable
                accessory, or custom-made items for personal use, we are here to
                create something beautiful just for you.
              </p>

              <p>
                Since 2020, we have been proudly serving our customers with
                passion, creativity, and dedication.
              </p>

              <p className="font-medium text-[#4b2e26]">
                Thank you for supporting small businesses and choosing handmade
                with love.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border border-[#ead7de] bg-[#fff8fa] p-6 shadow-[0_24px_70px_-55px_rgba(80,40,50,0.18)] sm:p-7">
              <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#9b6b79]">
                Our Mission
              </p>

              <p className="mt-4 text-sm leading-8 text-[#6f5a60] sm:text-[15px]">
                To create handmade pieces that are elegant, practical, and full
                of personality, while offering our customers beauty, quality,
                and originality at an accessible price.
              </p>
            </div>

            <div className="rounded-[32px] border border-[#ead7de] bg-white p-6 shadow-[0_24px_70px_-55px_rgba(80,40,50,0.18)] sm:p-7">
              <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#9b6b79]">
                Our Vision
              </p>

              <p className="mt-4 text-sm leading-8 text-[#6f5a60] sm:text-[15px]">
                To become a trusted and inspiring handmade brand in Mauritius
                and beyond, known for creativity, elegance, and meaningful
                creations that add beauty to everyday life.
              </p>
            </div>

            <div className="rounded-[32px] border border-[#ead7de] bg-white p-6 shadow-[0_24px_70px_-55px_rgba(80,40,50,0.18)] sm:p-7">
              <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#9b6b79]">
                Since
              </p>

              <div className="mt-3 text-4xl font-semibold tracking-tight text-[#3f272d]">
                2020
              </div>

              <p className="mt-3 text-sm leading-7 text-[#6f5a60]">
                Proudly creating handmade accessories and personalized pieces
                with passion and dedication.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 lg:pb-10">
        <div className="rounded-[34px] border border-[#ead7de] bg-white p-6 shadow-[0_24px_70px_-55px_rgba(80,40,50,0.22)] sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#9b6b79]">
              Our Values
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#3f272d] sm:text-3xl">
              The values that shape every creation
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#6f5a60] sm:text-[15px]">
              Every product we create is guided by care, craftsmanship, and a
              desire to bring elegance into everyday life.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[28px] border border-[#ead7de] bg-[#fff8fa] p-5">
              <h3 className="text-lg font-semibold text-[#3f272d]">
                Creativity
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#6f5a60]">
                We believe in original handmade ideas that celebrate beauty,
                style, and individuality.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#ead7de] bg-[#fffdfd] p-5">
              <h3 className="text-lg font-semibold text-[#3f272d]">
                Quality
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#6f5a60]">
                We focus on thoughtful details, careful finishing, and products
                made with pride.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#ead7de] bg-[#fff8fa] p-5">
              <h3 className="text-lg font-semibold text-[#3f272d]">
                Authenticity
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#6f5a60]">
                Handmade creations carry a special soul, making each piece feel
                personal and unique.
              </p>
            </div>

            <div className="rounded-[28px] border border-[#ead7de] bg-[#fffdfd] p-5">
              <h3 className="text-lg font-semibold text-[#3f272d]">
                Care
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#6f5a60]">
                We create with love for our craft and appreciation for every
                customer who supports handmade.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
        <div className="rounded-[34px] border border-[#ead7de] bg-[linear-gradient(135deg,#fff7fa_0%,#ffffff_100%)] p-6 shadow-[0_24px_70px_-55px_rgba(80,40,50,0.22)] sm:p-8 lg:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#9b6b79]">
                Handmade With Love
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#3f272d] sm:text-3xl">
                Thank you for being part of our journey
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#6f5a60] sm:text-[15px]">
                Every order supports a small handmade business built with
                passion, creativity, and dedication. We are grateful to create
                pieces that become part of your everyday life.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-[#8f4f63] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
              >
                Shop Now
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-full border border-[#d9c2ca] bg-white px-5 py-3 text-sm font-medium text-[#4b2e26] transition hover:bg-[#fff3f7]"
              >
                Get In Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}