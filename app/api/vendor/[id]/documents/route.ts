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
      .from("vendor_documents")
      .select("*")
      .eq("vendor_id", id)
      .eq("user_id", user.id)
      .order("uploaded_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}
