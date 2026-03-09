"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";

function fmtMUR(n?: number) {
  const x = Number.isFinite(Number(n)) ? Number(n) : 0;
  return `Rs ${x.toLocaleString("en-MU")}`;
}

async function getTokenMaybe() {
  const sess = await supabase.auth.getSession();
  return sess.data.session?.access_token || null;
}

export default function OrderSuccessPage() {
  const sp = useSearchParams();
  const publicToken = sp.get("t") || "";

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const title = useMemo(() => {
    const ps = order?.payment_status;
    if (ps === "PAID") return "Payment confirmed 🎉";
    if (ps === "PENDING") return "Payment received — confirming…";
    if (ps === "FAILED") return "Payment not confirmed";
    return "Thank you!";
  }, [order]);

  useEffect(() => {
    let alive = true;

    async function verifyOnce() {
      setErr(null);
      try {
        if (!publicToken) throw new Error("Missing token");

        const bearer = await getTokenMaybe();
        const res = await fetch("/api/orders/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
          },
          body: JSON.stringify({ publicToken }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Verify failed");

        if (!alive) return;
        setOrder(json);
        return json;
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed");
        return null;
      }
    }

    async function poll() {
      setLoading(true);
      // Poll up to ~20 seconds (webhook may be slightly delayed)
      for (let i = 0; i < 10; i++) {
        const o = await verifyOnce();
        const ps = o?.payment_status;
        if (ps === "PAID" || ps === "FAILED") break;
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (!alive) return;
      setLoading(false);
    }

    poll();

    return () => {
      alive = false;
    };
  }, [publicToken]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 mt-0.5" />
            <div>
              <h1 className="text-xl font-semibold">{title}</h1>
              <p className="text-sm text-muted-foreground">
                {loading ? "We’re confirming your payment. Please don’t close this page." : "You can now continue shopping."}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border p-4 text-sm">
            {err ? (
              <div className="text-red-600">{err}</div>
            ) : !order ? (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading order…
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Order</span>
                  <span className="font-medium">{order.order_no}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-medium">{order.payment_status}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-semibold">{fmtMUR(order.total_mur)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button className="rounded-xl" asChild>
              <Link href="/shop">Continue shopping</Link>
            </Button>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/my-account">My account</Link>
            </Button>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Token: <span className="font-mono">{publicToken ? publicToken.slice(0, 8) + "…" : "-"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}