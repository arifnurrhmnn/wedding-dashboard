import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import {
  GuestValidationError,
  parseGuestMutation,
  validateGuestGiftMutation,
} from "@/lib/guest-import";

export async function GET() {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("tamu_undangan")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching guests:", error);
    return NextResponse.json(
      { error: "Failed to fetch guests" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const body = validateGuestGiftMutation(
      parseGuestMutation(await request.json(), "create")
    );
    const {
      nama,
      kategori,
      skala_prioritas,
      tipe_undangan,
      qty,
      gift_type,
      gift_value,
      is_invited,
    } = body;

    if (!nama || !kategori || !skala_prioritas || !tipe_undangan) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("tamu_undangan")
      .insert([
        {
          nama,
          kategori,
          skala_prioritas,
          tipe_undangan,
          qty: qty ?? 1,
          gift_type: gift_type ?? null,
          gift_value: gift_value ?? null,
          is_invited: is_invited ?? false,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof GuestValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating guest:", error);
    return NextResponse.json(
      { error: "Failed to create guest" },
      { status: 500 }
    );
  }
}
