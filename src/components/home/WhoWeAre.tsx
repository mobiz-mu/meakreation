export default function WhoWeAre() {
  return (
    <section className="pt-20">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="h-[360px] rounded-2xl bg-muted border" />
        <div>
          <p className="text-sm tracking-widest text-[hsl(var(--brand-brown-dark))]">OUR STORY</p>
          <h3 className="mt-3 text-2xl md:text-3xl">The story behind Atelier de Méa</h3>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Atelier de Méa is a small Mauritian brand born from a simple idea: help everyday queens feel beautiful,
            confident and comfortable in their own style – with handmade turbans, outfits and bags crafted with love in Roche Bois.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Every piece is cut, sewn and finished by hand, in small batches. We focus on soft fabrics, feminine colours and practical designs
            that fit real life – school runs, office days, celebrations and cosy weekends.
          </p>

          <a
            href="/pages/about-us"
            className="inline-flex mt-6 items-center justify-center rounded-xl px-5 py-3 text-white bg-[hsl(var(--brand-pink-dark))] hover:opacity-90 transition"
          >
            Read More
          </a>
        </div>
      </div>
    </section>
  );
}