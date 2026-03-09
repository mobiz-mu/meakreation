// src/app/api/admin/categories/toggle-active/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json().catch(() => ({}));
  const id: string = body?.id;
  const is_active: boolean = body?.is_active;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (typeof is_active !== "boolean") return NextResponse.json({ error: "Missing is_active boolean" }, { status: 400 });

  const { data, error } = await supabaseServer
    .from("categories")
    .update({ is_active, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id,is_active")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, item: data });
}