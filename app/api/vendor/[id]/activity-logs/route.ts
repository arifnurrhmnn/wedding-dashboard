import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id } = await params;

    const { data, error } = await supabase
      .from("vendor_activity_logs")
      .select("*")
      .eq("vendor_id", id)
      .eq("user_id", user.id)
      .order("tanggal", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id: vendor_id } = await params;
    const body = await request.json();
    const { aktivitas, tanggal, catatan } = body;

    if (typeof aktivitas !== "string" || !aktivitas.trim() || typeof tanggal !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || Number.isNaN(Date.parse(tanggal)) || (catatan !== undefined && typeof catatan !== "string")) {
      return NextResponse.json(
        { error: "Aktivitas dan tanggal wajib diisi" },
        { status: 400 }
      );
    }

    const { data: vendor, error: vendorError } = await supabase.from("vendors")
      .select("id").eq("id", vendor_id).eq("user_id", user.id).maybeSingle();
    if (vendorError) throw vendorError;
    if (!vendor) return NextResponse.json({ error: "Vendor tidak ditemukan" }, { status: 404 });

    const { data, error } = await supabase
      .from("vendor_activity_logs")
      .insert([{ vendor_id, user_id: user.id, aktivitas, tanggal, catatan }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to create activity log" },
      { status: 500 }
    );
  }
}
