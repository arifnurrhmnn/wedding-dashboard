import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("seserahan")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching seserahan:", error);
    return NextResponse.json(
      { error: "Failed to fetch seserahan" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating seserahan:", error);
    return NextResponse.json(
      { error: "Failed to create seserahan" },
      { status: 500 }
    );
  }
}
