import { NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/api-auth";

export async function DELETE() {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    // First, count how many records will be deleted
    const { count, error: countError } = await supabase
      .from("tamu_undangan")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countError) {
      return NextResponse.json(
        { success: false, error: "Failed to count records" },
        { status: 500 }
      );
    }

    const { error: deleteError } = await supabase
      .from("tamu_undangan")
      .delete()
      .eq("user_id", user.id);

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
