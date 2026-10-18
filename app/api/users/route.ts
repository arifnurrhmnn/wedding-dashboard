import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";

// GET - Ambil semua users (admin only)
export async function GET() {
  try {
    const auth = await requireActiveUser({ adminOnly: true });
    if (auth.response) return auth.response;
    const { supabase } = auth;

    // Ambil semua profiles
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nama, email, role, avatar_url, status, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
