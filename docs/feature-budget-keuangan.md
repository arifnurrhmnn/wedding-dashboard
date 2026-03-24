# 💰 Feature Design: Budget & Keuangan

> Tanggal dibuat: 23 Maret 2026  
> Status: **Planned — Belum Diimplementasi**

---

## Konsep Utama

Pasangan menetapkan **total budget**, lalu membaginya ke **kategori-kategori** pengeluaran. Setiap kategori punya **item-item** pengeluaran yang bisa dilacak status pembayarannya.

---

## 🗄️ Database Schema

### Tabel `budget_settings`

```sql
id              uuid (PK)
user_id         uuid (FK → auth.users, UNIQUE)
total_budget    bigint       -- total budget keseluruhan
catatan         text
updated_at      timestamp
```

### Tabel `budget_categories`

```sql
id              uuid (PK)
user_id         uuid (FK → auth.users)
nama            text         -- "Venue", "Katering", "Foto/Video", dll
icon            text         -- emoji atau icon name
urutan          int          -- untuk sorting tampilan
created_at      timestamp
```

### Tabel `budget_items`

```sql
id              uuid (PK)
user_id         uuid (FK → auth.users)
category_id     uuid (FK → budget_categories)
nama            text         -- "DP Venue", "Pelunasan Katering", dll
estimasi        bigint       -- rencana biaya
realisasi       bigint       -- biaya aktual yang dibayar
status          text         -- "belum_bayar" | "dp" | "lunas"
tanggal_bayar   date         -- tanggal pembayaran
catatan         text         -- notes tambahan
vendor_id       uuid (FK → vendors, nullable) -- link ke vendor
created_at      timestamp
updated_at      timestamp
```

---

## 🔄 System Flow

```
[Set Total Budget]
        ↓
[Buat Kategori] → default categories otomatis disediakan
        ↓
[Tambah Item per Kategori] → estimasi biaya
        ↓
[Update Status Pembayaran] → belum_bayar → dp → lunas
        ↓
[Dashboard Budget] → lihat sisa budget, progress, warning
```

---

## 📱 UI Layout

### Section A — Hero Summary Bar

```
┌─────────────────────────────────────────────────────┐
│  Total Budget: Rp 150.000.000                       │
│  ████████████░░░░░░░  68% terpakai                  │
│                                                     │
│  Estimasi Total   Realisasi       Sisa Budget        │
│  Rp 120jt         Rp 85jt         Rp 65jt           │
└─────────────────────────────────────────────────────┘
```

### Section B — 4 Stat Cards

| Card              | Isi                                 |
| ----------------- | ----------------------------------- |
| 🟢 Total Budget   | Nominal yang ditetapkan             |
| 🔵 Total Estimasi | Jumlah semua item yang direncanakan |
| 🟡 Sudah Dibayar  | Realisasi yang sudah lunas/DP       |
| 🔴 Sisa Budget    | Total Budget − Realisasi            |

> ⚠️ Warning otomatis jika Total Estimasi > Total Budget (over budget)

### Section C — Breakdown per Kategori (accordion)

```
┌─ 🍽️ Katering ─────────────────── Rp 45jt / Rp 50jt ─┐
│  Progress: ████████░░ 80%  [2 item · 1 lunas · 1 DP] [+] │
│                                                           │
│  (expand) ↓                                               │
│  ┌───────────────────────────────────────────────────┐    │
│  │ Nama Item    Estimasi   Realisasi  Status   Aksi  │    │
│  │ DP Katering  Rp 10jt    Rp 10jt    DP       ✏️🗑️  │    │
│  │ Pelunasan    Rp 40jt    Rp 35jt    Lunas    ✏️🗑️  │    │
│  └───────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────┘
```

---

## ✅ Fitur Detail

### Set Total Budget

- Input total budget di awal (bisa diubah kapan saja)
- Tampil di hero section sebagai acuan utama
- Warning jika estimasi melebihi budget

### Kategori Default (Auto-generate)

