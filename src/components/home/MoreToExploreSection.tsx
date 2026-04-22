import {
  getUnbadgedProducts,
  type ProductWithRelations,
} from "@/lib/products";
import MoreToExploreGrid from "@/components/home/MoreToExploreGrid";

type Props = {
  excludeIds?: string[];
  title?: string;
  subtitle?: string;
};

export default async function MoreToExploreSection({
  excludeIds = [],
  title = "More To Explore",
  subtitle = "Discover more refined handmade pieces, thoughtfully crafted for elegant everyday style and timeless beauty.",
}: Props) {
  const products = await getUnbadgedProducts(excludeIds, 15);

  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mb-6 sm:mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-[#9b6b79]">
          Curated Collection
        </p>

        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#3f272d] sm:text-4xl">
          {title}
        </h2>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6f5a60] sm:text-base">
          {subtitle}
        </p>
      </div>

      <MoreToExploreGrid products={products as ProductWithRelations[]} />
    </section>
  );
}