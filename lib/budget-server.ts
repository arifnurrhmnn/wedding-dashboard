import { createHash } from "node:crypto";
import { getBudgetPaid, getBudgetStatus, normalizeBudgetCategoryName } from "./budget";

export class BudgetValidationError extends Error {}

export function budgetCategoryId(userId: string, name: string, attempt = 0): string {
  const hash = createHash("sha256")
    .update(`wedding-budget-category:${userId}:${normalizeBudgetCategoryName(name)}${attempt ? `:${attempt}` : ""}`)
    .digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export function availableBudgetCategoryId(
  userId: string,
  name: string,
  existing: { id: string; nama: string }[]
): string {
  let attempt = 0;
  let id = budgetCategoryId(userId, name, attempt);
  // A previously generated category may have been renamed. Preserve it and
  // choose a repeatable replacement ID instead of overwriting its data.
  while (existing.some((category) => category.id === id && normalizeBudgetCategoryName(category.nama) !== normalizeBudgetCategoryName(name))) {
    id = budgetCategoryId(userId, name, ++attempt);
  }
  return id;
}

export function budgetObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new BudgetValidationError("Data budget tidak valid");
  }
  return value as Record<string, unknown>;
}

export function budgetAmount(value: unknown, label: string): number {
  if ((typeof value !== "number" && typeof value !== "string") || value === "") {
    throw new BudgetValidationError(`${label} harus berupa nominal yang valid`);
  }
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new BudgetValidationError(`${label} harus berupa bilangan bulat positif atau nol`);
  }
  return amount;
}

export function budgetText(value: unknown, label: string, required = false): string | null {
  if (value === null && !required) return null;
  if (typeof value !== "string") {
    throw new BudgetValidationError(`${label} tidak valid`);
  }
  const text = value.trim();
  if (!text && required) throw new BudgetValidationError(`${label} wajib diisi`);
  return text || null;
}

function budgetDate(value: unknown, label: string): string | null {
  const date = budgetText(value, label);
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new BudgetValidationError(`${label} tidak valid`);
  }
  return date;
}

export function parseBudgetItem(
  value: unknown,
  existing?: Record<string, unknown>
): Record<string, unknown> {
  const body = budgetObject(value);
  const data: Record<string, unknown> = {};
  for (const key of ["category_id", "nama"] as const) {
    if (!existing || key in body) data[key] = budgetText(body[key], key === "nama" ? "Nama" : "Kategori", true);
  }
  for (const key of ["estimasi", "dp", "realisasi"] as const) {
    if (!existing || key in body) data[key] = budgetAmount(body[key] ?? 0, key);
  }
  for (const key of ["tanggal_dp", "tanggal_lunas", "tanggal_bayar"] as const) {
    if (key in body) data[key] = budgetDate(body[key], key);
    else if (!existing) data[key] = null;
  }
  for (const key of ["catatan", "vendor_id"] as const) {
    if (key in body) data[key] = budgetText(body[key], key);
    else if (!existing) data[key] = null;
  }
  if (!existing || ["estimasi", "dp", "realisasi"].some((key) => key in body)) {
    const combined = { ...existing, ...data };
    const amounts = {
      dp: Number(combined.dp) || 0,
      realisasi: Number(combined.realisasi) || 0,
      estimasi: Number(combined.estimasi) || 0,
    };
    data.realisasi = getBudgetPaid(amounts);
    data.status = getBudgetStatus(amounts);
  }
  return data;
}
