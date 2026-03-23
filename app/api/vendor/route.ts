import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("vendors")
      .select(`*, vendor_packages(*)`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      nama,
      kategori,
      kontak_nama,
      kontak_wa,
      kontak_email,
      website,
      instagram,
      alamat,
      catatan,
      status,
    } = body;

    if (!nama || !kategori) {
      return NextResponse.json(
        { error: "Nama dan kategori wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("vendors")
      .insert([
        {
          user_id: user.id,
          nama,
          kategori,
          kontak_nama,
          kontak_wa,
          kontak_email,
          website,
          instagram,
          alamat,
          catatan,
          status: status || "prospek",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to create vendor" },
      { status: 500 }
    );
  }
}
