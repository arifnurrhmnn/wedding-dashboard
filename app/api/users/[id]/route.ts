import { requireActiveUser } from "@/lib/api-auth";
import {
  createSupabaseAdminClient,
  SupabaseAdminConfigurationError,
} from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

// PATCH - Update role user (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser({ adminOnly: true });
    if (auth.response) return auth.response;
    const { supabase, user } = auth;

    const { id } = await params;
    const { role, nama, status } = await request.json();

    if (nama !== undefined && (typeof nama !== "string" || !nama.trim())) {
      return NextResponse.json({ error: "Nama wajib berupa teks dan tidak boleh kosong" }, { status: 400 });
    }

    if (role !== undefined && !["admin", "client"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (
      status !== undefined &&
      !["pending", "active", "rejected"].includes(status)
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Jangan izinkan admin mengubah role dirinya sendiri
    if (role !== undefined && id === user.id) {
      return NextResponse.json(
        { error: "Tidak bisa mengubah role diri sendiri" },
        { status: 400 }
      );
    }

    // Bangun object update hanya field yang dikirim
    const updateData: Record<string, string> = {};
    if (role !== undefined) updateData.role = role;
    if (nama !== undefined && nama.trim() !== "") updateData.nama = nama.trim();
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada data untuk diupdate" },
        { status: 400 }
      );
    }

    // Update di profiles
    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating user role:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 }
    );
  }
}

// DELETE - Hapus user (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireActiveUser({ adminOnly: true });
    if (auth.response) return auth.response;
    const { user } = auth;

    const { id } = await params;

    // Jangan izinkan admin menghapus dirinya sendiri
    if (id === user.id) {
      return NextResponse.json(
        { error: "Tidak bisa menghapus akun sendiri" },
        { status: 400 }
      );
    }

    // Hapus user dari auth.users menggunakan service role
    const adminClient = createSupabaseAdminClient();
    const { error: authError } = await adminClient.auth.admin.deleteUser(id);

    if (authError) throw authError;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SupabaseAdminConfigurationError) {
      console.error("Delete user configuration error:", error.message);
      return NextResponse.json(
        { error: "Layanan penghapusan akun belum dikonfigurasi" },
        { status: 503 }
      );
    }

    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
