import type { ProductWithRelations } from "@/lib/products";
import BestSellersGrid from "@/components/home/BestSellersGrid";

type Props = {
  products: ProductWithRelations[];
};

export default async function BestSellersSection({ products }: Props) {
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#9b6b79]">
          Curated Picks
        </p>

        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#3f272d] sm:text-4xl">
          Best Sellers
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f5a60] sm:text-base">
          Explore the most loved handmade pieces from Mea Kréation — refined
          favourites chosen for their beauty, elegance, and timeless appeal.
        </p>
      </div>

      <BestSellersGrid products={products} />
    </section>
  );
}