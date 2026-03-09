import Link from "next/link";
import Image from "next/image";
import type { ProductWithRelations } from "@/lib/products";
import { getLowestPrice, getPrimaryImage } from "@/lib/products";

type Props = {
  items: ProductWithRelations[];
};

export default function RelatedProducts({ items }: Props) {
  if (!items.length) return null;

  return (
    <section className="mt-20">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.22em] text-neutral-500">
          You may also like
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Related Products
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((item) => {
          const image = getPrimaryImage(item);

          return (
            <Link
              key={item.id}
              href={`/product/${item.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-neutral-100">
                {image ? (
                  <Image
                    src={image}
                    alt={item.title}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                    No image
                  </div>
                )}
              </div>

              <div className="pt-3">
                <h3 className="line-clamp-1 text-sm font-medium text-neutral-900">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-600">
                  Rs {Number(getLowestPrice(item)).toLocaleString()}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}