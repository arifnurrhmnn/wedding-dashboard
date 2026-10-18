import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { availableBudgetCategoryId } from "@/lib/budget-server";
import { normalizeBudgetCategoryName } from "@/lib/budget";

const DEFAULT_CATEGORIES = [
  { nama: "Venue & Gedung", icon: "🏛️", urutan: 0 },
  { nama: "Katering & Konsumsi", icon: "🍽️", urutan: 1 },
  { nama: "Foto & Video", icon: "📸", urutan: 2 },
  { nama: "Dekorasi & Florist", icon: "💐", urutan: 3 },
  { nama: "Busana & Makeup", icon: "👗", urutan: 4 },
  { nama: "Entertainment & Musik", icon: "🎵", urutan: 5 },
  { nama: "Undangan", icon: "💌", urutan: 6 },
  { nama: "Administrasi & Dokumen", icon: "📄", urutan: 7 },
  { nama: "Transportasi", icon: "🚗", urutan: 8 },
  { nama: "Pakaian Keluarga Inti", icon: "👔", urutan: 9 },
  { nama: "Lain-lain", icon: "🔆", urutan: 10 },
  { nama: "Seserahan", icon: "🎁", urutan: 11 },
  { nama: "Souvenir", icon: "🎀", urutan: 12 },
];

export async function POST() {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { data: existing, error: existingError } = await supabase
      .from("budget_categories")
      .select("id, nama")
      .eq("user_id", user.id);
    if (existingError) throw existingError;
    const names = new Set((existing ?? []).map((category) => normalizeBudgetCategoryName(category.nama)));
    const rows = DEFAULT_CATEGORIES
      .filter((category) => !names.has(normalizeBudgetCategoryName(category.nama)))
      .map((category) => ({
        ...category,
        id: availableBudgetCategoryId(user.id, category.nama, existing ?? []),
        user_id: user.id,
      }));
    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from("budget_categories")
        .upsert(rows, { onConflict: "id", ignoreDuplicates: true });
      if (insertError) throw insertError;
    }

    const { data, error } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("user_id", user.id)
      .order("urutan", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate default categories" },
      { status: 500 }
    );
  }
}
