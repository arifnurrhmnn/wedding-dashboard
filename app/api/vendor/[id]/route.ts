import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { vendorInput } from "../_validation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id } = await params;

    const { data, error } = await supabase
      .from("vendors")
      .select(
        `*, vendor_packages(*), vendor_activity_logs(*), vendor_documents(*)`
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .eq("vendor_packages.user_id", user.id)
      .eq("vendor_activity_logs.user_id", user.id)
      .eq("vendor_documents.user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Vendor tidak ditemukan" }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch vendor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id } = await params;
    const values = vendorInput(await request.json(), true);
    if (!values) return NextResponse.json({ error: "Data vendor tidak valid" }, { status: 400 });

    const { data, error } = await supabase
      .from("vendors")
      .update(values)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Vendor tidak ditemukan" }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to update vendor" },
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

    const { data, error } = await supabase.from("vendors").delete().eq("id", id).eq("user_id", user.id).select("id").maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Vendor tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete vendor" },
      { status: 500 }
    );
  }
}
