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

    const { data: items, error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .select(
        "product_id,line_total_mur,orders!inner(payment_status,status,created_at)"
      )
      .gte("orders.created_at", since);

    if (itemsErr) {
      throw itemsErr;
    }

    const typedItems = (items ?? []) as OrderItemRow[];

    const productIds = Array.from(
      new Set(
        typedItems
          .map((item) => item.product_id)
          .filter((id): id is string => typeof id === "string" && id.length > 0)
      )
    );

    if (!productIds.length) {
      return NextResponse.json({ days, items: [] });
    }

    const { data: products, error: productsErr } = await supabaseAdmin
      .from("products")
      .select("id,category_id")
      .in("id", productIds);

    if (productsErr) {
      throw productsErr;
    }

    const productToCategory = new Map(
      (products ?? []).map((p) => [p.id, p.category_id])
    );

    const categoryMap = new Map<
      string,
      { category_id: string; paid: number; codExpected: number }
    >();

    for (const row of typedItems) {
      const productId = row.product_id;
      if (!productId) continue;

      const categoryId = productToCategory.get(productId);
      if (!categoryId) continue;

      const order = Array.isArray(row.orders)
        ? (row.orders[0] ?? null)
        : row.orders;

      const paymentStatus = order?.payment_status ?? null;
      const status = order?.status ?? null;
      const line = n(row.line_total_mur);

      const current = categoryMap.get(categoryId) ?? {
        category_id: categoryId,
        paid: 0,
        codExpected: 0,
      };

      if (paymentStatus === "PAID") {
        current.paid += line;
      }

      if (paymentStatus === "COD" && status === "PROCESSING") {
        current.codExpected += line;
      }

      categoryMap.set(categoryId, current);
    }

    const rows = Array.from(categoryMap.values())
      .map((row) => ({
        ...row,
        total: row.paid + row.codExpected,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    const categoryIds = rows.map((row) => row.category_id);

    if (!categoryIds.length) {
      return NextResponse.json({ days, items: [] });
    }

    const { data: categories, error: categoriesErr } = await supabaseAdmin
      .from("categories")
      .select("id,name,slug")
      .in("id", categoryIds);

    if (categoriesErr) {
      throw categoriesErr;
    }

    const categoryInfo = new Map(
      (categories ?? []).map((c) => [c.id, c])
    );

    const out = rows.map((row) => {
      const category = categoryInfo.get(row.category_id);

      return {
        ...row,
        name: category?.name || "Unknown",
        slug: category?.slug || "",
      };
    });

    return NextResponse.json({
      days,
      items: out,
    });
  } catch (err: any) {
    console.error("admin/metrics/top-categories error:", err);

    return NextResponse.json(
      { error: err?.message || "Failed to load top categories." },
      { status: 500 }
    );
  }
}