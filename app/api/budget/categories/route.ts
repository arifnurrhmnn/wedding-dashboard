import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { BudgetValidationError, availableBudgetCategoryId, budgetAmount, budgetObject, budgetText } from "@/lib/budget-server";
import { getLinkedBudgetModule, normalizeBudgetCategoryName } from "@/lib/budget";

export async function GET() {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("user_id", user.id)
      .order("urutan", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const body = budgetObject(await request.json());
    let nama = budgetText(body.nama, "Nama", true)!;
    const linkedModule = getLinkedBudgetModule(nama);
    if (linkedModule) nama = linkedModule === "seserahan" ? "Seserahan" : "Souvenir";
    const icon = body.icon == null ? "💰" : budgetText(body.icon, "Ikon", true)!;
    const { data: existingCategories, error: existingError } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("user_id", user.id);
    if (existingError) throw existingError;
    const existing = (existingCategories ?? [])
      .filter((category) => normalizeBudgetCategoryName(category.nama) === normalizeBudgetCategoryName(nama))
      .sort((a, b) => a.id.localeCompare(b.id))[0];
    if (existing) return NextResponse.json(existing);

    // get max urutan if not provided
    const order = body.urutan === undefined
      ? Math.max(-1, ...(existingCategories ?? []).map((category) => category.urutan ?? 0)) + 1
      : budgetAmount(body.urutan, "Urutan");
    const id = availableBudgetCategoryId(user.id, nama, existingCategories ?? []);
    const { error: insertError } = await supabase
      .from("budget_categories")
      .upsert([{ id, user_id: user.id, nama, icon, urutan: order }], {
        onConflict: "id",
        ignoreDuplicates: true,
      });
    if (insertError) throw insertError;

    const { data, error } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof BudgetValidationError || error instanceof SyntaxError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
