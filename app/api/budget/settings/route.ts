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
      .from("budget_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch budget settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { total_budget, catatan } = body;

    const { data, error } = await supabase
      .from("budget_settings")
      .upsert(
        {
          user_id: user.id,
          total_budget,
          catatan,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to update budget settings" },
      { status: 500 }
    );
  }
}
