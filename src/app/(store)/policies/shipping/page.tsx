export default function ShippingPolicyPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-neutral-500">
            Mea Kréation
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Shipping Policy
          </h1>

          <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
            At Mea Kréation, every piece is prepared with care and attention.
            Our goal is to ensure your order arrives safely, beautifully packed,
            and in excellent condition.
          </p>
        </div>

        <div className="mt-10 space-y-8 text-sm leading-7 text-neutral-700 sm:text-base">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Order Processing</h2>
            <p className="mt-3">
              All orders are processed after payment confirmation. Because many of our
              pieces are handmade or prepared in limited quantities, processing times
              may vary depending on product availability and order volume.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Ready items: usually processed within 1 to 5 business days</li>
              <li>Made-to-order or limited handmade pieces may require additional preparation time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Shipping Area</h2>
            <p className="mt-3">
              Mea Kréation currently delivers <strong>within Mauritius only</strong>.
              We do not offer international shipping at this time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Delivery Time</h2>
            <p className="mt-3">
              Estimated delivery times begin after your order has been processed.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Mauritius: usually 1 to 4 business days after dispatch</li>
              <li>Delivery times may vary during peak periods, holidays, or courier delays</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Shipping Fees</h2>
            <p className="mt-3">
              Shipping fees are calculated at checkout or confirmed before dispatch,
              depending on the delivery method selected.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Incorrect Address</h2>
            <p className="mt-3">
              Please ensure your delivery details are accurate before completing your order.
              Mea Kréation cannot be held responsible for delays or losses caused by
              incorrect or incomplete delivery information provided by the customer.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Damaged Parcel</h2>
            <p className="mt-3">
              If your parcel arrives visibly damaged, please contact us as soon as possible
              with your order number and clear photos of both the package and the item received.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}