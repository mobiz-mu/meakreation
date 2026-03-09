"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";

async function getTokenMaybe() {
  const sess = await supabase.auth.getSession();
  return sess.data.session?.access_token || null;
}

export default function OrderFailedClient() {
  const sp = useSearchParams();
  const publicToken = sp.get("t") || "";

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        if (!publicToken) return;

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
      } catch {
        // ignore
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [publicToken]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 mt-0.5" />
            <div>
              <h1 className="text-xl font-semibold">Payment failed or cancelled</h1>
              <p className="text-sm text-muted-foreground">
                If this was a mistake, you can try again from checkout.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border p-4 text-sm">
            {loading ? (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading…
              </div>
            ) : order ? (
              <div className="space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Order</span>
                  <span className="font-medium">{order.order_no}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-medium">{order.payment_status}</span>
                </div>
              </div>
            ) : (
              <div className="text-muted-foreground">Order not found.</div>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button className="rounded-xl" asChild>
              <Link href="/checkout">Back to checkout</Link>
            </Button>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/shop">Continue shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}