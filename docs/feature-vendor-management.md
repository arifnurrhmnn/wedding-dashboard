# 🏪 Feature Design: Vendor Management

> Tanggal dibuat: 23 Maret 2026  
> Status: **Planned — Belum Diimplementasi** (folder struktur sudah ada)  
> Dependency: Dibutuhkan oleh modul Budget (`budget_items.vendor_id`)

---

## Konsep Utama

Vendor adalah **penyedia jasa/produk** untuk pernikahan. Setiap vendor punya profil lengkap, paket harga, status kontrak, dokumen, log aktivitas, dan bisa terhubung ke Budget.

---

## 🗄️ Database Schema

### Tabel `vendors`

```sql
id               uuid (PK)
user_id          uuid (FK → auth.users)
nama             text          -- "Studio Foto Angin Segar"
kategori         text          -- "Foto/Video" | "Katering" | dst
kontak_nama      text          -- nama PIC
kontak_wa        text          -- nomor WhatsApp
kontak_email     text
website          text
instagram        text
alamat           text
catatan          text          -- notes umum
status           text          -- "prospek" | "negosiasi" | "deal" | "batal"
rating           int           -- 1–5 bintang (setelah acara)
created_at       timestamp
updated_at       timestamp
```

### Tabel `vendor_packages`

```sql
id               uuid (PK)
vendor_id        uuid (FK → vendors)
user_id          uuid (FK → auth.users)
nama_paket       text          -- "Paket Gold", "Full Day"
deskripsi        text
harga            bigint
is_final         boolean       -- paket yang dipilih/deal
created_at       timestamp
```

### Tabel `vendor_documents`

```sql
id               uuid (PK)
vendor_id        uuid (FK → vendors)
user_id          uuid (FK → auth.users)
nama             text          -- "Kontrak", "Invoice DP", "MOU"
tipe             text          -- "kontrak" | "invoice" | "proposal" | "lainnya"
file_url         text          -- URL dari Supabase Storage
file_name        text
uploaded_at      timestamp
```

### Tabel `vendor_activity_logs`

```sql
id               uuid (PK)
vendor_id        uuid (FK → vendors)
user_id          uuid (FK → auth.users)
aktivitas        text          -- "Meeting pertama", "Tanda tangan kontrak"
tanggal          date
catatan          text
created_at       timestamp
```

---

## 🔄 System Flow

```
[Tambah Vendor Baru]  ← status: "Prospek"
        ↓
[Input Paket/Penawaran] ← bisa beberapa paket dari vendor yang sama
        ↓
[Negosiasi & Catat Log Aktivitas]  ← status: "Negosiasi"
        ↓
[Set Paket Final / Deal]  ← status: "Deal", paket ditandai is_final
        ↓
[Upload Dokumen]  ← kontrak, invoice DP, MOU
        ↓
[Pantau Status Pembayaran]  ← terhubung ke Budget module
        ↓
[Setelah Acara: Beri Rating & Review]
```

---

## 📱 UI Layout

### Halaman List `/dashboard/vendor`

#### Section A — Stat Cards

| Card                   | Isi                             |
| ---------------------- | ------------------------------- |
| 📋 Total Vendor        | Semua vendor yang diinput       |
| 🤝 Sudah Deal          | Status = "deal"                 |
| 🔄 Masih Negosiasi     | Status = "negosiasi"            |
| 💰 Total Nilai Kontrak | SUM paket final yang sudah deal |

#### Section B — Filter & Search

```
[🔍 Cari nama vendor...]  [Kategori ▼]  [Status ▼]  [+ Tambah Vendor]
```

#### Section C — Vendor Cards Grid

```
┌──────────────────────────────────────────────┐
│  📸 Foto & Video              [DEAL] ●       │
│  Studio Angin Segar                          │
│  Paket Gold — Rp 12.000.000                  │
│  📞 Budi Santoso · 0812-xxxx-xxxx            │
│  ⭐ ⭐ ⭐ ⭐ ⭐                               │
│                      [Lihat Detail →]        │
└──────────────────────────────────────────────┘
```

---

### Halaman Detail `/dashboard/vendor/[id]` — 4 Tab

#### Tab 1: Profil

- Info lengkap (nama, kategori, kontak, sosmed, alamat)
- Tombol edit profil
- Tombol hubungi via WhatsApp langsung
- Status badge (Prospek / Negosiasi / Deal / Batal)
- Rating bintang 1–5

#### Tab 2: Paket & Harga

```
┌─────────────────────────────────────────────────┐
│  Paket Silver          Rp 7.000.000    [Pilih]  │
│  2 fotografer, 8 jam, 200 foto edit              │
├─────────────────────────────────────────────────┤
│  Paket Gold ✓ FINAL    Rp 12.000.000   [Final]  │
│  3 fotografer, full day, 400 foto + video        │
├─────────────────────────────────────────────────┤
│  [+ Tambah Paket]                               │
└─────────────────────────────────────────────────┘
```

- Bisa tambah beberapa paket penawaran
- Tandai satu paket sebagai final/deal
- Harga paket final otomatis terhubung ke Budget

