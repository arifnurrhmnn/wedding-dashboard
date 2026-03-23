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
      .from("vendor_activity_logs")
      .select("*")
      .eq("vendor_id", id)
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
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: vendor_id } = await params;
    const body = await request.json();
    const { aktivitas, tanggal, catatan } = body;

    if (!aktivitas || !tanggal) {
      return NextResponse.json(
        { error: "Aktivitas dan tanggal wajib diisi" },
        { status: 400 }
      );
    }

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
