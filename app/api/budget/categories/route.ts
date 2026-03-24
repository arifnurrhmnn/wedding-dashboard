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
      .from("budget_categories")
      .select("*")
      .eq("user_id", user.id)
      .order("urutan", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
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
    const { nama, icon, urutan } = body;

    if (!nama)
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });

    // get max urutan if not provided
    let order = urutan;
    if (order === undefined) {
      const { data: existing } = await supabase
        .from("budget_categories")
        .select("urutan")
        .eq("user_id", user.id)
        .order("urutan", { ascending: false })
        .limit(1)
        .maybeSingle();
      order = existing ? (existing.urutan ?? 0) + 1 : 0;
    }

    const { data, error } = await supabase
      .from("budget_categories")
      .insert([{ user_id: user.id, nama, icon: icon ?? "💰", urutan: order }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