#### Tab 3: Dokumen

```
┌───────────────────────────────────────────────┐
│  📄 Kontrak Signed.pdf      [Unduh] [Hapus]   │
│  📄 Invoice DP.pdf          [Unduh] [Hapus]   │
│  📄 Proposal Paket Gold.pdf [Unduh] [Hapus]   │
│                                               │
│  [+ Upload Dokumen]                           │
└───────────────────────────────────────────────┘
```

- Upload PDF/gambar ke Supabase Storage
- Tipe: Kontrak, Invoice, Proposal, Lainnya
- Unduh / hapus

#### Tab 4: Log Aktivitas

```
┌───────────────────────────────────────────────┐
│  📅 10 Mar 2026  Meeting pertama di studio     │
│                  Membahas paket dan harga      │
│                                               │
│  📅 15 Mar 2026  Deal! Paket Gold dipilih      │
│                  Tanda tangan kontrak          │
│                                               │
│  📅 20 Mar 2026  Bayar DP Rp 3.000.000        │
│                                               │
│  [+ Catat Aktivitas]                          │
└───────────────────────────────────────────────┘
```

- Timeline kronologis semua interaksi dengan vendor
- Tanggal + deskripsi aktivitas + catatan

---

## 🏷️ Kategori Vendor (Default)

```
📸  Foto & Video
🍽️  Katering & Konsumsi
🏛️  Venue & Gedung
💐  Dekorasi & Florist
👗  Busana & Kebaya
💄  MUA (Make Up Artist)
🎵  Entertainment & Band
🎂  Wedding Cake
💌  Undangan & Percetakan
🚗  Transportasi
📋  Wedding Organizer (WO)
🔆  Lainnya
```

---

## 🔗 Relasi dengan Modul Lain

| Modul              | Relasi                                                                     |
| ------------------ | -------------------------------------------------------------------------- |
| **Budget**         | `budget_items.vendor_id` → vendor deal otomatis bisa dilink ke item budget |
| **Checklist**      | Task seperti "Meeting Vendor Foto" bisa dilink ke vendor                   |
| **Kalender**       | Jadwal meeting/fitting vendor masuk ke kalender                            |
| **Rundown Hari H** | Vendor yang deal otomatis masuk ke rundown sebagai peserta                 |

---

## 🗂️ Struktur File

```
app/
  api/
    vendor/
      route.ts                      → GET all, POST new vendor
      [id]/
        route.ts                    → GET detail, PATCH, DELETE
        packages/
          route.ts                  → GET/POST paket
          [packageId]/
            route.ts                → PATCH/DELETE paket
            set-final/
              route.ts              → POST set paket final
        documents/
          route.ts                  → GET/POST dokumen
          [documentId]/
            route.ts                → DELETE dokumen
        activity-logs/
          route.ts                  → GET/POST log aktivitas
        status/
          route.ts                  → PATCH status vendor
      categories/
        route.ts                    → GET daftar kategori vendor

  dashboard/
    vendor/
      page.tsx                      → halaman daftar vendor
      [id]/
        page.tsx                    → halaman detail vendor (4 tab)
      components/
        VendorCard.tsx              → card di grid list
        VendorFormModal.tsx         → form tambah/edit vendor
        VendorFilterBar.tsx         → search + filter
        VendorStatCards.tsx         → 4 stat cards
        detail/
          VendorProfileTab.tsx      → tab profil
          VendorPackagesTab.tsx     → tab paket & harga
          VendorDocumentsTab.tsx    → tab dokumen
          VendorActivityTab.tsx     → tab log aktivitas
          PackageFormModal.tsx      → form paket
          ActivityFormModal.tsx     → form log aktivitas

redux/
  slices/
    vendorSlice.ts
```

---

## 🔒 RLS Policy (Supabase)

- Semua tabel difilter by `user_id = auth.uid()`
- Admin bisa akses semua data
- Storage bucket `vendor-documents` dengan policy per user

---

## Prioritas Implementasi

### Phase 1 — Core

- [ ] DB migration (4 tabel + RLS + Storage bucket)
- [ ] API routes: vendor CRUD + packages + status
- [ ] Redux slice: vendorSlice
- [ ] Halaman list vendor (cards + filter + stat cards)
- [ ] Form tambah/edit vendor
- [ ] Tab Profil & Tab Paket di halaman detail

### Phase 2 — Documents & Logs

- [ ] Supabase Storage setup untuk dokumen
- [ ] API upload/delete dokumen
- [ ] Tab Dokumen (upload, list, download, delete)
- [ ] Tab Log Aktivitas (timeline CRUD)

### Phase 3 — Integration

- [ ] Link vendor ke Budget items (`vendor_id` di budget_items)
- [ ] Link jadwal vendor ke Kalender
- [ ] Rating & review setelah acara
- [ ] Notifikasi/reminder deadline pembayaran vendor

---

> **Catatan:** Implementasi Phase 1 & 2 harus selesai sebelum Budget module bisa diintegrasikan secara penuh.
