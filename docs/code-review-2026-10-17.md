**Review fitur dan fungsi Wedding Dashboard — 17 Oktober 2026**

> **Catatan tindak lanjut:** Temuan pada dokumen ini adalah snapshot sebelum perbaikan. Status penyelesaian R01–R27, hasil validasi, dan langkah eksternal yang masih diperlukan dicatat di [laporan perbaikan](./fixes-2026-10-17.md).

Snapshot kode: commit `74686c3`, dengan perubahan konfigurasi environment dari sesi sebelumnya. Review ini memetakan 118 file TypeScript/TSX, 13 halaman dashboard, serta 59 handler HTTP dalam 36 file route API. Metodenya adalah penelusuran UI → Redux → API, pemeriksaan statis, dan reproduksi lokal terarah menggunakan modul asli dengan data simulasi. Ini bukan hasil pengujian seluruh fungsi secara end-to-end di browser atau Supabase produksi.

Ditemukan **27 temuan: 5 P1 dan 22 P2**. P1 perlu didahulukan karena berkaitan dengan keamanan, privasi, atau penghambat build; P2 merupakan kesalahan perilaku atau konsistensi data. Nilai kredensial tidak dicantumkan. Kode aplikasi tidak diubah dalam review ini.

**Cakupan per fitur**

| Area | Fungsi yang ditinjau | Hasil utama |
| --- | --- | --- |
| Autentikasi | Daftar email, login, Google OAuth, callback, sesi, pending/rejected, logout, middleware | R01, R02, R04–R06; penegakan approval pada API masih perlu verifikasi RLS |
| Manajemen pengguna | Pemeriksaan role, daftar/filter/sort/pagination, edit nama/role/status, hapus akun, perlindungan akun sendiri | R25; kebijakan database dan penghapusan data terkait belum terverifikasi |
| Dashboard dan layout | Statistik, sapaan, tautan, sidebar, preferensi lokal, providers/store, shared UI | R05, R25–R27 |
| Tamu undangan | CRUD, inline edit, pencarian/filter/sort/pagination, CSV/template/impor/ekspor, hapus semua | R07, R08, R14 |
| Gift tamu | Edit/hapus gift, filter, pagination, rekap | R09; juga terdampak R05 dan R07 |
| Undangan WhatsApp | Template/default/save/reset, placeholder, copy, status sudah/belum diundang | R08, R09; pengiriman sebenarnya tidak dibuktikan oleh status manual |
| Budget | Settings, kategori/default, CRUD item, status, DP/pelunasan, ringkasan, filter, integrasi modul | R03, R13, R15–R19 |
| Vendor | CRUD profil, pencarian/filter, statistik, paket/final, status, activity log, dokumen, Redux | R20–R24; upload/hapus dokumen pada UI masih dinonaktifkan |
| Checklist | CRUD, inline edit, kategori/fase/status, filter/sort/pagination, template, progres | R13, R14 |
| Kalender | Navigasi bulan, grid, drawer/detail, CRUD, konversi waktu, query bulanan, Redux | R10–R13 |
| Planning | Panduan fase, accordion, milestone, tautan ke checklist | Tidak ditemukan bug signifikan; memang berupa panduan statis |
| Seserahan | CRUD, form/tabel/filter/sort/pagination, status, harga, integrasi budget | R14; integrasi budget terdampak R16 dan R17 |
| Souvenir | CRUD, jumlah/harga/status, form/tabel/filter/sort/pagination, integrasi budget | R14; integrasi budget terdampak R03, R16 dan R17 |
| Infrastruktur | Axios, Supabase helpers, environment, Next/TypeScript/ESLint, keep-alive, shared primitives | R01–R03; batas pengujian dijelaskan di akhir |

**Temuan berdasarkan prioritas**

**R01 — [P1] Token akses berada dalam file yang terlacak Git.**

Lokasi: [`.vscode/mcp.json:7`](/Users/arifnurrohman/Projects/wedding-dashboard/.vscode/mcp.json:7).

