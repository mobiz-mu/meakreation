"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OrderStatusPayload = {
  order_no: string;
  status: string;
  payment_status: string;
  total_mur: number;
  paid_at: string | null;
  created_at: string;
};

function mur(n?: number) {
  const x = Number.isFinite(Number(n)) ? Number(n) : 0;
  return `Rs ${x.toLocaleString("en-MU")}`;
}

function paymentMessage(paymentStatus: string, status: string) {
  const ps = String(paymentStatus || "").toUpperCase();
  const st = String(status || "").toUpperCase();

  if (ps === "PAID") {
    return {
      title: "Payment Confirmed",
      text: "Your payment has been received successfully. Your order is now being prepared.",
    };
  }

  if (ps === "AWAITING_CONFIRMATION") {
    return {
      title: "Payment Awaiting Confirmation",
      text: "Your order has been received. We will review and confirm your manual payment shortly.",
    };
  }

  if (ps === "PENDING" && st === "PENDING") {
    return {
      title: "Order Received",
      text: "Your order has been placed successfully and is now awaiting the next processing step.",
    };
  }

  if (ps === "FAILED") {
    return {
      title: "Payment Failed",
      text: "We received your order attempt, but the payment was not completed successfully.",
    };
  }

  return {
    title: "Order Received",
    text: "Your order has been received successfully.",
  };
}

export default function CheckoutSuccessClient({
  orderNo,
  publicToken,
}: {
  orderNo: string;
  publicToken: string;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderStatusPayload | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const qs = new URLSearchParams();

        if (publicToken) {
          qs.set("publicToken", publicToken);
        } else if (orderNo) {
          qs.set("orderNo", orderNo);
        } else {
          if (!active) return;
          setError(
            "Your order reference is missing. Please use the confirmation link from your checkout flow."
          );
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/orders/status-by-token?${qs.toString()}`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const text = await res.text();
        let json: any = null;

        try {
          json = text ? JSON.parse(text) : null;
        } catch {
          throw new Error(text || "Invalid response from order status endpoint.");
        }

        if (!res.ok) {
          throw new Error(json?.error || "Unable to verify order.");
        }

        if (!active) return;
        setOrder(json as OrderStatusPayload);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Unable to load order.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [orderNo, publicToken]);

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="rounded-[32px] border border-[#ead7de] bg-white p-10 text-center shadow-[0_24px_70px_-55px_rgba(80,40,50,0.22)]">
          <div className="text-sm text-[#6f5a60]">
            Loading your order confirmation…
          </div>
        </div>
      </section>
    );
  }

  if (error || !order) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="rounded-[32px] border border-[#ead7de] bg-white p-10 text-center shadow-[0_24px_70px_-55px_rgba(80,40,50,0.22)]">
          <h1 className="text-3xl font-semibold tracking-tight text-[#3f272d]">
            Order Confirmation
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#6f5a60]">
            {error || "We could not load your order details right now."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-[#8f4f63] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Continue Shopping
            </Link>

            <Link
              href="/contact"
              className="rounded-full border border-[#d9c2ca] bg-white px-6 py-3 text-sm font-medium text-[#4b2e26] transition hover:bg-[#fff3f7]"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const msg = paymentMessage(order.payment_status, order.status);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[32px] border border-[#ead7de] bg-white p-8 shadow-[0_24px_70px_-55px_rgba(80,40,50,0.22)]">
          <p className="text-[10px] font-medium uppercase tracking-[0.30em] text-[#9b6b79] sm:text-[11px]">
            Thank You
          </p>

          <h1 className="mt-2 text-[2rem] font-semibold tracking-tight text-[#3f272d] sm:text-[2.5rem]">
            {msg.title}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6f5a60] sm:text-[15px]">
            {msg.text}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-[#ead7de] bg-[#fff8fa] p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#9b6b79]">
                Order Number
              </div>
              <div className="mt-2 text-lg font-semibold text-[#3f272d]">
                {order.order_no}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#ead7de] bg-[#fffdfd] p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#9b6b79]">
                Total
              </div>
              <div className="mt-2 text-lg font-semibold text-[#3f272d]">
                {mur(order.total_mur)}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#ead7de] bg-[#fffdfd] p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#9b6b79]">
                Order Status
              </div>
              <div className="mt-2 text-lg font-semibold text-[#3f272d]">
                {order.status}
              </div>
            </div>

            <div className="rounded-[24px] border border-[#ead7de] bg-[#fff8fa] p-5">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#9b6b79]">
                Payment Status
              </div>
              <div className="mt-2 text-lg font-semibold text-[#3f272d]">
                {order.payment_status}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="rounded-full bg-[#8f4f63] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Continue Shopping
            </Link>

            <Link
              href="/contact"
              className="rounded-full border border-[#d9c2ca] bg-white px-6 py-3 text-sm font-medium text-[#4b2e26] transition hover:bg-[#fff3f7]"
            >
              Need Help?
            </Link>
          </div>
        </div>

        <aside className="rounded-[32px] border border-[#ead7de] bg-white p-8 shadow-[0_24px_70px_-55px_rgba(80,40,50,0.22)]">
          <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#9b6b79]">
            What Happens Next
          </p>

          <div className="mt-5 space-y-4 text-sm leading-7 text-[#6f5a60]">
            {String(order.payment_status).toUpperCase() === "PAID" ? (
              <>
                <p>Your payment is confirmed and your order is now being prepared.</p>
                <p>We will contact you if any additional delivery details are needed.</p>
              </>
            ) : String(order.payment_status).toUpperCase() ===
              "AWAITING_CONFIRMATION" ? (
              <>
                <p>Your order has been received successfully.</p>
                <p>
                  Our team will review your manual payment and confirm the order
                  once verification is complete.
                </p>
              </>
            ) : (
              <>
                <p>Your order has been placed successfully.</p>
                <p>
                  Our team will process your order and contact you if needed
                  regarding payment or delivery.
                </p>
              </>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}