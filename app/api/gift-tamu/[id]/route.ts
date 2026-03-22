import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { gift_type, gift_value } = body;

    const { data, error } = await supabase
      .from("tamu_undangan")
      .update({ gift_type: gift_type ?? null, gift_value: gift_value ?? null })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating gift:", error);
    return NextResponse.json(
      { error: "Failed to update gift" },
      { status: 500 }
    );
  }
}
