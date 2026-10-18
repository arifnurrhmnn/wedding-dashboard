import type { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;
type AuthResult =
  | { supabase: ServerClient; user: User; response?: never }
  | { response: NextResponse; supabase?: never; user?: never };

/** Protect API handlers independently of page redirects and database policies. */
export async function requireActiveUser(
  options: { adminOnly?: boolean } = {}
): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("status, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return {
      response: NextResponse.json(
        { error: "Status akun belum dapat diverifikasi. Coba lagi." },
        { status: 503 }
      ),
    };
  }
  if (profile?.status !== "active" || (options.adminOnly && profile.role !== "admin")) {
    return { response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { supabase, user };
}
