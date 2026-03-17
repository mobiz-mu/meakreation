import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json().catch(() => ({}));
  const items: Array<{ id: string; sort_order: number }> = Array.isArray(body?.items) ? body.items : [];

  if (!items.length) {
    return NextResponse.json({ error: "Missing items[]" }, { status: 400 });
  }

  // Basic validation
  for (const it of items) {
    if (!it?.id || !Number.isFinite(Number(it?.sort_order))) {
      return NextResponse.json({ error: "Invalid items format" }, { status: 400 });
    }
  }

  // Update one-by-one (safe + simple). For 10-100 categories it's fine.
  // If you want, we can optimize later with a single SQL function.
  const now = new Date().toISOString();

  for (const it of items) {
    const { error } = await supabaseAdmin
      .from("categories")
      .update({ sort_order: Number(it.sort_order), updated_at: now })
      .eq("id", it.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

