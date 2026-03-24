import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; logId: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { logId } = await params;

    const { error } = await supabase
      .from("vendor_activity_logs")
      .delete()
      .eq("id", logId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete activity log" },
      { status: 500 }
    );
  }
}
