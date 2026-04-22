"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { mur } from "@/lib/money";
import { useCart } from "@/store/cart";

type ShippingMethod = {
  id: string;
  name: string;
  price_mur: number;
};

type PaymentMethod = "COD" | "JUICE" | "BANK_TRANSFER" | "SPARK";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function CheckoutClient({
  shippingMethods,
}: {
  shippingMethods: ShippingMethod[];
}) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    whatsapp: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    district: "",
    postalCode: "",
    country: "Mauritius",
    notes: "",
    paymentMethod: "COD" as PaymentMethod,
    paymentReference: "",
    shippingMethodId: shippingMethods[0]?.id ?? "",
  });

  const selectedShipping = useMemo(
    () => shippingMethods.find((m) => m.id === form.shippingMethodId) || null,
    [shippingMethods, form.shippingMethodId]
  );

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + Number(item.unitPriceMur ?? 0) * Number(item.qty ?? 1);
    }, 0);
  }, [items]);

  const shipping = Number(selectedShipping?.price_mur ?? 0);
  const total = subtotal + shipping;

  async function readJsonSafe(res: Response) {
  const text = await res.text();

  if (!text) {
    return {
      ok: false,
      status: res.status,
      data: null,
      error: "Empty response from server.",
    };
  }

  try {
    return {
      ok: res.ok,
      status: res.status,
      data: JSON.parse(text),
      error: null,
    };
  } catch {
    return {
      ok: false,
      status: res.status,
      data: null,
      error: `Invalid JSON response from server: ${text.slice(0, 200)}`,
    };
  }
}

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.phone.trim() ||
      !form.email.trim() ||
      !form.addressLine1.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (!form.shippingMethodId) {
      setError("Please select a shipping method.");
      return;
    }

    if (
      (form.paymentMethod === "JUICE" ||
        form.paymentMethod === "BANK_TRANSFER") &&
      !form.paymentReference.trim()
    ) {
      setError("Please enter your payment reference.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim() || null,
        address_line1: form.addressLine1.trim(),
        address_line2: form.addressLine2.trim() || null,
        city: form.city.trim() || null,
        district: form.district.trim() || null,
        postal_code: form.postalCode.trim() || null,
        country: "Mauritius",
        shipping_method_id: form.shippingMethodId,
        notes: form.notes.trim() || null,
        payment_method: form.paymentMethod,
        payment_reference: form.paymentReference.trim() || null,
        items: items.map((item) => ({
          product_id: item.productId,
          variant_id: item.variantId,
          qty: item.qty,
        })),
      };

      if (form.paymentMethod === "COD") {
        const res = await fetch("/api/orders/create-cod", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const parsed = await readJsonSafe(res);
        if (!parsed.ok) {
          throw new Error(
            parsed.data?.error || parsed.error || "Unable to place COD order."
        );
       }
       const json = parsed.data;

        clear();

        const orderNo = json.order_no || json.orderNo || "";
        const publicToken = json.public_token || json.publicToken || "";

        if (publicToken) {
          router.push(`/checkout/success?t=${encodeURIComponent(publicToken)}`);
          return;
        }

        if (orderNo) {
          router.push(`/checkout/success?orderNo=${encodeURIComponent(orderNo)}`);
          return;
        }

        throw new Error("Order created but no order reference was returned.");
      }

      const createRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const createParsed = await readJsonSafe(createRes);
      if (!createParsed.ok) {
         throw new Error(
           createParsed.data?.error || createParsed.error || "Unable to create order."
       );
      }
      const createJson = createParsed.data;

      if (form.paymentMethod === "SPARK") {
        const sparkRes = await fetch("/api/spark/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: createJson.orderId,
            publicToken: createJson.publicToken,
          }),
        });

        const sparkParsed = await readJsonSafe(sparkRes);
        if (!sparkParsed.ok) {
          throw new Error(
           sparkParsed.data?.error || sparkParsed.error || "Unable to start Spark payment."
        );
       }
       const sparkJson = sparkParsed.data;

        const checkoutUrl =
          sparkJson?.checkoutUrl || sparkJson?.checkout_url || sparkJson?.url;

        if (!checkoutUrl) {
          throw new Error("Missing Spark checkout URL.");
        }

        clear();
        window.location.href = checkoutUrl;
        return;
      }

      clear();

      const orderNo = createJson.orderNo || createJson.order_no || "";
      const publicToken = createJson.publicToken || createJson.public_token || "";

      if (publicToken) {
        router.push(`/checkout/success?t=${encodeURIComponent(publicToken)}`);
        return;
      }

      if (orderNo) {
        router.push(`/checkout/success?orderNo=${encodeURIComponent(orderNo)}`);
        return;
      }

      throw new Error("Order created but no order reference was returned.");
    } catch (err: any) {
      setError(err?.message || "Unable to place order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!items.length) {
    return (
      <div className="rounded-[28px] border border-[#ead7de] bg-white p-8 text-center shadow-[0_20px_60px_-50px_rgba(80,40,50,0.20)]">
        <h1 className="text-2xl font-semibold tracking-tight text-[#3f272d]">
          Your checkout is empty
        </h1>
        <p className="mt-3 text-sm leading-7 text-[#6f5a60]">
          Add products to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => router.push("/shop")}
          className="mt-5 inline-flex rounded-full bg-[#8f4f63] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 max-w-2xl">
        <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#9b6b79] sm:text-[11px]">
          Secure Checkout
        </p>
        <h1 className="mt-1 text-[1.75rem] font-semibold tracking-tight text-[#3f272d] sm:text-[2.1rem]">
          Complete Your Order
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#6f5a60] sm:text-[15px]">
          Delivery in Mauritius only. Choose your shipping and payment method to confirm your order.
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <form
          onSubmit={onSubmit}
          className="rounded-[28px] border border-[#ead7de] bg-white p-5 shadow-[0_20px_60px_-50px_rgba(80,40,50,0.20)] sm:p-6"
        >
          <div className="space-y-6">
            <section>
              <h2 className="text-lg font-semibold tracking-tight text-[#3f272d]">
                Customer Details
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Field
                  label="First Name"
                  required
                  value={form.firstName}
                  onChange={(value) => setForm((p) => ({ ...p, firstName: value }))}
                />
                <Field
                  label="Last Name"
                  required
                  value={form.lastName}
                  onChange={(value) => setForm((p) => ({ ...p, lastName: value }))}
                />
                <Field
                  label="Phone"
                  required
                  value={form.phone}
                  onChange={(value) => setForm((p) => ({ ...p, phone: value }))}
                />
                <Field
                  label="WhatsApp"
                  value={form.whatsapp}
                  onChange={(value) => setForm((p) => ({ ...p, whatsapp: value }))}
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(value) => setForm((p) => ({ ...p, email: value }))}
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight text-[#3f272d]">
                Delivery Address
              </h2>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field
                    label="Address Line 1"
                    required
                    value={form.addressLine1}
                    onChange={(value) =>
                      setForm((p) => ({ ...p, addressLine1: value }))
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <Field
                    label="Address Line 2"
                    value={form.addressLine2}
                    onChange={(value) =>
                      setForm((p) => ({ ...p, addressLine2: value }))
                    }
                  />
                </div>

                <Field
                  label="City"
                  value={form.city}
                  onChange={(value) => setForm((p) => ({ ...p, city: value }))}
                />
                <Field
                  label="District"
                  value={form.district}
                  onChange={(value) => setForm((p) => ({ ...p, district: value }))}
                />
                <Field
                  label="Postal Code"
                  value={form.postalCode}
                  onChange={(value) =>
                    setForm((p) => ({ ...p, postalCode: value }))
                  }
                />
                <Field
                  label="Country"
                  value={form.country}
                  onChange={(value) => setForm((p) => ({ ...p, country: value }))}
                />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight text-[#3f272d]">
                Shipping Method
              </h2>

              <div className="mt-4 space-y-3">
                {shippingMethods.map((method) => {
                  const selected = form.shippingMethodId === method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() =>
                        setForm((p) => ({ ...p, shippingMethodId: method.id }))
                      }
                      className={cx(
                        "w-full rounded-[20px] border p-4 text-left transition",
                        selected
                          ? "border-[#c996a6] bg-[#fff4f8] shadow-[0_10px_24px_-18px_rgba(80,40,50,0.22)]"
                          : "border-[#ead7de] bg-white hover:bg-[#fffafb]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-[#3f272d]">
                            {method.name}
                          </div>
                          <div className="mt-1 text-sm text-[#6f5a60]">
                            Shipping charge: {mur(method.price_mur)}
                          </div>
                        </div>

                        <div
                          className={cx(
                            "mt-1 h-5 w-5 rounded-full border",
                            selected
                              ? "border-[#8f4f63] bg-[#8f4f63]"
                              : "border-[#d9c2ca] bg-white"
                          )}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight text-[#3f272d]">
                Payment Method
              </h2>

              <div className="mt-4 space-y-3">
                <PaymentCard
                  selected={form.paymentMethod === "COD"}
                  title="Cash on Delivery"
                  description="Pay when your order is delivered."
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      paymentMethod: "COD",
                      paymentReference: "",
                    }))
                  }
                />

                <PaymentCard
                  selected={form.paymentMethod === "JUICE"}
                  title="MCB Juice"
                  description="Transfer via Juice and confirm with your payment reference."
                  onClick={() =>
                    setForm((p) => ({ ...p, paymentMethod: "JUICE" }))
                  }
                />

                <PaymentCard
                  selected={form.paymentMethod === "BANK_TRANSFER"}
                  title="Bank Transfer"
                  description="Transfer directly to our bank account and submit your reference."
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      paymentMethod: "BANK_TRANSFER",
                    }))
                  }
                />

                <PaymentCard
                  selected={form.paymentMethod === "SPARK"}
                  title="Pay Online — ABSA via Spark"
                  description="Secure online payment by card through Spark."
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      paymentMethod: "SPARK",
                      paymentReference: "",
                    }))
                  }
                />
              </div>

              {form.paymentMethod === "JUICE" ? (
                <InfoCard title="MCB Juice Details">
                  <div><strong>Juice Number:</strong> 59117549</div>
                  <div><strong>Name:</strong> MRS A THOMAS ST MARTIN</div>
                  <div className="mt-4">
                    <Field
                      label="Payment Reference"
                      value={form.paymentReference}
                      onChange={(value) =>
                        setForm((p) => ({ ...p, paymentReference: value }))
                      }
                      placeholder="Enter Juice reference / transaction note"
                    />
                  </div>
                </InfoCard>
              ) : null}

              {form.paymentMethod === "BANK_TRANSFER" ? (
                <InfoCard title="Bank Transfer Details">
                  <div><strong>Account Holder:</strong> MRS A THOMAS ST MARTIN</div>
                  <div><strong>Account Number:</strong> 000447835467</div>
                  <div><strong>Bank:</strong> The Mauritius Commercial Bank</div>
                  <div className="mt-4">
                    <Field
                      label="Payment Reference"
                      value={form.paymentReference}
                      onChange={(value) =>
                        setForm((p) => ({ ...p, paymentReference: value }))
                      }
                      placeholder="Enter bank transfer reference"
                    />
                  </div>
                </InfoCard>
              ) : null}

              {form.paymentMethod === "SPARK" ? (
                <InfoCard title="Online Payment">
                  <div>
                    You will be redirected securely to Spark to complete your payment online by card.
                  </div>
                </InfoCard>
              ) : null}
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight text-[#3f272d]">
                Notes
              </h2>

              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={3}
                className="mt-4 w-full rounded-2xl border border-[#ead7de] px-4 py-3 text-sm outline-none transition focus:border-[#c996a6]"
                placeholder="Add delivery instructions or order notes"
              />
            </section>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[#8f4f63] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Processing..."
                  : form.paymentMethod === "SPARK"
                  ? "Proceed to Online Payment"
                  : "Confirm Order"}
              </button>
            </div>
          </div>
        </form>

        <aside className="h-fit rounded-[28px] border border-[#ead7de] bg-white p-5 shadow-[0_20px_60px_-50px_rgba(80,40,50,0.20)] sm:p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#9b6b79]">
            Order Summary
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#3f272d]">
            Your Order
          </h2>

          <div className="mt-5 space-y-3">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId ?? "default"}`}
                className="flex gap-3 rounded-2xl border border-[#f0e4e8] p-3"
              >
                <div className="relative h-[72px] w-[56px] overflow-hidden rounded-xl bg-neutral-100 sm:h-20 sm:w-16">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-medium text-[#3f272d]">
                    {item.title}
                  </div>

                  {item.variantLabel ? (
                    <div className="mt-1 text-xs text-[#8c757c]">
                      {item.variantLabel}
                    </div>
                  ) : null}

                  <div className="mt-1 text-sm text-[#6f5a60]">
                    Qty: {item.qty}
                  </div>

                  <div className="mt-1 text-sm font-semibold text-[#3f272d]">
                    {mur(item.unitPriceMur * item.qty)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-[#f0e4e8] pt-5">
            <div className="flex items-center justify-between text-sm text-[#6f5a60]">
              <span>Subtotal</span>
              <span>{mur(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between text-sm text-[#6f5a60]">
              <span>Shipping</span>
              <span>{mur(shipping)}</span>
            </div>

            <div className="flex items-center justify-between pt-1 text-base font-semibold text-[#3f272d]">
              <span>Total</span>
              <span>{mur(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#3f272d]">
        {label} {required ? "*" : ""}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-2xl border border-[#ead7de] px-4 text-sm outline-none transition focus:border-[#c996a6]"
      />
    </div>
  );
}

function PaymentCard({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "w-full rounded-[20px] border p-4 text-left transition",
        selected
          ? "border-[#c996a6] bg-[#fff4f8] shadow-[0_10px_24px_-18px_rgba(80,40,50,0.22)]"
          : "border-[#ead7de] bg-white hover:bg-[#fffafb]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-[#3f272d]">{title}</div>
          <div className="mt-1 text-sm leading-6 text-[#6f5a60]">
            {description}
          </div>
        </div>

        <div
          className={cx(
            "mt-1 h-5 w-5 rounded-full border",
            selected
              ? "border-[#8f4f63] bg-[#8f4f63]"
              : "border-[#d9c2ca] bg-white"
          )}
        />
      </div>
    </button>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 rounded-[20px] border border-[#ead7de] bg-[#fff8fa] p-4 text-sm text-[#6f5a60]">
      <div className="text-sm font-semibold text-[#3f272d]">{title}</div>
      <div className="mt-3 space-y-1">{children}</div>
    </div>
  );
}