import { createSupabaseServerClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from("budget_categories")
      .update({ nama: body.nama, icon: body.icon })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // check if category has items
    const { count } = await supabase
      .from("budget_items")
      .select("*", { count: "exact", head: true })
      .eq("category_id", id)
      .eq("user_id", user.id);

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: "Tidak bisa menghapus kategori yang masih memiliki item" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("budget_categories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
