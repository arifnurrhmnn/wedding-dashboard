import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { parseScheduleInput, parseScheduleRange } from "@/lib/schedule";

export async function GET(request: Request) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { searchParams } = new URL(request.url);
    const range = parseScheduleRange(searchParams);
    if ("error" in range) return NextResponse.json({ error: range.error }, { status: 400 });

    let query = supabase
      .from("schedules")
      .select("*")
      .eq("user_id", user.id)
      .order("start_datetime", { ascending: true });

    if (range.value) {
      query = query
        .gte("start_datetime", range.value.start)
        .lt("start_datetime", range.value.end);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      { error: "Failed to fetch schedules" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const parsed = parseScheduleInput(await request.json());
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const { title, start_datetime, end_datetime } = parsed.value;

    const { data, error } = await supabase
      .from("schedules")
      .insert([
        {
          title,
          start_datetime,
          end_datetime: end_datetime || null,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating schedule:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
