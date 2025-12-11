import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { DEFAULT_CHECKLIST_TEMPLATE } from "@/utils/constants";

export async function POST() {
  try {
    // Fetch all existing tasks
    const { data: existingTasks, error: fetchError } = await supabase
      .from("checklist")
      .select("title, category, timeline_phase");

    if (fetchError) throw fetchError;

    // Create a Set of existing task signatures for efficient lookup
    const existingTaskSignatures = new Set(
      (existingTasks || []).map(
        (task) =>
          `${task.title.toLowerCase().trim()}|${task.category}|${
            task.timeline_phase
          }`
      )
    );

    // Filter out tasks that already exist
    const newTasks = DEFAULT_CHECKLIST_TEMPLATE.filter((template) => {
      const signature = `${template.title.toLowerCase().trim()}|${
        template.category
      }|${template.timeline_phase}`;
      return !existingTaskSignatures.has(signature);
    });

    // If no new tasks to add, return early
    if (newTasks.length === 0) {
      return NextResponse.json({
        addedCount: 0,
        message: "All template tasks already exist",
      });
    }

    // Insert only new tasks
    const { data, error } = await supabase
      .from("checklist")
      .insert(newTasks)
      .select();

    if (error) throw error;

    return NextResponse.json({
      addedCount: data?.length || 0,
      tasks: data,
    });
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}
