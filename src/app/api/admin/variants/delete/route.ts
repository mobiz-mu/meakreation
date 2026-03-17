import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin.ok) { return NextResponse.json({ error: admin.error }, { status: admin.status }); }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabaseAdmin.from("product_variants").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("admin/variants/delete error:", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}

