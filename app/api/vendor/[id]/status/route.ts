import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

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
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Vendor tidak ditemukan" }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
