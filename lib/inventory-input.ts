import {
  SESERAHAN_KATEGORI_OPTIONS,
  SESERAHAN_STATUS_OPTIONS,
  SOUVENIR_STATUS_OPTIONS,
} from "@/utils/constants";

export class InventoryValidationError extends Error {}

export function parseInventoryInput(
  value: unknown,
  kind: "seserahan" | "souvenir",
  mode: "create" | "patch"
): Record<string, string | number | null> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new InventoryValidationError("Data harus berupa objek");
  }
  const row = value as Record<string, unknown>;
  const required = kind === "seserahan" ? ["nama_item", "kategori"] : ["nama_souvenir", "jumlah"];
  const textFields = kind === "seserahan"
    ? ["nama_item", "kategori", "brand", "status_pembelian", "link_marketplace", "catatan", "foto_url"]
    : ["nama_souvenir", "vendor", "status_pengadaan", "catatan", "foto_url"];
  const numberFields = kind === "seserahan" ? ["harga"] : ["jumlah", "harga_per_item"];
  const allowed = [...textFields, ...numberFields];
  if (Object.keys(row).some((field) => !allowed.includes(field))) {
    throw new InventoryValidationError("Data mengandung field yang tidak dapat diubah");
  }
  if (mode === "create" && required.some((field) => !Object.prototype.hasOwnProperty.call(row, field))) {
    throw new InventoryValidationError("Field wajib belum lengkap");
  }

  const data: Record<string, string | number | null> = {};
  for (const [field, raw] of Object.entries(row)) {
    if (numberFields.includes(field)) {
      if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0 ||
          (field === "jumlah" && (!Number.isSafeInteger(raw) || raw < 1))) {
        throw new InventoryValidationError(`${field} harus angka valid${field === "jumlah" ? " minimal 1" : " minimal 0"}`);
      }
      data[field] = raw;
      continue;
    }
    if (raw !== null && typeof raw !== "string") {
      throw new InventoryValidationError(`${field} harus berupa teks`);
    }
    const parsed = typeof raw === "string" ? raw.trim() : null;
    if (required.includes(field) && !parsed) {
      throw new InventoryValidationError(`${field} wajib diisi`);
    }
    const options = field === "kategori" ? SESERAHAN_KATEGORI_OPTIONS :
      field === "status_pembelian" ? SESERAHAN_STATUS_OPTIONS :
      field === "status_pengadaan" ? SOUVENIR_STATUS_OPTIONS : null;
    if (options && !options.some((option) => option.value === parsed)) {
      throw new InventoryValidationError(`${field} tidak valid`);
    }
    if ((field === "link_marketplace" || field === "foto_url") && parsed) {
      try {
        if (!["http:", "https:"].includes(new URL(parsed).protocol)) throw new Error();
      } catch {
        throw new InventoryValidationError(`${field} harus URL http atau https`);
      }
    }
    data[field] = parsed || null;
  }
  if (mode === "patch" && Object.keys(data).length === 0) {
    throw new InventoryValidationError("Tidak ada field untuk diubah");
  }
  return data;
}
