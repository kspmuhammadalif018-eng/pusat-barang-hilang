# 🔎 Pusat Pencarian Barang Hilang

Project Akhir — Website pendataan barang hilang & temuan kampus.
Teknologi: **HTML + CSS + JavaScript + Supabase (database bersama, beda device sinkron) + fallback LocalStorage offline**.

## ☁️ Database Bersama (baru — beda device)

Supaya riwayat bisa dilihat dari HP + laptop + posko sekaligus:

1. Buat project gratis di https://supabase.com
2. **SQL Editor → paste `supabase-schema.sql` → Run** (sekali saja)
3. **Settings → API** → copy Project URL + anon key
4. Hubungkan, pilih salah satu:
   - Isi `js/supabase-config.js` (otomatis semua device), atau
   - Buka `dashboard.html → ☁️ Pengaturan DB` → paste URL + KEY → Simpan (per device)
5. Klik **Migrasi Data Lokal → Cloud** sekali untuk upload data lama.

Panduan lengkap: **`PANDUAN-DATABASE.md`**.
Tanpa setting pun website tetap jalan lokal (indikator `📴 Mode Lokal`).

## 📁 Struktur
```
pusat-barang-hilang/
├── index.html            → Beranda + pencarian & filter (auto-refresh cloud 30 dtk)
├── lapor-hilang.html     → Form barang hilang (sync cloud)
├── lapor-temuan.html     → Form barang temuan (sync cloud)
├── detail.html?id=...    → Detail + form klaim (sync cloud)
├── dashboard.html        → Admin: kelola, verifikasi, statistik, export CSV + Pengaturan DB
├── tentang.html          → Deskripsi sistem + FAQ sidang
├── css/style.css
├── js/store.js           → Cache LocalStorage + seed data (fallback offline)
├── js/supabase-config.js → Isi URL + ANON KEY Supabase di sini (permanen)
├── js/cloud.js           → Sync Supabase REST (fetch, tanpa npm/build)
├── js/main.js            → Helper UI (toast, navbar, card, kompres foto)
├── supabase-schema.sql   → Skema Postgres aktif (dijalankan di Supabase)
├── database.sql          → Skema MySQL lama untuk laporan Bab 3
└── PANDUAN-DATABASE.md   → Cara setup 5 menit + troubleshooting
```

## ▶️ Cara Menjalankan
1. Buka folder `pusat-barang-hilang`
2. Double-klik `index.html` (jalan di Chrome/Edge, tanpa XAMPP)
3. Atau jalankan server lokal: `npx serve .` lalu buka localhost

## 🎬 Skenario Demo Sidang (5 menit, beda device)
1. **Beranda (laptop):** tunjukkan `☁️ TERHUBUNG` + statistik
2. **Lapor Hilang (HP):** isi form dompet → langsung muncul di laptop
3. **Lapor Temuan (laptop):** isi form kunci → cek muncul di HP
4. **Detail → Klaim:** buka detail, klik "Klaim", isi bukti
5. **Dashboard:** tab Klaim → Setujui → status jadi "Sudah Kembali" di semua device
6. **Export CSV** + tunjukkan grafik kategori

## 🧠 Konsep untuk Laporan
- **Use Case:** Mahasiswa (lapor/cari/klaim), Penemu (lapor temuan), Admin (verifikasi)
- **Alur:** Lapor → Cari/Filter → Klaim → Verifikasi → Kembali
- **ERD:** tb_barang (1) — (N) tb_klaim (`item_id` FK, cascade delete)
- **Arsitektur data:** Cloud-first (Supabase/Postgres) + cache lokal (LocalStorage) untuk offline. Skema MySQL di `database.sql` tetap tersedia untuk varian PHP.

## 🔑 Catatan
- Indikator `☁️ TERHUBUNG` = beda device sinkron. `📴 Mode Lokal` = belum setting Supabase / offline.
- Tombol "Reset Data Demo" hanya mereset cache lokal, tidak menghapus cloud (hapus via Dashboard → Hapus).
- Upload foto dikompres otomatis (max 800px JPEG) agar hemat kuota cloud.
- Jangan taruh `service_role` key di frontend — pakai `anon public` saja.
