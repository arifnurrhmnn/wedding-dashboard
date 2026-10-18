import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";

// POST: set paket ini sebagai final, reset is_final lainnya dalam vendor yang sama
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; packageId: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase } = auth;

    const { id: vendor_id, packageId } = await params;

    const { data, error } = await supabase.rpc("set_vendor_final_package", {
      p_vendor_id: vendor_id,
      p_package_id: packageId,
    }).single();

    if (error) {
      if (error.code === "42501") return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
      if (error.code === "P0002") return NextResponse.json({ error: "Vendor atau paket tidak ditemukan" }, { status: 404 });
      if (error.code === "22023") return NextResponse.json({ error: "Vendor yang dibatalkan tidak dapat memilih paket final" }, { status: 400 });
      if (error.code === "PGRST202" || error.code === "42883") return NextResponse.json({ error: "Layanan paket final belum tersedia" }, { status: 503 });
      throw error;
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to set final package" },
      { status: 500 }
    );
  }
}
