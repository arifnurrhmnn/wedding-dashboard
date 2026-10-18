export function localDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function localMonthRange(year: number, month: number) {
  return {
    start: new Date(year, month, 1).toISOString(),
    end: new Date(year, month + 1, 1).toISOString(),
  };
}

export function utcMonthRange(month: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return null;
  const [year, monthNumber] = month.split("-").map(Number);
  if (year < 100 || year > 9998) return null;
  return {
    start: new Date(Date.UTC(year, monthNumber - 1, 1)).toISOString(),
    end: new Date(Date.UTC(year, monthNumber, 1)).toISOString(),
  };
}

export interface ScheduleFields {
  title: string;
  start_datetime: string;
  end_datetime: string | null;
}

export function isTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parts = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.exec(value);
  if (!parts || !Number.isFinite(Date.parse(value))) return false;
  const day = new Date(`${parts[1]}T00:00:00Z`);
  return Number.isFinite(day.getTime()) && day.toISOString().slice(0, 10) === parts[1];
}

export function parseScheduleRange(params: URLSearchParams):
  { value?: { start: string; end: string }; error?: never } | { error: string; value?: never } {
  const start = params.get("start");
  const end = params.get("end");
  if (start !== null || end !== null) {
    if (!isTimestamp(start) || !isTimestamp(end) || Date.parse(start) >= Date.parse(end)) {
      return { error: "Rentang jadwal harus berisi waktu mulai dan akhir yang valid dengan zona waktu" };
    }
    return { value: { start: new Date(start).toISOString(), end: new Date(end).toISOString() } };
  }
  const month = params.get("month");
  if (month === null) return {};
  const range = utcMonthRange(month);
  return range ? { value: range } : { error: "Bulan harus berformat YYYY-MM yang valid" };
}

export function parseScheduleInput(
  input: unknown,
  existing?: ScheduleFields
): { value: Partial<ScheduleFields>; error?: never } | { error: string; value?: never } {
  if (!input || typeof input !== "object" || Array.isArray(input)) return { error: "Data jadwal tidak valid" };
  const body = input as Record<string, unknown>;
  if (Object.keys(body).some((field) => !["title", "start_datetime", "end_datetime"].includes(field))) {
    return { error: "Data mengandung field jadwal yang tidak dapat diubah" };
  }
  const value: Partial<ScheduleFields> = {};
  if ("title" in body) {
    if (typeof body.title !== "string" || !body.title.trim()) return { error: "Judul wajib diisi" };
    value.title = body.title.trim();
  }
  if ("start_datetime" in body) {
    if (!isTimestamp(body.start_datetime)) return { error: "Waktu mulai harus valid dan menyertakan zona waktu" };
    value.start_datetime = new Date(body.start_datetime).toISOString();
  }
  if ("end_datetime" in body) {
    if (body.end_datetime === null || body.end_datetime === "") value.end_datetime = null;
    else if (isTimestamp(body.end_datetime)) value.end_datetime = new Date(body.end_datetime).toISOString();
    else return { error: "Waktu selesai harus valid dan menyertakan zona waktu" };
  }
  const merged = { ...existing, ...value };
  if (!merged.title || !merged.start_datetime) return { error: "Judul dan waktu mulai wajib diisi" };
  if (merged.end_datetime && Date.parse(merged.end_datetime) < Date.parse(merged.start_datetime)) {
    return { error: "Waktu selesai harus setelah waktu mulai" };
  }
  if (!Object.keys(value).length) return { error: "Tidak ada field jadwal untuk diperbarui" };
  return { value };
}
