import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { InventoryValidationError, parseInventoryInput } from "@/lib/inventory-input";

export async function GET() {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from("seserahan")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof InventoryValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error fetching seserahan:", error);
    return NextResponse.json(
      { error: "Failed to fetch seserahan" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const body = parseInventoryInput(await request.json(), "seserahan", "create");
    const {
      nama_item,
      kategori,
      brand,
      status_pembelian,
      harga,
      link_marketplace,
      catatan,
      foto_url,
    } = body;

    if (!nama_item || !kategori) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("seserahan")
      .insert([
        {
          nama_item,
          kategori,
          brand,
          status_pembelian: status_pembelian || "Belum Dibeli",
          harga: harga || 0,
          link_marketplace,
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
    console.error("Error creating seserahan:", error);
    return NextResponse.json(
      { error: "Failed to create seserahan" },
      { status: 500 }
    );
  }
}
