import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const { data, error } = await supabase
      .from("vendor_packages")
      .select("*")
      .eq("vendor_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: vendor_id } = await params;
    const body = await request.json();
    const { nama_paket, deskripsi, harga } = body;

    if (!nama_paket || harga === undefined) {
      return NextResponse.json(
        { error: "Nama paket dan harga wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("vendor_packages")
      .insert([
        {
          vendor_id,
          user_id: user.id,
          nama_paket,
          deskripsi,
          harga,
          is_final: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    );
  }
}
