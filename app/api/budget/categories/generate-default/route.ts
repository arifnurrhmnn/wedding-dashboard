import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const DEFAULT_CATEGORIES = [
  { nama: "Venue & Gedung", icon: "🏛️", urutan: 0 },
  { nama: "Katering & Konsumsi", icon: "🍽️", urutan: 1 },
  { nama: "Foto & Video", icon: "📸", urutan: 2 },
  { nama: "Dekorasi & Florist", icon: "💐", urutan: 3 },
  { nama: "Busana & Makeup", icon: "👗", urutan: 4 },
  { nama: "Entertainment & Musik", icon: "🎵", urutan: 5 },
  { nama: "Undangan & Souvenir", icon: "💌", urutan: 6 },
  { nama: "Seserahan", icon: "🎁", urutan: 7 },
  { nama: "Administrasi & Dokumen", icon: "📄", urutan: 8 },
  { nama: "Transportasi", icon: "🚗", urutan: 9 },
  { nama: "Pakaian Keluarga Inti", icon: "👔", urutan: 10 },
  { nama: "Lain-lain", icon: "🔆", urutan: 11 },
];

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: user.id }));

    const { data, error } = await supabase
      .from("budget_categories")
      .insert(rows)
      .select();

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate default categories" },
      { status: 500 }
    );
  }
}
