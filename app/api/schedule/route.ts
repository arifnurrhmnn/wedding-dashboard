import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    let query = supabase
      .from("schedules")
      .select("*")
      .order("start_datetime", { ascending: true });

    // Filter by month if provided (format: YYYY-MM)
    if (month) {
      const [year, monthNum] = month.split("-");
      const startDate = `${year}-${monthNum}-01`;
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0)
        .toISOString()
        .split("T")[0];

      query = query
        .gte("start_datetime", startDate)
        .lte("start_datetime", endDate);
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
    const body = await request.json();
    const { title, start_datetime, end_datetime } = body;

    if (!title || !start_datetime) {
      return NextResponse.json(
        { error: "Missing required fields: title, start_datetime" },
        { status: 400 }
      );
    }

    // Validate end_datetime >= start_datetime
    if (end_datetime && new Date(end_datetime) < new Date(start_datetime)) {
      return NextResponse.json(
        { error: "End datetime must be after start datetime" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("schedules")
      .insert([
        {
          title,
          start_datetime,
          end_datetime: end_datetime || null,
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
