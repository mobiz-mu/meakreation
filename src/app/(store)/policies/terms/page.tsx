export default function TermsConditionsPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-neutral-500">
            Mea Kréation
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Terms & Conditions
          </h1>

          <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
            By accessing our website, placing an order, or using our services,
            you agree to the following Terms & Conditions.
          </p>
        </div>

        <div className="mt-10 space-y-8 text-sm leading-7 text-neutral-700 sm:text-base">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900">General</h2>
            <p className="mt-3">
              Mea Kréation offers handmade and curated products designed with care
              and creativity. We reserve the right to update, modify, or remove
              products, pricing, content, or policies at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Products</h2>
            <p className="mt-3">
              We make every effort to present our products as accurately as possible.
              However, colors may vary slightly depending on screen settings and handmade
              items may include small natural variations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Pricing</h2>
            <p className="mt-3">
              All prices displayed are subject to change without notice. We reserve the
              right to correct pricing errors, product descriptions, or availability issues.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Orders</h2>
            <p className="mt-3">
              We reserve the right to accept, refuse, or cancel any order where necessary,
              including cases involving pricing errors, suspected fraud, unavailable stock,
              or incomplete order information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Shipping</h2>
            <p className="mt-3">
              Shipping is currently available in <strong>Mauritius only</strong>.
              Delivery times are estimates and may be affected by circumstances beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Intellectual Property</h2>
            <p className="mt-3">
              All content on this website, including text, branding, images, product designs,
              and visual elements, remains the property of Mea Kréation unless otherwise stated.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}