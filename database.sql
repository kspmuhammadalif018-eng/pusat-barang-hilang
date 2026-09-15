-- Database: Pusat Pencarian Barang Hilang
-- Untuk laporan skripsi Bab 3 + migrasi ke PHP/MySQL
CREATE DATABASE IF NOT EXISTS db_barang_hilang CHARACTER SET utf8mb4;
USE db_barang_hilang;

CREATE TABLE tb_admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nama_posko VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tb_barang (
  id VARCHAR(20) PRIMARY KEY,
  tipe ENUM('hilang','temuan') NOT NULL,
  nama VARCHAR(150) NOT NULL,
  kategori ENUM('Elektronik','Dokumen','Kunci','Tas & Dompet','Pakaian','Aksesoris','Kendaraan','Lainnya') NOT NULL,
  deskripsi TEXT,
  lokasi VARCHAR(150),
  tanggal DATE,
  pelapor VARCHAR(100),
  kontak VARCHAR(50),
  foto VARCHAR(255),
  status ENUM('aktif','menunggu','kembali') DEFAULT 'aktif',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tb_klaim (
  id VARCHAR(20) PRIMARY KEY,
  barang_id VARCHAR(20) NOT NULL,
  nama VARCHAR(100) NOT NULL,
  kontak VARCHAR(50) NOT NULL,
  bukti TEXT NOT NULL,
  pesan TEXT,
  status ENUM('menunggu','disetujui','ditolak') DEFAULT 'menunggu',
  tanggal DATE,
  FOREIGN KEY (barang_id) REFERENCES tb_barang(id) ON DELETE CASCADE
);

INSERT INTO tb_admin (username,password,nama_posko) VALUES ('admin', MD5('admin123'), 'Posko Gedung A');
