import { NextRequest, NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  SupabaseAdminConfigurationError,
} from "@/lib/supabase-admin";

export async function POST(req: NextRequest) {
  try {
    const { email, password, nama } = await req.json();

    if (typeof email !== "string" || !email.trim() || typeof password !== "string" || typeof nama !== "string" || !nama.trim()) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password minimal 8 karakter" },
        { status: 400 }
      );
    }

    // Dibuat saat request berjalan agar secret yang belum dikonfigurasi tidak
    // menggagalkan proses build Next.js.
    const supabaseAdmin = createSupabaseAdminClient();

    // Cek apakah email sudah terdaftar via profiles table (lebih efisien dari listUsers)
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login." },
        { status: 409 }
      );
    }

    // Buat user dengan email_confirm: true agar tidak kirim email konfirmasi sama sekali
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm, tidak ada email yang dikirim
      user_metadata: {
        nama,
        role: "client",
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ user: data.user }, { status: 201 });
  } catch (err) {
    if (err instanceof SupabaseAdminConfigurationError) {
      console.error("Register configuration error:", err.message);
      return NextResponse.json(
        { error: "Layanan pendaftaran belum dikonfigurasi" },
        { status: 503 }
      );
    }

    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
