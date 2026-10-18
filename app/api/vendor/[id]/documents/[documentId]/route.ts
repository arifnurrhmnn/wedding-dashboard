import { requireActiveUser } from "@/lib/api-auth";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const auth = await requireActiveUser();
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id: vendorId, documentId } = await params;

    const { data, error } = await supabase
      .from("vendor_documents")
      .delete()
      .eq("id", documentId)
      .eq("vendor_id", vendorId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
