import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      category_id,
      nama,
      estimasi,
      realisasi,
      dp,
      tanggal_dp,
      tanggal_lunas,
      status,
      tanggal_bayar,
      catatan,
      vendor_id,
    } = body;

    if (!category_id || !nama) {
      return NextResponse.json(
        { error: "category_id dan nama wajib diisi" },
        { status: 400 }
      );
    }

    // Auto-compute status if not explicitly provided
    const dpVal = Number(dp) || 0;
    const realisasiVal = Number(realisasi) || 0;
    const estimasiVal = Number(estimasi) || 0;
    let computedStatus = status ?? "belum_bayar";
    if (!status) {
      if (realisasiVal > 0 && realisasiVal >= estimasiVal)
        computedStatus = "lunas";
      else if (dpVal > 0 || realisasiVal > 0) computedStatus = "dp";
      else computedStatus = "belum_bayar";
    }

    const { data, error } = await supabase
      .from("budget_items")
      .insert([
        {
          user_id: user.id,
          category_id,
          nama,
          estimasi: estimasiVal,
          realisasi: realisasiVal,
          dp: dpVal,
          tanggal_dp: tanggal_dp || null,
          tanggal_lunas: tanggal_lunas || null,
          status: computedStatus,
          tanggal_bayar: tanggal_bayar || null,
          catatan: catatan || null,
          vendor_id: vendor_id || null,
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
  } catch {
    return NextResponse.json(
      { error: "Failed to create budget item" },
      { status: 500 }
    );
  }
}
