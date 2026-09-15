# ☁️ Panduan Database Bersama — Lihat Riwayat dari Semua Device

Sebelumnya data hanya tersimpan di `localStorage` (1 browser = 1 data).
Sekarang website mendukung **Supabase (Postgres gratis)** sebagai database bersama:
lapor dari HP → langsung terlihat di laptop/posko, dan sebaliknya.

Tanpa setting pun website **tetap jalan lokal** (fallback offline).

## 1) Setup sekali (5 menit, gratis)

1. Buka https://supabase.com → **New Project** (paket Free).
   - Isi nama mis. `barang-hilang`, password DB bebas, region Singapore.
   - Tunggu ±2 menit sampai project Ready.
2. Di Supabase, buka **SQL Editor → New Query**.
   - Buka file `supabase-schema.sql` di project ini, copy semua → paste → **Run**.
   - Harus sukses (membuat `tb_barang` + `tb_klaim` + policy publik untuk demo kampus).
3. Buka **Project Settings → API**.
   - Copy `Project URL` (cth `https://xyzcompany.supabase.co`)
   - Copy `anon public` key (string panjang `eyJh...`).
4. Hubungkan website (pilih salah satu):
   - **A. Permanen (recommended, semua device otomatis):** buka `js/supabase-config.js`, isi:
     ```js
     window.PBH_SUPABASE_URL = "https://xyzcompany.supabase.co";
     window.PBH_SUPABASE_ANON_KEY = "eyJh...";
     ```
     Lalu hosting / share folder (atau buka via Live Server). Semua device langsung sinkron.
   - **B. Per-device (tanpa edit file):** buka `dashboard.html → ☁️ Pengaturan DB`,
     paste URL + KEY → **Simpan & Hubungkan**. Ulangi di tiap HP/laptop sekali saja.

## 2) Migrasi data lama

Jika sebelumnya sudah ada laporan di laptop (mode lokal):

1. Di device yang datanya paling lengkap, buka **Dashboard → Pengaturan DB**.
2. Klik **Tes Koneksi** (harus ✅).
3. Klik **⬆ Migrasi Data Lokal → Cloud**.
4. Buka website dari HP lain → data yang sama harus muncul.

## 3) Cara cek beda device (untuk demo sidang)

1. HP A: buat laporan hilang → toast "ke database bersama ☁️".
2. Laptop B: refresh beranda → laporan yang sama muncul (< 30 detik, ada auto-refresh).
3. Laptop B (dashboard): setujui klaim → HP A refresh → status jadi "Sudah Kembali".
4. Indikator di beranda/dashboard:
   - `☁️ TERHUBUNG` = cloud aktif, beda device sinkron.
   - `📴 Mode Lokal` = belum setting / offline.

## 4) Struktur tabel cloud

```
tb_barang (id TEXT PK, tipe, nama, kategori, deskripsi, lokasi,
           tanggal DATE, pelapor, kontak, foto TEXT, status,
           createdat BIGINT, created_at TIMESTAMPTZ)
tb_klaim  (id TEXT PK, item_id → tb_barang.id, nama, kontak,
           bukti, pesan, status, tanggal DATE, created_at)
```

- `database.sql` = skema MySQL lama (untuk laporan Bab 3 / versi PHP).
- `supabase-schema.sql` = skema Postgres aktif untuk sinkron beda device.

## 5) Troubleshooting

| Gejala | Solusi |
|---|---|
| `📴 Mode Lokal` terus | URL harus `https://...supabase.co` tanpa `/` di akhir, KEY = anon public (bukan service_role). Cek Dashboard → Pengaturan. |
| `Supabase error 404 / relation does not exist` | `supabase-schema.sql` belum di-Run. Jalankan ulang di SQL Editor. |
| `Supabase error 401 / Invalid API key` | Salah copy KEY, atau pakai service_role. Pakai anon public. |
| `Failed to fetch / CORS` | Offline atau URL salah. Cek internet + Project URL. |
| Foto tidak muncul di device lain | Foto dikompres otomatis max 800px JPEG. Jika masih besar (> ~1.5MB), Postgres menolak — pakai foto lebih kecil. Untuk produksi, pindah ke Supabase Storage. |
| Data ganda setelah migrasi | Aman — migrasi memakai upsert by `id`, tidak duplikat. |

## 6) Keamanan

Policy default = publik read+write agar demo sidang gampang (tanpa login).
Untuk produksi: aktifkan Auth Supabase + perketat RLS (cth hanya admin bisa update/delete).
Jangan pernah taruh `service_role` key di frontend.
