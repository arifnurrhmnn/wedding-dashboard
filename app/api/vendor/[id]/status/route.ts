import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function PATCH(
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

    const { id } = await params;
    const { status } = await request.json();

    if (!["prospek", "negosiasi", "deal", "batal"].includes(status)) {
      return NextResponse.json(
        { error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("vendors")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
