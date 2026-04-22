export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-neutral-500">
            Mea Kréation
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
            Your privacy matters to us. This Privacy Policy explains how we collect,
            use, and protect your personal information when you visit our website,
            place an order, or contact us.
          </p>
        </div>

        <div className="mt-10 space-y-8 text-sm leading-7 text-neutral-700 sm:text-base">
          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Information We Collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Delivery address</li>
              <li>Order information</li>
              <li>Messages you send to us</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">How We Use Your Information</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>To process and deliver your orders</li>
              <li>To communicate with you about your order</li>
              <li>To provide customer support</li>
              <li>To improve our products and website experience</li>
              <li>To comply with legal and operational obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Payment Information</h2>
            <p className="mt-3">
              Payments are handled through secure third-party payment providers.
              Mea Kréation does not store full card or highly sensitive payment data
              on its own systems unless clearly stated otherwise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Sharing of Information</h2>
            <p className="mt-3">
              We do not sell your personal information. We may share limited information
              only when necessary for payment processing, delivery, order fulfillment,
              website operation, or legal compliance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-neutral-900">Data Protection</h2>
            <p className="mt-3">
              We take reasonable steps to protect your information from unauthorized access,
              misuse, loss, or disclosure. However, no system can guarantee absolute security.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}