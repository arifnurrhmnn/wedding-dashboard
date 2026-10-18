const VENDOR_FIELDS = [
  "nama", "kategori", "kontak_nama", "kontak_wa", "kontak_email", "website",
  "instagram", "alamat", "catatan", "status", "rating",
] as const;
const PACKAGE_FIELDS = ["nama_paket", "deskripsi", "harga"] as const;

export function vendorInput(body: unknown, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const source = body as Record<string, unknown>;
  const values = Object.fromEntries(VENDOR_FIELDS.filter((key) => key in source).map((key) => [key, source[key]]));
  if (!partial && (!values.nama || !values.kategori)) return null;
  if (!Object.keys(values).length) return null;
  for (const [key, value] of Object.entries(values)) {
    if (key === "rating") {
      if (value !== null && (!Number.isInteger(value) || Number(value) < 1 || Number(value) > 5)) return null;
    } else if (typeof value !== "string" || ((key === "nama" || key === "kategori") && !value.trim())) {
      return null;
    }
  }
  if (values.status !== undefined && !["prospek", "negosiasi", "deal", "batal"].includes(String(values.status))) return null;
  return values;
}

export function packageInput(body: unknown, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const source = body as Record<string, unknown>;
  const values = Object.fromEntries(PACKAGE_FIELDS.filter((key) => key in source).map((key) => [key, source[key]]));
  if (!partial && (!values.nama_paket || values.harga === undefined)) return null;
  if (!Object.keys(values).length) return null;
  if (values.nama_paket !== undefined && (typeof values.nama_paket !== "string" || !values.nama_paket.trim())) return null;
  if (values.deskripsi !== undefined && typeof values.deskripsi !== "string") return null;
  if (values.harga !== undefined && (typeof values.harga !== "number" || !Number.isSafeInteger(values.harga) || values.harga < 0)) return null;
  return values;
}
