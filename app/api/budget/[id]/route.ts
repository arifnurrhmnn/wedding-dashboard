import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { BudgetValidationError, parseBudgetItem } from "@/lib/budget-server";

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
    const { data: existing, error: existingError } = await supabase
      .from("budget_items")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (existingError) throw existingError;
    if (!existing) {
      return NextResponse.json({ error: "Item tidak ditemukan" }, { status: 404 });
    }
    const updates = parseBudgetItem(body, existing);
    if (updates.category_id) {
      const { data: category, error: categoryError } = await supabase
        .from("budget_categories")
        .select("id")
        .eq("id", updates.category_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (categoryError) throw categoryError;
      if (!category) {
        return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 400 });
      }
    }
    if (updates.vendor_id) {
      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .select("id")
        .eq("id", updates.vendor_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (vendorError) throw vendorError;
      if (!vendor) {
        return NextResponse.json({ error: "Vendor tidak ditemukan" }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from("budget_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*, vendors(nama)")
      .single();

    if (error) throw error;

    const vendors = (data as Record<string, unknown>).vendors as {
      nama?: string;
    } | null;
    return NextResponse.json({
      ...data,
      vendor_nama: vendors?.nama ?? null,
      vendors: undefined,
    });
  } catch (error) {
    if (error instanceof BudgetValidationError || error instanceof SyntaxError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update budget item" },
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
    const { error } = await supabase
      .from("budget_items")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete budget item" },
      { status: 500 }
    );
  }
}
