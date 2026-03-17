import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status ?? 401 }
      );
    }

    const url = new URL(req.url);
    const status = (url.searchParams.get("status") || "ALL").trim();
    const q = (url.searchParams.get("q") || "").trim();
    const rawLimit = Number(url.searchParams.get("limit") || 50);
    const limit = Math.min(Math.max(rawLimit, 1), 100);

    let query = supabaseAdmin
      .from("orders")
      .select(
        "id,order_no,status,payment_method,payment_status,first_name,last_name,email,phone,total_mur,created_at"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status !== "ALL") {
      query = query.eq("status", status);
    }

    if (q) {
      const safe = q.replace(/,/g, "").replace(/\s+/g, " ").trim();

      if (safe) {
        query = query.or(
          `order_no.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`
        );
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      items: data ?? [],
    });
  } catch (err: any) {
    console.error("admin/orders/list error:", err);

    return NextResponse.json(
      { error: err?.message || "Failed to load orders." },
      { status: 500 }
    );
  }
}

