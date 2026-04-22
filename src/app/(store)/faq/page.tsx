export default function FAQPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-neutral-500">
            Mea Kréation
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            FAQ
          </h1>

          <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
            Find answers to the most common questions about orders, delivery,
            handmade products, and customer support.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Do you deliver internationally?
            </h2>
            <p className="mt-2 text-sm leading-7 text-neutral-600 sm:text-base">
              No. Mea Kréation currently delivers within Mauritius only.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              How long does delivery take?
            </h2>
            <p className="mt-2 text-sm leading-7 text-neutral-600 sm:text-base">
              Delivery usually takes 1 to 4 business days after dispatch within Mauritius.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Are your products handmade?
            </h2>
            <p className="mt-2 text-sm leading-7 text-neutral-600 sm:text-base">
              Yes. Mea Kréation focuses on handmade and carefully crafted pieces,
              which may naturally include slight variations that make each item unique.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Can I return or exchange an item?
            </h2>
            <p className="mt-2 text-sm leading-7 text-neutral-600 sm:text-base">
              Returns and exchanges are reviewed on a case-by-case basis, especially
              if the item received is damaged, incorrect, or defective.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              Do you accept custom orders?
            </h2>
            <p className="mt-2 text-sm leading-7 text-neutral-600 sm:text-base">
              Custom order availability depends on the product and current workload.
              Please contact Mea Kréation directly to discuss your request.
            </p>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">
              How can I contact you?
            </h2>
            <p className="mt-2 text-sm leading-7 text-neutral-600 sm:text-base">
              You can contact Mea Kréation through the contact page, social media,
              or the communication details shared on the website.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}