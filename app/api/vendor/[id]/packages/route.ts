import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { packageInput } from "../../_validation";

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
      .from("vendor_packages")
      .select("*")
      .eq("vendor_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id: vendor_id } = await params;
    const values = packageInput(await request.json());

    if (!values) {
      return NextResponse.json(
        { error: "Nama paket dan harga harus valid" },
        { status: 400 }
      );
    }

    const { data: vendor, error: vendorError } = await supabase.from("vendors")
      .select("id").eq("id", vendor_id).eq("user_id", user.id).maybeSingle();
    if (vendorError) throw vendorError;
    if (!vendor) return NextResponse.json({ error: "Vendor tidak ditemukan" }, { status: 404 });

    const { data, error } = await supabase
      .from("vendor_packages")
      .insert([
        {
          vendor_id,
          user_id: user.id,
          ...values,
          is_final: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    );
  }
}
