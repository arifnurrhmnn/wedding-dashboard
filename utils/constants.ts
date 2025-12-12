export const KATEGORI_OPTIONS = [
  { value: "Keluarga Inti", label: "Keluarga Inti" },
  { value: "Keluarga Besar", label: "Keluarga Besar" },
  { value: "Teman", label: "Teman" },
  { value: "Tetangga", label: "Tetangga" },
  { value: "Tamu Orang Tua", label: "Tamu Orang Tua" },
];

export const SKALA_PRIORITAS_OPTIONS = [
  { value: "Wajib Hadir", label: "Wajib Hadir" },
  { value: "Penting", label: "Penting" },
  { value: "Cadangan", label: "Cadangan" },
];

export const TIPE_UNDANGAN_OPTIONS = [
  { value: "Digital", label: "Digital" },
  { value: "Cetak", label: "Cetak" },
  { value: "Kabar", label: "Kabar" },
];

export const LOGIN_CREDENTIALS = {
  username: "admin",
  password: "admin",
};

// Seserahan Options
export const SESERAHAN_KATEGORI_OPTIONS = [
  { value: "Perlengkapan Ibadah", label: "Perlengkapan Ibadah" },
  { value: "Body Care", label: "Body Care" },
  { value: "Skin Care", label: "Skin Care" },
  { value: "Hair Care", label: "Hair Care" },
  { value: "Make Up", label: "Make Up" },
  { value: "Toiletries", label: "Toiletries" },
  { value: "Pakaian", label: "Pakaian" },
  { value: "Pakaian Dalam", label: "Pakaian Dalam" },
  { value: "Accessories", label: "Accessories" },
  { value: "Lain lain", label: "Lain lain" },
];

export const SESERAHAN_STATUS_OPTIONS = [
  { value: "Belum Dibeli", label: "Belum Dibeli" },
  { value: "Sudah Dibeli", label: "Sudah Dibeli" },
];

// Souvenir Options
export const SOUVENIR_KATEGORI_OPTIONS = [
  { value: "Umum", label: "Umum" },
  { value: "VIP", label: "VIP" },
  { value: "Anak-anak", label: "Anak-anak" },
  { value: "Custom", label: "Custom" },
];

export const SOUVENIR_STATUS_OPTIONS = [
  { value: "Belum Dibeli", label: "Belum Dibeli" },
  { value: "Sudah Dibeli", label: "Sudah Dibeli" },
];

// Schedule/Calendar Options
export const SCHEDULE_CATEGORY_OPTIONS = [
  { value: "Vendor Meeting", label: "Vendor Meeting" },
  { value: "Payment Reminder", label: "Payment Reminder" },
  { value: "Fitting", label: "Fitting" },
  { value: "Family Event", label: "Family Event" },
  { value: "Important Day", label: "Important Day" },
  { value: "Custom", label: "Custom" },
];

export const SCHEDULE_REMINDER_OPTIONS = [
  { value: "none", label: "None" },
  { value: "1h", label: "1 hour before" },
  { value: "3h", label: "3 hours before" },
  { value: "1d", label: "1 day before" },
  { value: "3d", label: "3 days before" },
];

export const SCHEDULE_CATEGORY_COLORS: Record<string, string> = {
  "Vendor Meeting": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "Payment Reminder": "bg-red-500/15 text-red-400 border-red-500/30",
  Fitting: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "Family Event": "bg-green-500/15 text-green-400 border-green-500/30",
  "Important Day": "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  Custom: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

// Checklist Options
export const CHECKLIST_CATEGORY_OPTIONS = [
  { value: "documentation", label: "Dokumentasi" },
  { value: "venue", label: "Venue" },
  { value: "vendor", label: "Vendor" },
  { value: "fashion", label: "Fashion & Busana" },
  { value: "family", label: "Keluarga" },
  { value: "administration", label: "Administrasi" },
  { value: "ceremony", label: "Upacara" },
  { value: "gifts", label: "Hantaran & Hadiah" },
  { value: "prewedd", label: "Pre-wedding" },
  { value: "other", label: "Lainnya" },
];

export const CHECKLIST_TIMELINE_OPTIONS = [
  { value: "phase_1", label: "Fase 1: 6-2 Bulan Sebelum" },
  { value: "phase_2", label: "Fase 2: H-14" },
  { value: "phase_3", label: "Fase 3: H-7 sampai H-2" },
  { value: "phase_4", label: "Fase 4: Hari-H" },
  { value: "phase_5", label: "Fase 5: H+1 sampai H+7" },
];

export const CHECKLIST_STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
];

export const CHECKLIST_PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

