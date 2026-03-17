import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Role = "ADMIN" | "EMPLOYEE" | "STAFF";

function isValidRole(role: string): role is Role {
  return ["ADMIN", "EMPLOYEE", "STAFF"].includes(role);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("staff_profiles")
      .select(`
        user_id,
        email,
        full_name,
        phone,
        role,
        status,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to load users." },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: data ?? [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unexpected server error." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email = String(body?.email || "").trim().toLowerCase();
    const full_name = String(body?.full_name || "").trim();
    const phone = String(body?.phone || "").trim();
    const role = String(body?.role || "STAFF").trim().toUpperCase();
    const password = String(body?.password || "").trim();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (!isValidRole(role)) {
      return NextResponse.json(
        { error: "Invalid role selected." },
        { status: 400 }
      );
    }

    const { data: createdUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name,
          role,
        },
      });

    if (createError || !createdUser.user) {
      return NextResponse.json(
        { error: createError?.message || "Failed to create auth user." },
        { status: 500 }
      );
    }

    const userId = createdUser.user.id;

    const { error: profileError } = await supabaseAdmin.from("staff_profiles").insert({
      user_id: userId,
      email,
      full_name: full_name || null,
      phone: phone || null,
      role,
      status: "ACTIVE",
    });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: profileError.message || "Failed to create staff profile." },
        { status: 500 }
      );
    }

    const { error: roleError } = await supabaseAdmin.from("admin_users").upsert({
      user_id: userId,
      role,
    });

    if (roleError) {
      return NextResponse.json(
        { error: roleError.message || "Failed to assign role." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "User created successfully.",
      user: {
        user_id: userId,
        email,
        full_name,
        role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unexpected server error." },
      { status: 500 }
    );
  }
}

