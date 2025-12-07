import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data: guestsData } = body;

    if (!Array.isArray(guestsData) || guestsData.length === 0) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < guestsData.length; i++) {
      const guest = guestsData[i];

      // Validation
      if (!guest.nama || guest.nama.trim() === "") {
        errors.push({ row: i + 2, error: "Nama wajib diisi" });
        skipped++;
        continue;
      }

      try {
        // Check if unique_id exists and if record exists in DB
        if (guest.unique_id && guest.unique_id.trim() !== "") {
          // Validate unique_id format
          if (!/^INV-\d{6}$/.test(guest.unique_id)) {
            errors.push({
              row: i + 2,
              error: "Format unique_id tidak valid (harus INV-XXXXXX)",
            });
            skipped++;
            continue;
          }

          // Try to find existing record
          const { data: existing } = await supabase
            .from("tamu_undangan")
            .select("id")
            .eq("unique_id", guest.unique_id)
            .single();

          if (existing) {
            // Update existing record
            const { error: updateError } = await supabase
              .from("tamu_undangan")
              .update({
                nama: guest.nama,
                kategori: guest.kategori || "",
                skala_prioritas: guest.skala_prioritas || "",
                tipe_undangan: guest.tipe_undangan || "",
                qty: parseInt(guest.qty) || 1,
              })
              .eq("unique_id", guest.unique_id);

            if (updateError) {
              errors.push({ row: i + 2, error: updateError.message });
              skipped++;
            } else {
              updated++;
            }
          } else {
            // Insert new record with provided unique_id
            const { error: insertError } = await supabase
              .from("tamu_undangan")
              .insert({
                unique_id: guest.unique_id,
                nama: guest.nama,
                kategori: guest.kategori || "",
                skala_prioritas: guest.skala_prioritas || "",
                tipe_undangan: guest.tipe_undangan || "",
                qty: parseInt(guest.qty) || 1,
              });

            if (insertError) {
              errors.push({ row: i + 2, error: insertError.message });
              skipped++;
            } else {
              inserted++;
            }
          }
        } else {
          // Insert new record without unique_id (will be auto-generated)
          const { error: insertError } = await supabase
            .from("tamu_undangan")
            .insert({
              nama: guest.nama,
              kategori: guest.kategori || "",
              skala_prioritas: guest.skala_prioritas || "",
              tipe_undangan: guest.tipe_undangan || "",
              qty: parseInt(guest.qty) || 1,
            });

          if (insertError) {
            errors.push({ row: i + 2, error: insertError.message });
            skipped++;
          } else {
            inserted++;
          }
        }
      } catch (error) {
        errors.push({
          row: i + 2,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: guestsData.length,
        inserted,
        updated,
        skipped,
        errors,
      },
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        error: "Failed to import data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
