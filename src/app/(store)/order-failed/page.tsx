import { Suspense } from "react";
import OrderFailedClient from "./OrderFailedClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted-foreground">Loading…</div>}>
      <OrderFailedClient />
    </Suspense>
  );
}