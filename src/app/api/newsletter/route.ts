import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server-public";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const source = String(body?.source || "homepage").trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from("newsletter_subscribers")
      .upsert(
        {
          email,
          source,
        },
        { onConflict: "email" }
      );

    if (error) {
      console.error("Newsletter insert error:", error);
      return NextResponse.json(
        { error: "Unable to subscribe right now. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Subscribed successfully.",
    });
  } catch (error) {
    console.error("Newsletter API unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}