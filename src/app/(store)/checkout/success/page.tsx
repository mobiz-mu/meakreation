import Link from "next/link";

type Props = {
  searchParams: Promise<{ orderNo?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const sp = await searchParams;
  const orderNo = sp.orderNo || "";

  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-neutral-200 bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm uppercase tracking-[0.22em] text-neutral-500">
          Order Confirmed
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900">
          Thank you for your order
        </h1>

        <p className="mt-4 text-neutral-600 leading-7">
          Your order has been received successfully.
          {orderNo ? (
            <>
              {" "}Your order number is{" "}
              <span className="font-semibold text-neutral-900">{orderNo}</span>.
            </>
          ) : null}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-[#6f4a3f] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5f3f36]"
          >
            Continue Shopping
          </Link>

          <Link
            href="/contact"
            className="rounded-full border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-50"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}