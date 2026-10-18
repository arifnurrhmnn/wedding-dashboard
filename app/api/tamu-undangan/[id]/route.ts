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
    const parsed = parseGuestMutation(await request.json(), "patch");
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

    const body = validateGuestGiftMutation(parsed, existing);

    const { data, error } = await supabase
      .from("tamu_undangan")
      .update(body)
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
    console.error("Error updating guest:", error);
    return NextResponse.json(
      { error: "Failed to update guest" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id } = await params;

    const { error } = await supabase
      .from("tamu_undangan")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting guest:", error);
    return NextResponse.json(
      { error: "Failed to delete guest" },
      { status: 500 }
    );
  }
}
