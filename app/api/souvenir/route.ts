import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { InventoryValidationError, parseInventoryInput } from "@/lib/inventory-input";

export async function GET() {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("souvenir")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof InventoryValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error fetching souvenir:", error);
    return NextResponse.json(
      { error: "Failed to fetch souvenir" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const body = parseInventoryInput(await request.json(), "souvenir", "create");
    const {
      nama_souvenir,
      jumlah,
      vendor,
      status_pengadaan,
      harga_per_item,
      catatan,
      foto_url,
    } = body;

    if (!nama_souvenir || jumlah === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("souvenir")
      .insert([
        {
          nama_souvenir,
          jumlah,
          vendor,
          status_pengadaan: status_pengadaan || "Belum Dibeli",
          harga_per_item: harga_per_item || 0,
          catatan,
          foto_url,
          user_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof InventoryValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating souvenir:", error);
    return NextResponse.json(
      { error: "Failed to create souvenir" },
      { status: 500 }
    );
  }
}
