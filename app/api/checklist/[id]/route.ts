import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { parseChecklistInput } from "@/lib/checklist";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const parsed = parseChecklistInput(await request.json(), true);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { id } = await params;

    const { data, error } = await supabase
      .from("checklist")
      .update(parsed.value)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
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
    const { error } = await supabase.from("checklist").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