Saat pertama buka, user ditawarkan generate kategori default:

```
🏛️  Venue & Gedung
🍽️  Katering & Konsumsi
📸  Foto & Video
💐  Dekorasi & Bunga
👗  Busana & Makeup
🎵  Entertainment & Musik
📄  Administrasi & Dokumen
💌  Undangan & Souvenir
🚗  Transportasi
🎁  Seserahan
👔  Pakaian Keluarga Inti
🔆  Lain-lain
```

### CRUD Kategori

- Custom nama & icon/emoji
- Atur urutan tampilan
- Tidak bisa hapus jika masih ada item di dalamnya

### Form Item Budget

```
Nama Item     : [DP Venue Gedung Serbaguna]
Kategori      : [Venue & Gedung ▼]
Estimasi      : [Rp 20.000.000]
Realisasi     : [Rp 20.000.000]  ← isi saat bayar
Status        : [Belum Bayar ▼] / [DP] / [Lunas]
Tanggal Bayar : [12 April 2025]
Catatan       : [Termasuk meja kursi 200 pax]
Link Vendor   : [Pilih Vendor ▼]  ← optional
```

### Status Pembayaran

- `Belum Bayar` → badge abu-abu
- `DP` → badge kuning
- `Lunas` → badge hijau

### Over Budget Warning

- Total estimasi > total budget → banner merah
- Kategori melebihi alokasi → indikator merah per kategori
- Sisa budget < 10% → warning kuning

### Filter & Tampilan

- Filter by status: Semua / Belum Bayar / DP / Lunas
- Filter by kategori
- Sort by: estimasi terbesar, terbaru, nama

---

## 📊 Kalkulasi Otomatis

```
Total Estimasi  = SUM(semua item.estimasi)
Total Realisasi = SUM(semua item.realisasi)
Sisa Budget     = total_budget - total_realisasi
Selisih         = total_budget - total_estimasi (negatif = over budget)

Per Kategori:
  Estimasi Kategori  = SUM(items.estimasi)
  Realisasi Kategori = SUM(items.realisasi)
  Progress %         = (realisasi / estimasi) × 100
```

---

## 🗂️ Struktur File

```
app/
  api/
    budget/
      route.ts                    → GET/POST budget_items
      [id]/route.ts               → PATCH/DELETE item
      categories/
        route.ts                  → GET/POST/DELETE categories
        generate-default/
          route.ts                → POST generate kategori default
      settings/
        route.ts                  → GET/PATCH total budget setting

  dashboard/
    budget/
      page.tsx                    → halaman utama
      components/
        BudgetHero.tsx            → summary bar + stat cards
        BudgetCategoryCard.tsx    → accordion card per kategori
        BudgetItemRow.tsx         → baris item dalam tabel
        BudgetFormModal.tsx       → form tambah/edit item
        CategoryFormModal.tsx     → form tambah/edit kategori
        SetBudgetModal.tsx        → modal set total budget
        OverBudgetBanner.tsx      → warning banner

redux/
  slices/
    budgetSlice.ts
```

---

## 🔒 RLS Policy (Supabase)

- User hanya bisa akses data miliknya (`user_id = auth.uid()`)
- Admin bisa akses semua
- Semua operasi CRUD diproteksi dengan RLS

---

## Prioritas Implementasi

### Phase 1 — Core

- [ ] DB migration (3 tabel + RLS)
- [ ] API routes
- [ ] Redux slice
- [ ] Halaman utama + Set Total Budget modal
- [ ] CRUD Kategori & Item

### Phase 2 — Enhancement

- [ ] Auto-generate kategori default
- [ ] Link ke Vendor module (`vendor_id` di budget_items)
- [ ] Filter & sort
- [ ] Over budget warning & kalkulasi visual

---

> **Catatan:** Fitur Budget sangat bergantung pada Vendor module karena `budget_items.vendor_id` mereferensi tabel `vendors`. Disarankan implementasi **Vendor module lebih dulu** sebelum Budget.