Konfigurasi editor memuat kredensial Bearer dan file tersebut tercatat dalam Git. Pembaca checkout atau riwayat terkait dapat memperoleh kredensial tersebut. Keaktifan token tidak diuji. Cabut/ganti jika masih aktif, keluarkan kredensial dari konfigurasi yang di-commit, lalu tangani riwayat sesuai kebutuhan; menghapus nilai dari versi terbaru saja tidak menghapus riwayatnya. Validasi: pemindaian lokal hanya mengeluarkan jumlah kredensial dan status pelacakan, tanpa menampilkan nilainya.

**R02 — [P1] Next.js dipatok pada versi yang memiliki advisory DoS App Router.**

Lokasi: [`package.json:26`](/Users/arifnurrohman/Projects/wedding-dashboard/package.json:26).

Proyek memakai Next.js `16.0.7` dan App Router. Advisory resmi menjelaskan bahwa request yang disusun khusus dapat menggantung proses server pada versi terdampak; perbaikan untuk advisory tersebut di jalur 16.0.x tersedia pada `16.0.10`. Penilaian ini berdasarkan versi dan sumber resmi, tanpa mencoba eksploitasi. Perbarui ke rilis terdukung yang memuat patch dan audit ulang dependensi. Ini bukan klaim bahwa `16.0.10` adalah versi terbaru atau mencakup semua advisory saat ini. [Sumber resmi Next.js](https://nextjs.org/blog/security-update-2025-12-11).

**R03 — [P1] Tiga error TypeScript menghambat pemeriksaan kode/build standar.**

Lokasi: [`app/dashboard/budget/page.tsx:284`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/budget/page.tsx:284), juga baris 290 dan 298.

Ekspresi `i.total_harga ?? i.harga_per_item * i.jumlah ?? 0` menerapkan fallback nullish pada hasil perkalian yang tidak nullish. `tsc --noEmit --incremental false` menghasilkan tiga error `TS2881`. Berikan default pada operand yang memang boleh kosong dan hilangkan fallback yang tidak terjangkau. Jangan menonaktifkan pemeriksaan TypeScript untuk melewatinya.

**R04 — [P1] Profil tidak tersedia tetap dianggap boleh mengakses dashboard.**

Lokasi: [`middleware.ts:43`](/Users/arifnurrohman/Projects/wedding-dashboard/middleware.ts:43), [`app/auth/callback/route.ts:30`](/Users/arifnurrohman/Projects/wedding-dashboard/app/auth/callback/route.ts:30).

Error query profil diabaikan; logika hanya menolak status `pending` dan `rejected`. Profil yang tidak ada atau gagal dibaca menghasilkan status `undefined` dan tetap diteruskan ke dashboard. Reproduksi middleware aktual dengan pengguna terautentikasi dan query profil gagal menghasilkan HTTP 200 dengan izin melanjutkan. Syaratkan profil valid berstatus `active`, serta bedakan kegagalan query dari status yang sah. Temuan ini membuktikan kontrol navigasi yang terbuka; akses data produksi tetap bergantung pada RLS.

**R05 — [P1] Data akun sebelumnya bertahan ketika pengguna berganti akun.**

Lokasi: [`components/layout/Sidebar.tsx:264`](/Users/arifnurrohman/Projects/wedding-dashboard/components/layout/Sidebar.tsx:264), [`redux/store.ts:10`](/Users/arifnurrohman/Projects/wedding-dashboard/redux/store.ts:10), [`components/providers.tsx:9`](/Users/arifnurrohman/Projects/wedding-dashboard/components/providers.tsx:9).

Logout hanya mengakhiri sesi dan menavigasi; store singleton dalam provider root tidak dibersihkan. Daftar lama tetap dirender selama fetch akun baru berjalan dan dapat menetap bila fetch gagal. Reducer asli tamu, seserahan, dan souvenir direproduksi dengan data A → fetch pending B → fetch rejected B; data A tetap ada. Bersihkan seluruh state ketika logout/user berubah dan cegah respons sesi lama mengisi state sesi baru. Ini risiko cache lokal antar akun pada browser yang sama, bukan bukti kebocoran melalui RLS; urutan UI lengkap belum diuji di browser.

**R06 — [P2] Redirect middleware membuang cookie sesi yang baru diperbarui.**

Lokasi: [`middleware.ts:19`](/Users/arifnurrohman/Projects/wedding-dashboard/middleware.ts:19), [`middleware.ts:65`](/Users/arifnurrohman/Projects/wedding-dashboard/middleware.ts:65), serta cabang redirect lainnya.

Refresh sesi menaruh cookie pada `supabaseResponse`, tetapi cabang redirect membuat response baru tanpa menyalin cookie tersebut. Reproduksi refresh pada `/dashboard` mengirim cookie baru, sedangkan refresh pada `/login` dengan pengguna aktif menghasilkan redirect 307 tanpa cookie baru. Browser dapat tertinggal dengan token lama. Salin cookie hasil refresh ke response redirect atau gunakan helper response yang mempertahankannya.

**R07 — [P2] Impor pembaruan CSV menghapus informasi pada kolom opsional yang tidak disertakan.**

Lokasi: [`app/api/tamu-undangan/import/route.ts:62`](/Users/arifnurrohman/Projects/wedding-dashboard/app/api/tamu-undangan/import/route.ts:62).

CSV dengan `unique_id,nama` untuk memperbaiki nama ikut mengubah kategori/prioritas/tipe menjadi string kosong, qty menjadi 1, dan gift menjadi null. Padahal UI mendokumentasikan kolom tersebut sebagai opsional. Reproduksi handler aktual menghasilkan respons sukses dengan payload penghapusan itu, termasuk gift uang Rp500.000. Untuk update, kirim hanya kolom yang hadir; bedakan kolom absen dari nilai kosong yang sengaja diberikan.

**R08 — [P2] Siklus export → hapus semua → import kehilangan status undangan.**

Lokasi: [`ImportExportButtons.tsx:73`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/tamu-undangan/components/ImportExportButtons.tsx:73), [`app/api/tamu-undangan/import/route.ts:83`](/Users/arifnurrohman/Projects/wedding-dashboard/app/api/tamu-undangan/import/route.ts:83).

CSV tidak mengekspor `is_invited`, dan importer tidak membacanya. Memulihkan data lewat workflow tersebut tidak memulihkan tanda sudah diundang; UI menganggap nilai kosong sebagai belum. Temuan terverifikasi dari bentuk payload ekspor/impor, tanpa menghapus data database. Sertakan status ini pada CSV, parse boolean secara ketat, dan pertahankan nilai lama saat kolom tidak dikirim dalam update.

**R09 — [P2] Pagination undangan/gift dapat kosong tanpa tombol untuk kembali.**

Lokasi: [`app/dashboard/undangan-tamu/page.tsx:228`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/undangan-tamu/page.tsx:228), [`app/dashboard/gift-tamu/page.tsx:107`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/gift-tamu/page.tsx:107).

Contoh: 11 tamu belum diundang, filter belum, buka halaman 2, lalu tandai tamu terakhir sudah diundang. Hasil filter tinggal 10, tetapi halaman aktif tetap 2. Slice menjadi kosong dan footer pagination disembunyikan karena kini hanya ada satu halaman. Perhitungan lokal mereproduksi kondisi ini; pola sama terjadi ketika edit gift mengeluarkan tamu dari filter aktif. Clamp atau reset halaman saat panjang hasil filter berubah.

**R10 — [P2] Modal kalender tidak memuat target edit atau tanggal yang baru dipilih.**

Lokasi: [`ScheduleFormModal.tsx:75`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/kalender/components/ScheduleFormModal.tsx:75), [`app/dashboard/kalender/page.tsx:72`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/kalender/page.tsx:72).

State form diinisialisasi sekali. Reset hanya ada pada `onOpenChange(true)`, sementara parent membuka modal dengan mengubah prop `open`; perubahan prop itu tidak memanggil callback tersebut. Simulasi komponen dengan state persisten: mount tertutup tanpa jadwal, kemudian buka untuk “Meeting vendor”, judul tetap kosong. Sinkronkan state ketika modal dibuka/target berubah atau remount menggunakan key yang sesuai.

**R11 — [P2] Konversi tanggal kalender dapat memundurkan acara satu hari di WIB.**

Lokasi: [`ScheduleFormModal.tsx:39`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/kalender/components/ScheduleFormModal.tsx:39), juga baris 41 dan 50.

Tanggal diambil dari `toISOString()` dalam UTC tetapi jam diambil sebagai waktu lokal. Reproduksi dengan `TZ=Asia/Jakarta`: tanggal yang diklik 20 Oktober 2026 menjadi 19 Oktober; edit acara 20 Oktober pukul 06.00 WIB juga menghasilkan 19 Oktober pukul 06.00. Menyimpan kembali dapat memindahkan acara. Gunakan komponen tanggal lokal secara konsisten dan serialisasikan timestamp dengan zona waktu yang jelas. Masalah ini tetap ada sesudah R10 diperbaiki.

**R12 — [P2] Query bulanan kalender melewatkan acara di akhir bulan.**

Lokasi: [`app/api/schedule/route.ts:25`](/Users/arifnurrohman/Projects/wedding-dashboard/app/api/schedule/route.ts:25).

Batas atas memakai `lte` dengan tanggal terakhir tanpa waktu, sehingga berhenti pada tengah malam. Handler aktual untuk Oktober 2026 menghasilkan batas `2026-10-31` pada host UTC, yang mengecualikan acara 31 Oktober pukul 09.00. Pada host WIB, konversi lokal ke ISO bahkan menghasilkan tanggal batas 30 Oktober. Gunakan rentang `>= awal bulan` dan `< awal bulan berikutnya` dengan zona waktu eksplisit.

**R13 — [P2] Mengosongkan field opsional tidak menghapus nilai tersimpan.**

Lokasi: [`BudgetFormModal.tsx:106`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/budget/components/BudgetFormModal.tsx:106), [`app/dashboard/checklist/page.tsx:98`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/checklist/page.tsx:98), [`ScheduleFormModal.tsx:91`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/kalender/components/ScheduleFormModal.tsx:91).

Input yang dikosongkan dikirim sebagai `undefined`, lalu hilang saat serialisasi JSON. PATCH hanya memperbarui field yang hadir, sehingga vendor/catatan/tanggal pada budget, due date checklist, dan waktu selesai jadwal tetap bernilai lama meskipun notifikasi sukses muncul. Payload form dan serialisasi direproduksi secara lokal. Kirim `null` untuk penghapusan yang disengaja dan sesuaikan tipe/validasi server untuk membedakannya dari field yang tidak dikirim.

**R14 — [P2] Membuka kembali form tambah dapat membawa data transaksi sebelumnya.**

Lokasi: [`GuestFormModal.tsx:64`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/tamu-undangan/components/GuestFormModal.tsx:64), [`SeserahanFormModal.tsx:67`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/seserahan/components/SeserahanFormModal.tsx:67), [`SouvenirFormModal.tsx:62`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/souvenir/components/SouvenirFormModal.tsx:62), [`ChecklistFormModal.tsx:71`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/checklist/components/ChecklistFormModal.tsx:71).

Effect bergantung pada record edit, sementara modal selalu terpasang. Pada tambah → simpan → tambah lagi, record edit tetap null sehingga effect tidak berjalan; callback reset saat pembukaan juga tidak dipicu oleh perubahan prop parent. Isian lama berpotensi dikirim ulang dan membuat duplikat. Berbeda dari kalender, mengganti record edit pada modal ini sudah memiliki effect. Reset ketika `open` berubah menjadi true, termasuk saat target tetap null. Validasi melalui penelusuran lifecycle source; belum E2E browser.

**R15 — [P2] DP tidak masuk ke total sudah dibayar dan sisa budget.**

Lokasi: [`BudgetHero.tsx:61`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/budget/components/BudgetHero.tsx:61), [`BudgetCategoryCard.tsx:92`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/budget/components/BudgetCategoryCard.tsx:92), [`BudgetFormModal.tsx:88`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/budget/components/BudgetFormModal.tsx:88).

Form menyimpan DP terpisah dari realisasi, tetapi hero dan total kategori hanya menjumlah realisasi. Reproduksi: pagu Rp150 juta, estimasi Rp100 juta, DP Rp20 juta, bagian pelunasan kosong → “Sudah Dibayar” Rp0 dan “Sisa Budget” Rp150 juta. Ringkasan form juga tidak mengurangi DP, sementara baris item memakai fallback DP sehingga hasil antartampilan berbeda. Tetapkan semantik total pembayaran yang konsisten, termasuk DP, tanpa menghitung DP dua kali ketika realisasi sudah mencakupnya.

**R16 — [P2] Item manual pada kategori otomatis tersimpan tetapi tidak dapat dikelola dari kartu.**

Lokasi: [`BudgetFormModal.tsx:170`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/budget/components/BudgetFormModal.tsx:170), [`app/dashboard/budget/page.tsx:320`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/budget/page.tsx:320), [`BudgetCategoryCard.tsx:242`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/budget/components/BudgetCategoryCard.tsx:242).

Tombol global Tambah Item tetap menawarkan kategori Seserahan/Souvenir. Namun kartu linked menyembunyikan budget item dan aksinya; kehadiran satu item juga menonaktifkan total otomatis modul tersebut. Reproduksi: sumber Souvenir Rp5 juta + item manual Packing Rp100 ribu → hero menjadi Rp100 ribu, kartu menunjukkan Rp5 juta, dan Packing tidak memiliki akses edit/hapus. Larang item manual pada kategori linked di form dan API, atau implementasikan tampilan dan agregasi gabungan yang konsisten.

**R17 — [P2] Nama kategori dapat menggandakan biaya modul dan mengunci kategori biasa.**

Lokasi: [`app/dashboard/budget/page.tsx:305`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/budget/page.tsx:305), agregasi pada baris 317 dan 326.

Pencocokan `includes("souvenir")`/`includes("seserahan")` menganggap kategori buatan seperti “Packing Souvenir” sebagai kategori otomatis lain. Ringkasan sumber yang sama dijumlah untuk setiap kategori dan kategori buatan ikut terkunci. Reproduksi sumber Rp5 juta dengan dua nama yang cocok menghasilkan estimasi/realisasi otomatis Rp10 juta. Identifikasi hubungan modul dengan field/ID khusus yang unik, lalu agregasikan setiap modul satu kali.

**R18 — [P2] PATCH nominal parsial dapat merusak status pembayaran.**

Lokasi: [`app/api/budget/[id]/route.ts:26`](/Users/arifnurrohman/Projects/wedding-dashboard/app/api/budget/[id]/route.ts:26).

Field DP/realisasi yang tidak dikirim diperlakukan sebagai nol saat menghitung status. Reproduksi handler: item memiliki DP Rp20 juta, PATCH hanya estimasi → update menulis `belum_bayar`, meski nilai DP lama tetap tersimpan. UI saat ini biasanya mengirim field lengkap; masalah ini berlaku pada kontrak PATCH parsial yang juga didukung tipe thunk. Gabungkan payload dengan record lama sebelum menghitung ulang status.

**R19 — [P2] Generate kategori mengganti daftar lokal dengan hanya kategori yang baru dibuat.**

Lokasi: [`redux/slices/budgetSlice.ts:219`](/Users/arifnurrohman/Projects/wedding-dashboard/redux/slices/budgetSlice.ts:219), [`generate-default/route.ts:31`](/Users/arifnurrohman/Projects/wedding-dashboard/app/api/budget/categories/generate-default/route.ts:31).

Endpoint mengembalikan baris yang baru ditambahkan, sedangkan reducer mengganti seluruh daftar kategori dengan respons itu. Seserahan/Souvenir yang sudah dibuat otomatis menghilang dari tampilan dan perhitungan sampai reload. Reproduksi reducer asli membuktikan kategori lama hilang dari state, bukan terhapus dari server. Gabungkan berdasarkan ID atau fetch ulang seluruh kategori setelah generate.

**R20 — [P2] Filter kategori vendor tidak berfungsi.**

Lokasi: [`VendorTable.tsx:122`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/vendor/components/VendorTable.tsx:122), [`VendorColumns.tsx:55`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/vendor/components/VendorColumns.tsx:55).

Handler memanggil `getColumn("kategori")`, tetapi definisi kolom tidak menyediakan accessor tersebut. Optional chaining membuat kegagalannya diam-diam. Reproduksi menggunakan TanStack Table aktual dengan vendor Foto/Venue menghasilkan kolom kategori tidak ditemukan dan kedua vendor tetap tampil. Tambahkan accessor tersembunyi atau lakukan filter pada data sebelum diberikan ke tabel.

**R21 — [P2] Mutasi data anak vendor tidak memvalidasi hubungan dengan vendor pada URL.**

Lokasi: [`set-final/route.ts:26`](/Users/arifnurrohman/Projects/wedding-dashboard/app/api/vendor/[id]/packages/[packageId]/set-final/route.ts:26), [`packages/[packageId]/route.ts:16`](/Users/arifnurrohman/Projects/wedding-dashboard/app/api/vendor/[id]/packages/[packageId]/route.ts:16), [`activity-logs/[logId]/route.ts:16`](/Users/arifnurrohman/Projects/wedding-dashboard/app/api/vendor/[id]/activity-logs/[logId]/route.ts:16), [`documents/[documentId]/route.ts:16`](/Users/arifnurrohman/Projects/wedding-dashboard/app/api/vendor/[id]/documents/[documentId]/route.ts:16).

Query memakai ID anak saja dan mengabaikan parent ID. Reproduksi dua vendor milik pengguna yang sama: URL vendor A dengan ID paket B menghasilkan 200, menghapus pilihan final A, menjadikan paket B final, dan mengubah A menjadi deal. PATCH paket juga menerima parent yang salah; pola DELETE log/dokumen sama. Batasi query dengan ID anak dan `vendor_id`, lalu validasi sebelum mutasi. Ini tidak memerlukan asumsi akses lintas pengguna/RLS.

**R22 — [P2] Pemilihan paket final tidak atomik dan mengabaikan sebagian error.**

Lokasi: [`set-final/route.ts:20`](/Users/arifnurrohman/Projects/wedding-dashboard/app/api/vendor/[id]/packages/[packageId]/set-final/route.ts:20).

Reset paket lama, pemilihan baru, dan perubahan status adalah tiga operasi terpisah. Reproduksi handler: reset berhasil lalu pemilihan gagal → 500 tetapi pilihan lama sudah hilang; reset gagal lalu pemilihan berhasil → 200 dengan dua pilihan final dalam simulasi tanpa constraint. Error perubahan status juga diabaikan, sementara Redux menganggap vendor deal. Gunakan transaksi/RPC untuk seluruh perubahan dan periksa setiap error; perilaku constraint produksi belum diketahui.

**R23 — [P2] Nilai kontrak tetap menjumlahkan vendor yang dibatalkan.**

Lokasi: [`app/dashboard/vendor/page.tsx:50`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/vendor/page.tsx:50), requirement pada [`feature-vendor-management.md:108`](/Users/arifnurrohman/Projects/wedding-dashboard/docs/feature-vendor-management.md:108).

Statistik menjumlah semua paket final tanpa memfilter status vendor. Mengubah status menjadi batal mempertahankan paket final, sehingga vendor batal Rp12 juta tetap menyumbang Rp12 juta ke nilai kontrak. Dokumentasi menyatakan jumlah paket final yang sudah deal. Hitung hanya vendor berstatus deal, atau ubah definisi metrik secara eksplisit jika memang dimaksudkan lain.

**R24 — [P2] Respons detail yang terlambat dapat menampilkan vendor yang salah pada form edit.**

Lokasi: [`redux/slices/vendorSlice.ts:326`](/Users/arifnurrohman/Projects/wedding-dashboard/redux/slices/vendorSlice.ts:326), [`app/dashboard/vendor/[id]/page.tsx:99`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/vendor/[id]/page.tsx:99).

Request detail tidak dibatalkan dan reducer menerima semua fulfilled tanpa guard target/requestId. Reproduksi reducer asli: pending A → pending B → fulfilled B → fulfilled A menghasilkan selectedVendor A ketika route aktif B. Handler simpan memakai ID URL B, sehingga data A yang ditampilkan bisa ditulis ke B. Batalkan request lama, periksa target/requestId, dan render detail hanya ketika ID cocok dengan URL. Race reducer terverifikasi; dampak penyimpanan ditelusuri dari source.

**R25 — [P2] Perubahan nama oleh admin tidak muncul pada sapaan dan sidebar pengguna.**

Lokasi: [`app/api/users/[id]/route.ts:63`](/Users/arifnurrohman/Projects/wedding-dashboard/app/api/users/[id]/route.ts:63), [`Sidebar.tsx:243`](/Users/arifnurrohman/Projects/wedding-dashboard/components/layout/Sidebar.tsx:243), [`app/dashboard/page.tsx:45`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/page.tsx:45).

Admin memperbarui `profiles.nama`, tetapi sapaan dan sidebar membaca `auth.user_metadata.nama`; query profil sidebar hanya mengambil role/avatar. Simulasi komponen dengan metadata Nama Lama dan profil Nama Baru tetap menampilkan Nama Lama. Reload/login ulang tidak menyelesaikan perbedaan sumber tersebut. Gunakan `profiles.nama` secara konsisten atau sinkronkan metadata melalui proses admin yang sesuai.

**R26 — [P2] Statistik “Konfirmasi Hadir” menghitung field kategori hubungan tamu.**

Lokasi: [`app/dashboard/page.tsx:60`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/page.tsx:60), [`utils/constants.ts:1`](/Users/arifnurrohman/Projects/wedding-dashboard/utils/constants.ts:1).

Perhitungan mencari `kategori === "Hadir"`, padahal pilihan kategori adalah Keluarga Inti/Besar, Teman, Tetangga, dan Tamu Orang Tua. Model/form/API tidak menyediakan field konfirmasi kehadiran. Untuk data valid dari UI, metrik ini selalu nol dan tidak merepresentasikan RSVP. Gunakan field kehadiran yang nyata beserta alur pengisiannya, atau sembunyikan metrik sampai fitur tersedia. Terverifikasi dari seluruh referensi kehadiran dan definisi model.

**R27 — [P2] Preferensi sidebar dapat menyebabkan hydration mismatch saat reload.**

Lokasi: [`app/dashboard/layout.tsx:11`](/Users/arifnurrohman/Projects/wedding-dashboard/app/dashboard/layout.tsx:11).

Server memakai state awal false, sementara render pertama browser langsung membaca localStorage. Jika preferensi minimized bernilai true, markup server dan browser berbeda, termasuk struktur Sidebar. Render modul asli di dua konteks menghasilkan aside server `w-72` dan browser `w-16`. Gunakan state awal yang konsisten dan baca preferensi setelah mount, atau external store dengan server snapshot yang sesuai. Belum divalidasi melalui browser E2E.

**Hasil validasi**

| Pemeriksaan | Hasil |
| --- | --- |
| `npm run lint` | Selesai: 0 error, 5 warning `react-hooks/incompatible-library` pada penggunaan TanStack Table |
| `tsc --noEmit --incremental false` | Gagal: 3 error TS2881 pada halaman Budget |
| `npm run build` | Gagal mengambil Geist dan Geist Mono dari Google Fonts; build belum mencapai konfirmasi akhir kompilasi/typecheck/prerender |
| Environment lokal | Ketiga variabel yang dibutuhkan tersedia dan memiliki nilai; keabsahan/izin key serta koneksi Supabase tidak diuji |
| Sesi dan middleware | Reproduksi lokal menunjukkan profil gagal tetap diteruskan dan cookie refresh hilang pada redirect |
| Budget | Reproduksi modul asli untuk DP/ringkasan, payload kosong, linked category, nama kategori, partial PATCH, dan reducer generate |
| Vendor | Reproduksi handler dengan Supabase mock, filter menggunakan TanStack aktual, serta race reducer aktual |
| Tamu/CSV/gift/undangan | Reproduksi handler impor, reducer cache, serta perhitungan pagination; omission backup diverifikasi dari payload |
| Kalender/checklist | Simulasi state komponen, fungsi tanggal aktual dengan timezone Asia/Jakarta, handler bulanan, dan serialisasi field kosong |
| Shared UI | Render modul layout/sapaan/sidebar secara terisolasi; tidak ada pengujian visual/mobile dalam browser |

**Hal yang masih perlu diverifikasi**

- Repository tidak menyediakan migrasi SQL, definisi RLS, constraint, trigger, atau pengujian otomatis. Kebenaran kebijakan akses lintas pengguna, cascade penghapusan, pembuatan profil saat registrasi, default pending, keunikan kategori/paket final, dan perhitungan `souvenir.total_harga` belum dapat dipastikan dari kode aplikasi saja.
- Handler API umumnya hanya memeriksa adanya pengguna; endpoint admin memeriksa role. Status approval tidak ditegakkan secara eksplisit pada handler, dan matcher middleware tidak mencakup API. Jika RLS hanya berdasarkan kepemilikan, akun pending/rejected dapat tetap memiliki jalur HTTP ke datanya. Verifikasi dengan kebijakan aktual dan tambahkan guard server bersama bila diperlukan; review ini tidak menyatakan bypass produksi telah terbukti.
- Sejumlah PATCH meneruskan body langsung. Allowlist field, tipe, enum, nilai negatif, dan relasi foreign key perlu ditinjau bersama schema. Tanpa schema, tidak dinyatakan bahwa data tidak valid pasti dapat tersimpan.
- Upload/hapus dokumen vendor di UI sengaja disabled/Coming Soon; sinkron otomatis harga paket final ke Budget belum tersedia. Planning adalah panduan statis. Kategori/reminder kalender pada constants belum menjadi fitur yang digunakan. Hal tersebut dicatat sebagai batas implementasi, bukan otomatis bug.
- Tidak tersedia error/loading boundary khusus. Navigasi mobile memakai sidebar tetap dan hamburger Navbar tidak dipasang di layout; dampak visual perlu diuji di browser sebelum diberi prioritas bug.
- Konfigurasi OAuth, Storage, deployment, scheduler keep-alive, dan koneksi Supabase tidak diuji secara langsung. Tidak ada mutasi data produksi, instalasi dependensi, upgrade paket, atau perbaikan kode aplikasi dalam review ini.

**Urutan perbaikan yang disarankan**

Tangani kredensial dan patch keamanan, selesaikan error TypeScript, lalu perbaiki kontrol profil dan pembersihan sesi/cache. Berikutnya prioritaskan risiko hilangnya data impor, transaksi paket final, serta form/tanggal kalender. Setelah itu benahi angka pembayaran dan integrasi budget, filter/statistik vendor, dan konsistensi field opsional/nama/pagination. Jalankan pengujian integrasi terhadap Supabase pengujian serta browser sebelum menganggap seluruh fitur siap digunakan.
