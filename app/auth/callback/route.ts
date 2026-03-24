import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Cek status user sebelum redirect ke dashboard
      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", data.user.id)
        .single();

      const status = profile?.status;

      if (status === "pending") {
        return NextResponse.redirect(`${origin}/pending`);
      }

      if (status === "rejected") {
        return NextResponse.redirect(`${origin}/rejected`);
      }

      // Status active atau profile belum ada → ke dashboard
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Jika gagal, redirect ke halaman login dengan error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
