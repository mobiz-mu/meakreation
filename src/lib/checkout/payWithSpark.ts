import { supabase } from "@/lib/supabase/client";

async function getBearer() {
  const s = await supabase.auth.getSession();
  return s.data.session?.access_token || null;
}

export async function createOrderAndPaySpark(input: any) {
  const bearer = await getBearer();

  // 1) Create order (atomic) => returns orderId + publicToken
  const createRes = await fetch("/api/orders/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify({
      ...input,
      payment_method: "SPARK",
    }),
  });

  const created = await createRes.json();
  if (!createRes.ok) throw new Error(created?.error || "Order creation failed");

  const { orderId, publicToken } = created;

  // 2) Create Spark checkout using orderId + publicToken
  const sparkRes = await fetch("/api/spark/create-checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify({ orderId, publicToken }),
  });

  const spark = await sparkRes.json();
  if (!sparkRes.ok) throw new Error(spark?.error || "Spark checkout failed");

  // 3) Redirect
  window.location.href = spark.checkoutUrl;

  return { orderId, publicToken, checkoutUrl: spark.checkoutUrl };
}