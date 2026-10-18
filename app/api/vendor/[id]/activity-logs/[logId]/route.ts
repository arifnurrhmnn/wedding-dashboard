import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; logId: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id: vendorId, logId } = await params;

    const { data, error } = await supabase
      .from("vendor_activity_logs")
      .delete()
      .eq("id", logId)
      .eq("vendor_id", vendorId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Aktivitas tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete activity log" },
      { status: 500 }
    );
  }
}
