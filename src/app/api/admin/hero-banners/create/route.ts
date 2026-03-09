import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin.ok) {
      return NextResponse.json({ error: admin.error }, { status: 401 });
    }

    const {
      title,
      subtitle,
      cta_text,
      cta_href,
      image_url,
      mobile_image_url,
      is_active,
      sort_order,
    } = await req.json();

    if (!title || !image_url) {
      return NextResponse.json(
        { error: "Missing title or image_url" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("hero_banners")
      .insert({
        title: String(title).trim(),
        subtitle: subtitle?.trim() || null,
        cta_text: cta_text?.trim() || "Shop Now",
        cta_href: cta_href?.trim() || "/shop",
        image_url: String(image_url).trim(),
        mobile_image_url: mobile_image_url?.trim() || null,
        is_active: Boolean(is_active ?? true),
        sort_order: Number(sort_order ?? 0),
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          code: (error as any).code,
          details: (error as any).details,
          hint: (error as any).hint,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, banner: data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}