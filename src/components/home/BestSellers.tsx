export default function BestSellers() {
  return (
    <section className="pt-16">
      <div className="flex items-center justify-between">
        <h3 className="text-lg md:text-xl tracking-wide">BEST SELLERS</h3>
        <a href="/shop" className="text-xs text-[hsl(var(--brand-brown-dark))] hover:underline">
          VIEW ALL
        </a>
      </div>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border rounded-2xl overflow-hidden bg-white hover:shadow-sm transition">
            <div className="h-56 bg-muted" />
            <div className="p-4">
              <div className="text-sm font-medium">Product Name</div>
              <div className="text-xs text-muted-foreground mt-1">Rs 0</div>
              <button className="mt-3 w-full rounded-xl py-2 text-xs text-white bg-[hsl(var(--brand-brown-dark))] hover:opacity-90 transition">
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}