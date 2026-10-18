import {
  KATEGORI_OPTIONS,
  SKALA_PRIORITAS_OPTIONS,
  TIPE_UNDANGAN_OPTIONS,
} from "@/utils/constants";

export class GuestValidationError extends Error {}

export interface GuestMutation {
  nama?: string;
  kategori?: string;
  skala_prioritas?: string;
  tipe_undangan?: string;
  qty?: number;
  gift_type?: "uang" | "kado" | null;
  gift_value?: string | null;
  is_invited?: boolean;
}

export interface GuestGiftState {
  gift_type?: "uang" | "kado" | null;
  gift_value?: string | null;
}

const has = (value: object, key: string) =>
  Object.prototype.hasOwnProperty.call(value, key);

export function parseInvitationStatus(value: unknown): boolean {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  throw new GuestValidationError("is_invited harus true atau false");
}

function text(value: unknown, field: string): string {
  if (typeof value !== "string") {
    throw new GuestValidationError(`${field} harus berupa teks`);
  }
  return value.trim();
}

export function parseGuestMutation(
  value: unknown,
  mode: "create" | "patch" | "import"
): GuestMutation {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new GuestValidationError("Data tamu harus berupa objek");
  }
  const row = value as Record<string, unknown>;
  const data: GuestMutation = {};
  const allowed = new Set([
    "nama", "kategori", "skala_prioritas", "tipe_undangan", "qty",
    "gift_type", "gift_value", "is_invited",
  ]);
  if (mode !== "import" && Object.keys(row).some((key) => !allowed.has(key))) {
    throw new GuestValidationError("Data mengandung field yang tidak dapat diubah");
  }

  if (has(row, "nama")) data.nama = text(row.nama, "nama");
  if ((mode !== "patch" || has(row, "nama")) && !data.nama) {
    throw new GuestValidationError("Nama wajib diisi");
  }

  const enums = {
    kategori: KATEGORI_OPTIONS,
    skala_prioritas: SKALA_PRIORITAS_OPTIONS,
    tipe_undangan: TIPE_UNDANGAN_OPTIONS,
  };
  for (const field of Object.keys(enums) as Array<keyof typeof enums>) {
    if (!has(row, field)) {
      if (mode === "create") throw new GuestValidationError(`${field} wajib diisi`);
      continue;
    }
    const parsed = text(row[field], field);
    if (!parsed && mode === "import") {
      data[field] = "";
    } else if (enums[field].some((option) => option.value === parsed)) {
      data[field] = parsed;
    } else {
      throw new GuestValidationError(`${field} tidak valid`);
    }
  }

  if (has(row, "qty")) {
    const raw = row.qty;
    const amount = raw === "" && mode === "import" ? 1 :
      typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw;
    if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount < 1) {
      throw new GuestValidationError("qty harus bilangan bulat minimal 1");
    }
    data.qty = amount;
  }
  if (has(row, "gift_type")) {
    const type = row.gift_type;
    if (type === null || type === "") data.gift_type = null;
    else if (type === "uang" || type === "kado") data.gift_type = type;
    else throw new GuestValidationError("gift_type harus uang atau kado");
  }
  if (has(row, "gift_value")) {
    const raw = row.gift_value;
    if (raw === null || raw === "") data.gift_value = null;
    else if (typeof raw === "string" || (typeof raw === "number" && Number.isFinite(raw))) {
      data.gift_value = String(raw).trim() || null;
    } else throw new GuestValidationError("gift_value tidak valid");
  }
  if (data.gift_type === null) data.gift_value = null;
  if (data.gift_type === "uang" && data.gift_value != null) {
    const amount = Number(data.gift_value);
    if (!Number.isFinite(amount) || amount < 0) {
      throw new GuestValidationError("Nominal gift harus angka minimal 0");
    }
  }
  if (has(row, "is_invited")) {
    data.is_invited = parseInvitationStatus(row.is_invited);
  }
  if (mode === "patch" && Object.keys(data).length === 0) {
    throw new GuestValidationError("Tidak ada field untuk diubah");
  }
  return data;
}

/**
 * Validate gift fields after a partial mutation has been merged with its
 * stored state. Without this step, `{ gift_value: "-500" }` could bypass the
 * money validation because the request omitted `gift_type`.
 */
export function validateGuestGiftMutation(
  data: GuestMutation,
  current: GuestGiftState = {}
): GuestMutation {
  const changesType = has(data, "gift_type");
  const changesValue = has(data, "gift_value");
  if (!changesType && !changesValue) return data;

  if (changesType && data.gift_type === null) {
    return { ...data, gift_value: null };
  }

  const effectiveType = changesType
    ? data.gift_type ?? null
    : current.gift_type ?? null;
  const effectiveValue = changesValue
    ? data.gift_value ?? null
    : current.gift_value ?? null;

  if (effectiveType === null && effectiveValue !== null) {
    throw new GuestValidationError("Pilih tipe gift sebelum mengisi nilainya");
  }
  if (effectiveType === "uang" && effectiveValue !== null) {
    const amount = Number(effectiveValue);
    if (!Number.isFinite(amount) || amount < 0) {
      throw new GuestValidationError("Nominal gift harus angka minimal 0");
    }
  }

  return data;
}

export function parseGuestImportRow(value: unknown) {
  const data = parseGuestMutation(value, "import");
  const row = value as Record<string, unknown>;
  let uniqueId: string | undefined;
  if (has(row, "unique_id") && row.unique_id !== "" && row.unique_id != null) {
    uniqueId = text(row.unique_id, "unique_id");
    if (!/^INV-\d{6}$/.test(uniqueId)) {
      throw new GuestValidationError("Format unique_id tidak valid (harus INV-XXXXXX)");
    }
  }
  return { data, uniqueId };
}

export function newGuestImportValues(data: GuestMutation) {
  return {
    kategori: "", skala_prioritas: "", tipe_undangan: "", qty: 1,
    gift_type: null, gift_value: null, is_invited: false,
    ...data,
  };
}

export function guestExportRow(guest: {
  unique_id?: string;
  nama: string;
  kategori: string;
  skala_prioritas: string;
  tipe_undangan: string;
  qty: number;
  gift_type?: string | null;
  gift_value?: string | null;
  is_invited?: boolean | null;
}) {
  return {
    unique_id: guest.unique_id || "", nama: guest.nama, kategori: guest.kategori,
    skala_prioritas: guest.skala_prioritas, tipe_undangan: guest.tipe_undangan,
    qty: guest.qty, gift_type: guest.gift_type ?? "", gift_value: guest.gift_value ?? "",
    is_invited: guest.is_invited ? "true" : "false",
  };
}
