import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { vendorInput } from "./_validation";

export async function GET() {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("vendors")
      .select(`*, vendor_packages(*)`)
      .eq("user_id", user.id)
      .eq("vendor_packages.user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const values = vendorInput(await request.json());
    if (!values) {
      return NextResponse.json(
        { error: "Data vendor tidak valid; nama dan kategori wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("vendors")
      .insert([
        {
          user_id: user.id,
          ...values,
          status: values.status || "prospek",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to create vendor" },
      { status: 500 }
    );
  }
}
