# 🔎 Pusat Pencarian Barang Hilang

Project Akhir — Website pendataan barang hilang & temuan kampus.
Teknologi: **HTML + CSS + JavaScript (LocalStorage, tanpa server)**.

## 📁 Struktur
```
pusat-barang-hilang/
├── index.html          → Beranda + pencarian & filter
├── lapor-hilang.html   → Form barang hilang
├── lapor-temuan.html   → Form barang temuan
├── detail.html?id=...  → Detail + form klaim
├── dashboard.html      → Admin: kelola, verifikasi, statistik, export CSV
├── tentang.html        → Deskripsi sistem + FAQ sidang
├── css/style.css
├── js/store.js         → Database LocalStorage + seed data
├── js/main.js          → Helper UI (toast, navbar, card)
└── database.sql        → Skema MySQL untuk laporan Bab 3
```

## ▶️ Cara Menjalankan
1. Buka folder `pusat-barang-hilang`
2. Double-klik `index.html` (jalan di Chrome/Edge, tanpa XAMPP)
3. Atau jalankan server lokal: `npx serve .` lalu buka localhost

## 🎬 Skenario Demo Sidang (5 menit)
1. **Beranda:** tunjukkan statistik + filter kategori
2. **Lapor Hilang:** isi form dompet → muncul di daftar
3. **Lapor Temuan:** isi form kunci → muncul di daftar
4. **Detail → Klaim:** buka detail, klik "Klaim", isi bukti
5. **Dashboard:** tab Klaim → Setujui → status jadi "Sudah Kembali"
6. **Export CSV** + tunjukkan grafik kategori

## 🧠 Konsep untuk Laporan
- **Use Case:** Mahasiswa (lapor/cari/klaim), Penemu (lapor temuan), Admin (verifikasi)
- **Alur:** Lapor → Cari/Filter → Klaim → Verifikasi → Kembali
- **ERD:** tb_barang (1) — (N) tb_klaim, tb_admin kelola keduanya
- **Pengembangan lanjut:** migrasi LocalStorage → MySQL + login PHP sesuai `database.sql`

## 🔑 Catatan
- Data tersimpan di `localStorage` browser. Tombol "Reset Data Demo" / di footer mengembalikan data awal.
- Upload foto disimpan sebagai base64 lokal (maksimal disarankan < 1MB per foto).
