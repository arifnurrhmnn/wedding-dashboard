import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function DELETE() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // First, count how many records will be deleted
    const { count, error: countError } = await supabase
      .from("tamu_undangan")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json(
        { success: false, error: "Failed to count records" },
        { status: 500 }
      );
    }

    // RLS akan otomatis hanya hapus data milik user ini
    const { error: deleteError } = await supabase
      .from("tamu_undangan")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all by using a condition that matches everything

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: "Failed to delete records" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: count || 0,
      message: `Successfully deleted ${count || 0} records`,
    });
  } catch (error) {
    console.error("Error in delete-all route:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
