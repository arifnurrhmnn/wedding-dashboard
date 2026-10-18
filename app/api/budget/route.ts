import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { BudgetValidationError, parseBudgetItem } from "@/lib/budget-server";

export async function GET() {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("budget_items")
      .select("*, vendors(nama)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // flatten vendor name
    const items = (data ?? []).map((item: Record<string, unknown>) => {
      const vendors = item.vendors as { nama?: string } | null;
      return {
        ...item,
        vendor_nama: vendors?.nama ?? null,
        vendors: undefined,
      };
    });

    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch budget items" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const item = parseBudgetItem(await request.json());
    const { data: category, error: categoryError } = await supabase
      .from("budget_categories")
      .select("id")
      .eq("id", item.category_id)
      .eq("user_id", user.id)
      .maybeSingle();
    if (categoryError) throw categoryError;
    if (!category) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 400 });
    }
    if (item.vendor_id) {
      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .select("id")
        .eq("id", item.vendor_id)
        .eq("user_id", user.id)
        .maybeSingle();
      if (vendorError) throw vendorError;
      if (!vendor) {
        return NextResponse.json({ error: "Vendor tidak ditemukan" }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from("budget_items")
      .insert([
        {
          user_id: user.id,
          ...item,
        },
      ])
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
      { error: "Failed to create budget item" },
      { status: 500 }
    );
  }
}
