import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Role = "ADMIN" | "EMPLOYEE" | "STAFF";

function isValidRole(role: string): role is Role {
  return ["ADMIN", "EMPLOYEE", "STAFF"].includes(role);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();

    const full_name = String(body?.full_name || "").trim();
    const phone = String(body?.phone || "").trim();
    const role = String(body?.role || "STAFF").trim().toUpperCase();
    const status = String(body?.status || "ACTIVE").trim().toUpperCase();

    if (!isValidRole(role)) {
      return NextResponse.json(
        { error: "Invalid role selected." },
        { status: 400 }
      );
    }

    const { error: profileError } = await supabaseAdmin
      .from("staff_profiles")
      .update({
        full_name: full_name || null,
        phone: phone || null,
        role,
        status,
      })
      .eq("user_id", userId);

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message || "Failed to update staff profile." },
        { status: 500 }
      );
    }

    const { error: roleError } = await supabaseAdmin
      .from("admin_users")
      .upsert({
        user_id: userId,
        role,
      });

    if (roleError) {
      return NextResponse.json(
        { error: roleError.message || "Failed to update admin role." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "User updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unexpected server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const { error: profileError } = await supabaseAdmin
      .from("staff_profiles")
      .delete()
      .eq("user_id", userId);

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message || "Failed to delete profile." },
        { status: 500 }
      );
    }

    await supabaseAdmin.from("admin_users").delete().eq("user_id", userId);
    await supabaseAdmin.auth.admin.deleteUser(userId);

    return NextResponse.json({
      ok: true,
      message: "User deleted successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unexpected server error." },
      { status: 500 }
    );
  }
}