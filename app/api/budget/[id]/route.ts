import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    // Auto-compute status if not explicitly provided
    if (
      !body.status &&
      (body.dp !== undefined ||
        body.realisasi !== undefined ||
        body.estimasi !== undefined)
    ) {
      const dpVal = Number(body.dp) || 0;
      const realisasiVal = Number(body.realisasi) || 0;
      const estimasiVal = Number(body.estimasi) || 0;
      if (realisasiVal > 0 && estimasiVal > 0 && realisasiVal >= estimasiVal)
        body.status = "lunas";
      else if (dpVal > 0 || realisasiVal > 0) body.status = "dp";
      else body.status = "belum_bayar";
    }

    const { data, error } = await supabase
      .from("budget_items")
      .update({ ...body, updated_at: new Date().toISOString() })
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
  } catch {
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
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
