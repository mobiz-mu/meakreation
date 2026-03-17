import { supabaseAdmin } from "@/lib/supabase/server-admin";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function requireAdmin() {
  try {
    const supabase = await getSupabaseServer();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user?.id) {
      return {
        ok: false as const,
        status: 401,
        error: "Invalid session",
      };
    }

    const { data: adminRow, error: adminErr } = await supabaseAdmin
      .from("admin_users")
      .select("user_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminErr) {
      return {
        ok: false as const,
        status: 500,
        error: adminErr.message,
      };
    }

    if (!adminRow?.user_id) {
      return {
        ok: false as const,
        status: 403,
        error: "Admin access required",
      };
    }

    return {
      ok: true as const,
      uid: user.id,
      role: adminRow.role ?? "ADMIN",
    };
  } catch (error: any) {
    console.error("requireAdmin error:", error);

    return {
      ok: false as const,
      status: 500,
      error: error?.message || "Admin authentication failed",
    };
  }
}