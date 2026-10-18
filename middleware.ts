import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { accountDestination } from "@/lib/auth-redirect";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const redirect = (pathname: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    const response = NextResponse.redirect(url);
    for (const cookie of supabaseResponse.cookies.getAll()) {
      response.cookies.set(cookie);
    }
    return response;
  };

  // 1. Tidak ada session & akses dashboard → login
  if (!user && pathname.startsWith("/dashboard")) {
    return redirect("/login");
  }

  // 2. Ada session → ambil profile SEKALI untuk semua pengecekan
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();

    const destination = accountDestination(profileError ? undefined : profile?.status);

    // User sudah login tapi akses /login atau /daftar
    if (pathname === "/login" || pathname === "/daftar") {
      return redirect(destination);
    }

    // Akses dashboard tapi status pending/rejected
    if (pathname.startsWith("/dashboard") && destination !== "/dashboard") {
      return redirect(destination);
    }

    // Akses /pending atau /rejected padahal sudah active
    if (pathname === "/pending" || pathname === "/rejected") {
      if (pathname !== destination) return redirect(destination);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/daftar", "/pending", "/rejected"],
};
