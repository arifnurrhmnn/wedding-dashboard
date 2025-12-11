import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { DEFAULT_CHECKLIST_TEMPLATE } from "@/utils/constants";

export async function POST() {
  try {
    // Check if template already exists
    const { data: existing, error: checkError } = await supabase
      .from("checklist")
      .select("id")
      .limit(1);

    if (checkError) throw checkError;

    // If tasks already exist, don't generate template
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Template already generated" },
        { status: 400 }
      );
    }

    // Generate template
    const { data, error } = await supabase
      .from("checklist")
      .insert(DEFAULT_CHECKLIST_TEMPLATE)
      .select();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error generating template:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    );
  }
}
