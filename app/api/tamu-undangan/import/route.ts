import { NextRequest, NextResponse } from "next/server";
import { requireActiveUser } from "@/lib/api-auth";
import {
  newGuestImportValues,
  parseGuestImportRow,
  validateGuestGiftMutation,
} from "@/lib/guest-import";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;
    const body = await request.json();
    const guestsData = body?.data;
    if (!Array.isArray(guestsData) || guestsData.length === 0) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 0; i < guestsData.length; i++) {
      try {
        const { data, uniqueId } = parseGuestImportRow(guestsData[i]);
        let existing: {
          id: string;
          gift_type: "uang" | "kado" | null;
          gift_value: string | null;
        } | null = null;
        if (uniqueId) {
          const lookup = await supabase
            .from("tamu_undangan")
            .select("id, gift_type, gift_value")
            .eq("user_id", user.id)
            .eq("unique_id", uniqueId)
            .maybeSingle();
          if (lookup.error) throw lookup.error;
          existing = lookup.data;
        }

        if (existing) {
          // Absent CSV columns leave their stored values untouched.
          const update = validateGuestGiftMutation(data, existing);
          const { error } = await supabase
            .from("tamu_undangan")
            .update(update)
            .eq("user_id", user.id)
            .eq("id", existing.id);
          if (error) throw error;
          updated++;
        } else {
          const insert = newGuestImportValues(validateGuestGiftMutation(data));
          const { error } = await supabase.from("tamu_undangan").insert({
            ...insert,
            ...(uniqueId ? { unique_id: uniqueId } : {}),
            user_id: user.id,
          });
          if (error) throw error;
          inserted++;
        }
      } catch (error) {
        errors.push({
          row: i + 2,
          error:
            error && typeof error === "object" && "message" in error
              ? String(error.message)
              : "Unknown error",
        });
        skipped++;
      }
    }

    return NextResponse.json({
      success: true,
      summary: { total: guestsData.length, inserted, updated, skipped, errors },
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import data" }, { status: 500 });
  }
}
