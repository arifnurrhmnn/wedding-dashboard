import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { parseScheduleInput } from "@/lib/schedule";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id } = await params;
    const body = await request.json();

    const existing = await supabase.from("schedules")
      .select("title, start_datetime, end_datetime")
      .eq("id", id).eq("user_id", user.id).maybeSingle();
    if (existing.error) throw existing.error;
    if (!existing.data) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    const parsed = parseScheduleInput(body, existing.data);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const { data, error } = await supabase
      .from("schedules")
      .update(parsed.value)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id } = await params;

    const { error } = await supabase.from("schedules").delete().eq("id", id).eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return NextResponse.json(
      { error: "Failed to delete schedule" },
      { status: 500 }
    );
  }
}
