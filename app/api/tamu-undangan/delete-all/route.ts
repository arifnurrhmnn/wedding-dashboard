import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function DELETE() {
  try {
    // First, count how many records will be deleted
    const { count, error: countError } = await supabase
      .from("tamu_undangan")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error counting records:", countError);
      return NextResponse.json(
        { success: false, error: "Failed to count records" },
        { status: 500 }
      );
    }

    // Delete all records
    const { error: deleteError } = await supabase
      .from("tamu_undangan")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all by using a condition that matches everything

    if (deleteError) {
      console.error("Error deleting all guests:", deleteError);
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
