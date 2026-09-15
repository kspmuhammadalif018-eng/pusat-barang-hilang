-- ============================================================
-- SUPABASE SCHEMA: Pusat Pencarian Barang Hilang
-- Database bersama supaya SEMUA DEVICE lihat riwayat yang sama
-- Cara pakai: copy-paste seluruh file ini ke Supabase → SQL Editor → Run
-- ============================================================

-- 1) Tabel barang (riwayat hilang + temuan)
create table if not exists public.tb_barang (
  id text primary key,
  tipe text not null check (tipe in ('hilang','temuan')),
  nama text not null,
  kategori text not null,
  deskripsi text,
  lokasi text,
  tanggal date,
  pelapor text,
  kontak text,
  foto text,
  status text not null default 'aktif' check (status in ('aktif','menunggu','kembali')),
  createdat bigint,
  created_at timestamptz default now()
);

-- 2) Tabel klaim
create table if not exists public.tb_klaim (
  id text primary key,
  item_id text not null references public.tb_barang(id) on delete cascade,
  nama text not null,
  kontak text not null,
  bukti text not null,
  pesan text,
  status text not null default 'menunggu' check (status in ('menunggu','disetujui','ditolak')),
  tanggal date,
  created_at timestamptz default now()
);

-- 3) Index biar pencarian cepat
create index if not exists idx_barang_tipe on public.tb_barang(tipe);
create index if not exists idx_barang_status on public.tb_barang(status);
create index if not exists idx_barang_kategori on public.tb_barang(kategori);
create index if not exists idx_barang_createdat on public.tb_barang(createdat desc);
create index if not exists idx_klaim_item on public.tb_klaim(item_id);
create index if not exists idx_klaim_status on public.tb_klaim(status);

-- 4) Aktifkan Row Level Security + buka akses untuk demo kampus
-- (anon key hanya bisa dipakai sesuai policy di bawah ini.
--  Untuk project akhir / demo sidang, akses publik read+write sudah cukup.
--  Untuk produksi, ganti dengan auth + policy per-user.)
alter table public.tb_barang enable row level security;
alter table public.tb_klaim enable row level security;

drop policy if exists "public_all_barang" on public.tb_barang;
create policy "public_all_barang" on public.tb_barang
  for all using (true) with check (true);

drop policy if exists "public_all_klaim" on public.tb_klaim;
create policy "public_all_klaim" on public.tb_klaim
  for all using (true) with check (true);

-- 5) (Opsional) Seed 2 data contoh — hapus comment jika ingin test cepat
-- insert into public.tb_barang (id, tipe, nama, kategori, deskripsi, lokasi, tanggal, pelapor, kontak, status, createdat)
-- values
-- ('BRG-001','hilang','Dompet Kulit Coklat','Tas & Dompet','Contoh seed dari SQL','Kantin Kampus Blok A', current_date,'Andi Pratama','0812-3456-7890','aktif', extract(epoch from now())::bigint*1000),
-- ('BRG-002','temuan','Kunci Motor Honda + Gantungan','Kunci','Contoh seed dari SQL','Parkiran Motor Belakang', current_date,'Satpam Budi','0813-1111-2222','aktif', extract(epoch from now())::bigint*1000)
-- on conflict (id) do nothing;
