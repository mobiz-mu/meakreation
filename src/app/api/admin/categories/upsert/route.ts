// src/app/api/admin/categories/upsert/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const runtime = "nodejs";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: Request) {
  const guard = await requireAdmin(req);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json().catch(() => ({}));

  const id: string | undefined = body?.id || undefined;
  const name: string = String(body?.name || "").trim();
  let slug: string = String(body?.slug || "").trim();
  const description: string | null = body?.description ? String(body.description) : null;
  const is_active: boolean = typeof body?.is_active === "boolean" ? body.is_active : true;
  const sort_order: number = Number.isFinite(Number(body?.sort_order)) ? Number(body.sort_order) : 0;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  if (!slug) slug = slugify(name);
  slug = slugify(slug);

  // Adjust fields if your schema differs
  const payload: any = {
    name,
    slug,
    description,
    is_active,
    sort_order,
    updated_at: new Date().toISOString(),
  };

  // if creating, allow DB defaults for created_at
  if (id) payload.id = id;

  const { data, error } = await supabaseServer
    .from("categories")
    .upsert(payload, { onConflict: "id" })
    .select("id,name,slug,description,is_active,sort_order,created_at,updated_at")
    .single();

  if (error) {
    // unique slug conflict etc.
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, item: data });
}