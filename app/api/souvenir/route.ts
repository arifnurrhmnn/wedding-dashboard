import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("souvenir")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching souvenir:", error);
    return NextResponse.json(
      { error: "Failed to fetch souvenir" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error creating souvenir:", error);
    return NextResponse.json(
      { error: "Failed to create souvenir" },
      { status: 500 }
    );
  }
}
