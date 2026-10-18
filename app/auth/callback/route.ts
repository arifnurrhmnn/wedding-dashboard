import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { accountDestination } from "@/lib/auth-redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Cek status user sebelum redirect ke dashboard
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", data.user.id)
        .maybeSingle();

      const destination = accountDestination(profileError ? undefined : profile?.status);
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  // Jika gagal, redirect ke halaman login dengan error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
