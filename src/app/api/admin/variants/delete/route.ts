import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabaseServer.from("product_variants").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("admin/variants/delete error:", err);
    return NextResponse.json({ error: err?.message || "Failed" }, { status: 500 });
  }
}