// Planning Data (Static)
export const PLANNING_PHASES = [
  {
    id: "phase_1",
    title: "Fase 1 — 6 sampai 2 Bulan Sebelum",
    description: "Persiapan awal dan pemilihan vendor utama",
    estimatedTime: "H-180 sampai H-60",
    milestones: [
      "Konsultasi awal dengan Wedding Planner",
      "Menentukan konsep, venue, vendor",
      "Fiksasi jumlah tamu (prioritas → biasa)",
      "Fitting awal baju pengantin",
      "Persiapan & pendaftaran KUA",
      "Test food (opsional)",
      "Pemilihan bridesmaid/groomsman",
      "Pemesanan cincin, mobil pengantin",
      "Pre-wedding photo shoot",
      "Pengisian data undangan",
      "Meeting keluarga",
      "Pemesanan undangan fisik",
      "Pemesanan souvenir",
      "Pengisian data pernikahan untuk meeting vendor",
    ],
  },
  {
    id: "phase_2",
    title: "Fase 2 — H-14",
    description: "Technical meeting dan finalisasi detail",
    estimatedTime: "H-14",
    milestones: [
      "Technical meeting semua vendor",
      "Pengiriman barang hantaran untuk dihias",
      "Fitting final pengantin & orang tua",
    ],
  },
  {
    id: "phase_3",
    title: "Fase 3 — H-7 sampai H-2",
    description: "Persiapan terakhir menjelang hari-H",
    estimatedTime: "H-7 sampai H-2",
    milestones: [
      "Persiapan grooming/perawatan",
      "Pengambilan box hantaran",
      "Finalisasi undangan & penyebaran",
    ],
  },
  {
    id: "phase_4",
    title: "Fase 4 — Hari-H",
    description: "Pelaksanaan acara pernikahan",
    estimatedTime: "H-0",
    milestones: ["Pelaksanaan acara"],
  },
  {
    id: "phase_5",
    title: "Fase 5 — H+1 sampai H+7",
    description: "Pasca acara dan follow-up",
    estimatedTime: "H+1 sampai H+7",
    milestones: ["Pengembalian box hantaran", "Follow-up vendor (opsional)"],
  },
];

// Default Checklist Template
export const DEFAULT_CHECKLIST_TEMPLATE = [
  // Phase 1
  {
    title: "Konsultasi awal dengan Wedding Planner",
    category: "vendor",
    timeline_phase: "phase_1",
    priority: "high",
  },
  {
    title: "Fiksasi jumlah tamu",
    category: "administration",
    timeline_phase: "phase_1",
    priority: "high",
  },
  {
    title: "Fitting awal baju pengantin",
    category: "fashion",
    timeline_phase: "phase_1",
    priority: "high",
  },
  {
    title: "Persiapan berkas KUA",
    category: "administration",
    timeline_phase: "phase_1",
    priority: "high",
  },
  {
    title: "Test food (opsional)",
    category: "vendor",
    timeline_phase: "phase_1",
    priority: "medium",
  },
  {
    title: "Pesan undangan fisik",
    category: "documentation",
    timeline_phase: "phase_1",
    priority: "high",
  },
  {
    title: "Pesan souvenir",
    category: "gifts",
    timeline_phase: "phase_1",
    priority: "medium",
  },
  {
    title: "Persiapkan seserahan",
    category: "gifts",
    timeline_phase: "phase_1",
    priority: "high",
  },
  {
    title: "Pre-wedding photo shoot",
    category: "prewedd",
    timeline_phase: "phase_1",
    priority: "medium",
  },
  {
    title: "Meeting keluarga",
    category: "family",
    timeline_phase: "phase_1",
    priority: "high",
  },
  {
    title: "Pemesanan cincin nikah/mahar",
    category: "gifts",
    timeline_phase: "phase_1",
    priority: "high",
  },
  // Phase 2
  {
    title: "Technical meeting semua vendor",
    category: "vendor",
    timeline_phase: "phase_2",
    priority: "high",
  },
  {
    title: "Pengiriman hantaran untuk dihias",
    category: "gifts",
    timeline_phase: "phase_2",
    priority: "high",
  },
  {
    title: "Fitting final pengantin & orang tua",
    category: "fashion",
    timeline_phase: "phase_2",
    priority: "high",
  },
  // Phase 3
  {
    title: "Perawatan/grooming",
    category: "fashion",
    timeline_phase: "phase_3",
    priority: "medium",
  },
  {
    title: "Pengambilan box hantaran",
    category: "gifts",
    timeline_phase: "phase_3",
    priority: "high",
  },
  {
    title: "Finalisasi dan penyebaran undangan",
    category: "documentation",
    timeline_phase: "phase_3",
    priority: "high",
  },
  // Phase 4
  {
    title: "Wedding day checklist",
    category: "ceremony",
    timeline_phase: "phase_4",
    priority: "high",
    description: "Isi detail checklist hari-H",
  },
  // Phase 5
  {
    title: "Pengembalian box hantaran",
    category: "gifts",
    timeline_phase: "phase_5",
    priority: "medium",
  },
];
