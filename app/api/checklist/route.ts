import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { parseChecklistInput } from "@/lib/checklist";

export async function GET() {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("checklist")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching checklist:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklist" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const parsed = parseChecklistInput(await request.json());
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const {
      title,
      description,
      category,
      timeline_phase,
      due_date,
      status,
      priority,
    } = parsed.value;

    const { data, error } = await supabase
      .from("checklist")
      .insert([
        {
          title,
          description,
          category,
          timeline_phase,
          due_date,
          status: status || "todo",
          priority: priority || "medium",
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating checklist:", error);
    return NextResponse.json(
      { error: "Failed to create checklist" },
      { status: 500 }
    );
  }
}
