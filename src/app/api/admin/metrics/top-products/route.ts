import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

function n(v: unknown) {
  const x = Number(v ?? 0);
  return Number.isFinite(x) ? x : 0;
}

type OrderJoin = {
  payment_status: string | null;
  status: string | null;
  created_at: string | null;
};

type OrderItemRow = {
  product_id: string | null;
  qty: number | null;
  line_total_mur: number | null;
  orders: OrderJoin | OrderJoin[] | null;
};

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);

    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status ?? 401 }
      );
    }

    const url = new URL(req.url);
    const days = Math.min(
      Math.max(Number(url.searchParams.get("days") || 30), 1),
      365
    );
    const since = new Date(
      Date.now() - days * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data: items, error } = await supabaseAdmin
      .from("order_items")
      .select(
        "product_id,qty,line_total_mur,orders!inner(payment_status,status,created_at)"
      )
      .gte("orders.created_at", since);

    if (error) {
      throw error;
    }

    const map = new Map<
      string,
      {
        product_id: string;
        qty: number;
        paid: number;
        codExpected: number;
      }
    >();

    for (const row of ((items ?? []) as OrderItemRow[])) {
      const productId = row.product_id;
      if (!productId) continue;

      const qty = n(row.qty);
      const line = n(row.line_total_mur);

      const order = Array.isArray(row.orders)
        ? (row.orders[0] ?? null)
        : row.orders;

      const paymentStatus = order?.payment_status ?? null;
      const status = order?.status ?? null;

      const current = map.get(productId) ?? {
        product_id: productId,
        qty: 0,
        paid: 0,
        codExpected: 0,
      };

      current.qty += qty;

      if (paymentStatus === "PAID") {
        current.paid += line;
      }

      if (paymentStatus === "COD" && status === "PROCESSING") {
        current.codExpected += line;
      }

      map.set(productId, current);
    }

    const rows = Array.from(map.values())
      .sort(
        (a, b) =>
          b.paid + b.codExpected - (a.paid + a.codExpected)
      )
      .slice(0, 20);

    const ids = rows.map((x) => x.product_id);

    if (!ids.length) {
      return NextResponse.json({ days, items: [] });
    }

    const { data: products, error: productsErr } = await supabaseAdmin
      .from("products")
      .select("id,title,slug,category_id")
      .in("id", ids);

    if (productsErr) {
      throw productsErr;
    }

    const productMap = new Map(
      (products ?? []).map((p) => [p.id, p])
    );

    const out = rows.map((row) => {
      const product = productMap.get(row.product_id);

      return {
        ...row,
        title: product?.title || "Unknown",
        slug: product?.slug || "",
        category_id: product?.category_id || null,
        total: row.paid + row.codExpected,
      };
    });

    return NextResponse.json({
      days,
      items: out,
    });
  } catch (err: any) {
    console.error("admin/metrics/top-products error:", err);

    return NextResponse.json(
      { error: err?.message || "Failed to load top products." },
      { status: 500 }
    );
  }
}