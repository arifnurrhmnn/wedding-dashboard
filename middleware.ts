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

  // Redirect ke login jika akses dashboard tanpa session
  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect jika sudah login dan akses /login atau /daftar
  if (user && (pathname === "/login" || pathname === "/daftar")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();

    const status = profile?.status;

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

  // Cek status user jika mengakses dashboard
  if (user && pathname.startsWith("/dashboard")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();

    const status = profile?.status;

    // Jika pending → redirect ke /pending (kecuali sudah di sana)
    if (status === "pending" && pathname !== "/pending") {
      const url = request.nextUrl.clone();
      url.pathname = "/pending";
      return NextResponse.redirect(url);
    }

    // Jika rejected → redirect ke /rejected (kecuali sudah di sana)
    if (status === "rejected" && pathname !== "/rejected") {
      const url = request.nextUrl.clone();
      url.pathname = "/rejected";
      return NextResponse.redirect(url);
    }
  }

  // Jika user sudah active tapi mencoba akses /pending atau /rejected → redirect ke dashboard
  if (user && (pathname === "/pending" || pathname === "/rejected")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", user.id)
      .single();

    if (profile?.status === "active") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/tamu-undangan";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/daftar", "/pending", "/rejected"],
};
