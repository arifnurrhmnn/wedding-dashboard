import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export const DEFAULT_WA_TEMPLATE = `Assalamu'alaikum Wr. Wb.

Yth. *{nama} & Partner*

Dengan penuh rasa syukur dan tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/I untuk hadir dan turut merayakan hari bahagia pernikahan kami.

Untuk detail rangkaian acara, lokasi, serta informasi lain dapat diakses melalui tautan berikut ini.

Merupakan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberi doa restu. Mohon maaf jika undangan ini kami sampaikan secara digital.

Atas waktu dan perhatiannya, kami ucapkan terima kasih.

Wassalamu'alaikum Wr. Wb.`;

// GET - Ambil template WA milik user (atau default jika belum punya)
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data } = await supabase
      .from("wa_settings")
      .select("template_pesan, updated_at")
      .eq("user_id", user.id)
      .maybeSingle();

    return NextResponse.json({
      template_pesan: data?.template_pesan ?? DEFAULT_WA_TEMPLATE,
      is_custom: !!data,
      updated_at: data?.updated_at ?? null,
    });
  } catch (error) {
    console.error("Error fetching wa_settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch wa settings" },
      { status: 500 }
    );
  }
}

// PATCH - Simpan / update template WA
export async function PATCH(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { template_pesan } = await request.json();

    if (!template_pesan || typeof template_pesan !== "string") {
      return NextResponse.json(
        { error: "template_pesan wajib diisi" },
        { status: 400 }
      );
    }

    if (!template_pesan.includes("{nama}")) {
      return NextResponse.json(
        { error: "Template harus mengandung placeholder {nama} untuk nama tamu" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("wa_settings")
      .upsert(
        { user_id: user.id, template_pesan },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error saving wa_settings:", error);
    return NextResponse.json(
      { error: "Failed to save wa settings" },
      { status: 500 }
    );
  }
}
