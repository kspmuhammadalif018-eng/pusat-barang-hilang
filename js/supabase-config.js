// ============================================================
// KONFIGURASI DATABASE BERSAMA (Supabase)
// Supaya riwayat barang bisa dilihat dari HP / laptop berbeda.
//
// CARA PAKAI (pilih salah satu):
// A) Otomatis untuk semua device: isi URL + ANON KEY di bawah ini,
//    lalu semua device langsung terhubung tanpa setting lagi. (Recommended)
// B) Per-device: kosongkan di sini, lalu isi lewat Dashboard → Pengaturan
//    Database di tiap device (tersimpan di localStorage device itu).
//
// Cara dapat URL + KEY (gratis, 5 menit):
// 1. Buka https://supabase.com → New Project (free)
// 2. Buka SQL Editor → paste isi supabase-schema.sql → Run
// 3. Buka Project Settings → API → copy Project URL + anon public key
// 4. Paste ke bawah ini.
// ============================================================
window.PBH_SUPABASE_URL = "https://hulrtleitrilmlrgetfv.supabase.co";
window.PBH_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1bHJ0bGVpdHJpbG1scmdldGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NzE2ODYsImV4cCI6MjEwNTA0NzY4Nn0.6qysgb-lj2TsC1jqS5bCezlK2orgqYyrbCMaK_xrQaY";
