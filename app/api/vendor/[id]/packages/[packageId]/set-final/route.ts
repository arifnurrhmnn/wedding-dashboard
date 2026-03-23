import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

// POST: set paket ini sebagai final, reset is_final lainnya dalam vendor yang sama
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; packageId: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: vendor_id, packageId } = await params;

    // Reset semua paket vendor ini jadi bukan final
    await supabase
      .from("vendor_packages")
      .update({ is_final: false })
      .eq("vendor_id", vendor_id);

    // Set paket ini sebagai final
    const { data, error } = await supabase
      .from("vendor_packages")
      .update({ is_final: true })
      .eq("id", packageId)
      .select()
      .single();

    if (error) throw error;

    // Update status vendor jadi "deal"
    await supabase
      .from("vendors")
      .update({ status: "deal" })
      .eq("id", vendor_id);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to set final package" },
      { status: 500 }
    );
  }
}
