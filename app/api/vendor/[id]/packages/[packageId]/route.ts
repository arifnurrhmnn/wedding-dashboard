import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { packageInput } from "../../../_validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; packageId: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id: vendorId, packageId } = await params;
    const values = packageInput(await request.json(), true);
    if (!values) return NextResponse.json({ error: "Data paket tidak valid" }, { status: 400 });

    const { data, error } = await supabase
      .from("vendor_packages")
      .update(values)
      .eq("id", packageId)
      .eq("vendor_id", vendorId)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to update package" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; packageId: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id: vendorId, packageId } = await params;

    const { data, error } = await supabase
      .from("vendor_packages")
      .delete()
      .eq("id", packageId)
      .eq("vendor_id", vendorId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete package" },
      { status: 500 }
    );
  }
}
