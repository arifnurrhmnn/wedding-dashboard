import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  // 1. Tidak ada session & akses dashboard → login
  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 2. Ada session → ambil profile SEKALI untuk semua pengecekan
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();

    const status = profile?.status;

    // User sudah login tapi akses /login atau /daftar
    if (pathname === "/login" || pathname === "/daftar") {
      if (status === "pending") {
        const url = request.nextUrl.clone();
        url.pathname = "/pending";
        return NextResponse.redirect(url);
      }
      if (status === "rejected") {
        const url = request.nextUrl.clone();
        url.pathname = "/rejected";
        return NextResponse.redirect(url);
      }
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/tamu-undangan";
      return NextResponse.redirect(url);
    }

    // Akses dashboard tapi status pending/rejected
    if (pathname.startsWith("/dashboard")) {
      if (status === "pending") {
        const url = request.nextUrl.clone();
        url.pathname = "/pending";
        return NextResponse.redirect(url);
      }
      if (status === "rejected") {
        const url = request.nextUrl.clone();
        url.pathname = "/rejected";
        return NextResponse.redirect(url);
      }
    }

    // Akses /pending atau /rejected padahal sudah active
    if (pathname === "/pending" || pathname === "/rejected") {
      if (status === "active") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard/tamu-undangan";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/daftar", "/pending", "/rejected"],
};
