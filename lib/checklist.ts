import {
  CHECKLIST_CATEGORY_OPTIONS,
  CHECKLIST_TIMELINE_OPTIONS,
  CHECKLIST_STATUS_OPTIONS,
  CHECKLIST_PRIORITY_OPTIONS,
} from "@/utils/constants";

const enums = {
  category: CHECKLIST_CATEGORY_OPTIONS,
  timeline_phase: CHECKLIST_TIMELINE_OPTIONS,
  status: CHECKLIST_STATUS_OPTIONS,
  priority: CHECKLIST_PRIORITY_OPTIONS,
};

export function parseChecklistInput(input: unknown, partial = false):
  { value: Record<string, string | null>; error?: never } | { error: string; value?: never } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "Data task tidak valid" };
  const body = input as Record<string, unknown>;
  const allowed = ["title", "description", "category", "timeline_phase", "status", "priority", "due_date"];
  if (Object.keys(body).some((field) => !allowed.includes(field))) {
    return { error: "Data mengandung field task yang tidak dapat diubah" };
  }
  const value: Record<string, string | null> = {};
  if ("title" in body) {
    if (typeof body.title !== "string" || !body.title.trim()) return { error: "Judul task wajib diisi" };
    value.title = body.title.trim();
  } else if (!partial) return { error: "Judul task wajib diisi" };
  if ("description" in body) {
    if (body.description !== null && typeof body.description !== "string") return { error: "Deskripsi tidak valid" };
    value.description = body.description as string | null;
  }
  for (const [field, options] of Object.entries(enums)) {
    if (field in body) {
      if (!options.some((option) => option.value === body[field])) return { error: `${field} tidak valid` };
      value[field] = body[field] as string;
    }
  }
  if (!partial && (!value.category || !value.timeline_phase)) return { error: "Kategori dan fase wajib diisi" };
  if ("due_date" in body) {
    if (body.due_date === null || body.due_date === "") value.due_date = null;
    else {
      const date = typeof body.due_date === "string" ? body.due_date : "";
      const timestamp = Date.parse(`${date}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) {
        return { error: "Tanggal task tidak valid" };
      }
      value.due_date = date;
    }
  }
  if (!Object.keys(value).length) return { error: "Tidak ada field task untuk diperbarui" };
  return { value };
}
