import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("tamu_undangan")
      .select("id")
      .limit(1);

    if (error) throw error;

    return Response.json({ status: "ok" });
  } catch (error) {
    console.error("[keep-alive] error:", error);
    return Response.json({ status: "error" }, { status: 500 });
  }
}
