import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { BudgetValidationError, budgetObject, budgetText } from "@/lib/budget-server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id } = await params;
    const body = budgetObject(await request.json());
    const updates: Record<string, string> = {};
    if ("nama" in body) updates.nama = budgetText(body.nama, "Nama", true)!;
    if ("icon" in body) updates.icon = budgetText(body.icon, "Ikon", true)!;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Tidak ada perubahan kategori" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("budget_categories")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof BudgetValidationError || error instanceof SyntaxError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id } = await params;

    // check if category has items
    const { count, error: countError } = await supabase
      .from("budget_items")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id)
      .eq("user_id", user.id);
    if (countError) throw countError;

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: "Tidak bisa menghapus kategori yang masih memiliki item" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("budget_categories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
