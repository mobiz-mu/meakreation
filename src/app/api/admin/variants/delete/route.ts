import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) {
      return NextResponse.json(
        { error: admin.error },
        { status: admin.status }
      );
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing id" },
        { status: 400 }
      );
    }

    const { data: existing, error: existingErr } = await supabaseAdmin
      .from("product_variants")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (existingErr) throw existingErr;

    if (!existing?.id) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    // variant_images will be removed automatically by FK cascade
    const { error } = await supabaseAdmin
      .from("product_variants")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    console.error("admin/variants/delete error:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to delete variant" },
      { status: 500 }
    );
  }
}