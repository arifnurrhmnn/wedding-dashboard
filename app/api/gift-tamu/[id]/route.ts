import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import {
  GuestValidationError,
  parseGuestMutation,
  validateGuestGiftMutation,
} from "@/lib/guest-import";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id } = await params;
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        Object.keys(body).some((field) => !["gift_type", "gift_value"].includes(field))) {
      throw new GuestValidationError("Data gift tidak valid");
    }
    const parsed = parseGuestMutation(body, "patch");
    const { data: existing, error: lookupError } = await supabase
      .from("tamu_undangan")
      .select("id, gift_type, gift_value")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (!existing) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    const gift = validateGuestGiftMutation(parsed, existing);

    const { data, error } = await supabase
      .from("tamu_undangan")
      .update(gift)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof GuestValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error updating gift:", error);
    return NextResponse.json(
      { error: "Failed to update gift" },
      { status: 500 }
    );
  }
}
