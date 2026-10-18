import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { BudgetValidationError, budgetAmount, budgetObject, budgetText } from "@/lib/budget-server";

export async function GET() {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("budget_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch budget settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const body = budgetObject(await request.json());
    const total_budget = budgetAmount(body.total_budget, "Total budget");
    const catatan = "catatan" in body ? budgetText(body.catatan, "Catatan") : undefined;

    const { data, error } = await supabase
      .from("budget_settings")
      .upsert(
        {
          user_id: user.id,
          total_budget,
          catatan,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof BudgetValidationError || error instanceof SyntaxError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update budget settings" },
      { status: 500 }
    );
  }
}
