export default function ReturnsExchangePage() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-neutral-500">
            Mea Kréation
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Returns & Exchange
          </h1>

          <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
            We take pride in the quality, care, and handmade nature of our creations.
            If there is a genuine issue with your order, we are here to help.
          </p>
        </div>

        <div className="mt-10 space-y-8 text-sm leading-7 text-neutral-700 sm:text-base">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900">General Policy</h2>
            <p className="mt-3">
              Due to the handmade, limited, and sometimes made-to-order nature of our products,
              returns and exchanges are not automatically accepted for all items.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Eligible Cases</h2>
            <p className="mt-3">You may contact us if:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>You received the wrong item</li>
              <li>The item arrived damaged</li>
              <li>The item has a clear manufacturing defect</li>
              <li>Your order is incomplete</li>
            </ul>
            <p className="mt-3">
              Requests must be made within <strong>48 hours of delivery</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Conditions for Review</h2>
            <p className="mt-3">To review a request, the item must:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Be unused</li>
              <li>Be in its original condition</li>
              <li>Be returned with original packaging where possible</li>
              <li>Be accompanied by clear photos and order details</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Non-Returnable Items</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Customized or personalized items</li>
              <li>Made-to-order pieces</li>
              <li>Sale or clearance items</li>
              <li>Items damaged through misuse, improper care, or wear after delivery</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Refunds & Exchanges</h2>
            <p className="mt-3">
              Refunds or exchanges are only considered where a return has been approved and inspected.
              If a replacement is unavailable, we may offer store credit or another suitable solution.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}