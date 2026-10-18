import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { InventoryValidationError, parseInventoryInput } from "@/lib/inventory-input";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id } = await params;
    const body = parseInventoryInput(await request.json(), "souvenir", "patch");

    const { data, error } = await supabase
      .from("souvenir")
      .update(body)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof InventoryValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error updating souvenir:", error);
    return NextResponse.json(
      { error: "Failed to update souvenir" },
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

    const { error } = await supabase.from("souvenir").delete().eq("id", id).eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof InventoryValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error deleting souvenir:", error);
    return NextResponse.json(
      { error: "Failed to delete souvenir" },
      { status: 500 }
    );
  }
}
