// Pusat Pencarian Barang Hilang - Data Store (localStorage)
const LS_ITEMS = 'pbh_items_v1';
const LS_CLAIMS = 'pbh_claims_v1';

const KATEGORI = ['Elektronik','Dokumen','Kunci','Tas & Dompet','Pakaian','Aksesoris','Kendaraan','Lainnya'];
const KAT_ICON = {
  'Elektronik':'📱','Dokumen':'📄','Kunci':'🔑','Tas & Dompet':'👜',
  'Pakaian':'👕','Aksesoris':'⌚','Kendaraan':'🛵','Lainnya':'📦'
};

function seedItems(){
  const now = Date.now();
  const d = (n)=> new Date(now - n*86400000).toISOString().slice(0,10);
  return [
    {id:'BRG-001',tipe:'hilang',nama:'Dompet Kulit Coklat',kategori:'Tas & Dompet',deskripsi:'Dompet kulit coklat berisi KTP a.n. Andi Pratama, SIM, dan uang tunai. Hilang di area kantin kampus lantai 1.',lokasi:'Kantin Kampus Blok A',tanggal:d(1),pelapor:'Andi Pratama',kontak:'0812-3456-7890',foto:'',status:'aktif',createdAt:now-86400000},
    {id:'BRG-002',tipe:'temuan',nama:'Kunci Motor Honda + Gantungan',kategori:'Kunci',deskripsi:'Ditemukan kunci motor Honda dengan gantungan kayu ukiran. Ditemukan di parkiran motor belakang.',lokasi:'Parkiran Motor Belakang',tanggal:d(0),pelapor:'Satpam Budi',kontak:'0813-1111-2222',foto:'',status:'aktif',createdAt:now-3600000*5},
    {id:'BRG-003',tipe:'hilang',nama:'Laptop Lenovo ThinkPad Hitam',kategori:'Elektronik',deskripsi:'Laptop Lenovo ThinkPad warna hitam dengan stiker himpunan di cover. Tas hitam ikut hilang.',lokasi:'Ruang Lab Komputer 2',tanggal:d(2),pelapor:'Sinta Dewi',kontak:'0821-9999-8888',foto:'',status:'aktif',createdAt:now-172800000},
    {id:'BRG-004',tipe:'temuan',nama:'KTM / Kartu Mahasiswa',kategori:'Dokumen',deskripsi:'KTM atas nama Rizky Ramadhan NIM 2023XXXX. Ditemukan di tangga gedung B lantai 2.',lokasi:'Gedung B Lantai 2',tanggal:d(0),pelapor:'Cleaning Service',kontak:'Pos Satpam Gedung B',foto:'',status:'aktif',createdAt:now-3600000*8},
    {id:'BRG-005',tipe:'hilang',nama:'AirPods Pro Putih + Case',kategori:'Elektronik',deskripsi:'AirPods Pro putih dengan case ada goresan di sisi kanan. Hilang saat olahraga sore.',lokasi:'Lapangan Basket Kampus',tanggal:d(3),pelapor:'Dimas A.',kontak:'0896-7777-6666',foto:'',status:'menunggu',createdAt:now-259200000},
    {id:'BRG-006',tipe:'temuan',nama:'Jaket Hoodie Erigo Hitam',kategori:'Pakaian',deskripsi:'Jaket hoodie Erigo hitam ukuran L tertinggal di ruang kelas C.3. Sudah dicuci dan disimpan di posko.',lokasi:'Ruang Kelas C.3',tanggal:d(1),pelapor:'Posko Barang Hilang',kontak:'0812-0000-1111',foto:'',status:'aktif',createdAt:now-90000000},
    {id:'BRG-007',tipe:'hilang',nama:'STNK + Kunci Motor Vario',kategori:'Dokumen',deskripsi:'STNK Vario 160 B 5234 XYZ beserta kunci kontak hilang di sekitar fotokopian depan kampus.',lokasi:'Fotokopian Depan Kampus',tanggal:d(5),pelapor:'Putri Ayu',kontak:'0857-3333-4444',foto:'',status:'aktif',createdAt:now-432000000},
    {id:'BRG-008',tipe:'temuan',nama:'Jam Tangan Casio Hitam',kategori:'Aksesoris',deskripsi:'Jam tangan Casio digital hitam ditemukan di musholla putra lantai 1.',lokasi:'Musholla Kampus',tanggal:d(2),pelapor:'Takmir Musholla',kontak:'Pos Satpam Utama',foto:'',status:'kembali',createdAt:now-200000000},
    {id:'BRG-009',tipe:'temuan',nama:'Flashdisk Sandisk 32GB Merah',kategori:'Elektronik',deskripsi:'Flashdisk Sandisk 32GB merah berisi file tugas. Ditemukan colokan di PC Lab 1 nomor 12.',lokasi:'Lab Komputer 1',tanggal:d(4),pelapor:'Aslab Rian',kontak:'0822-5555-4444',foto:'',status:'aktif',createdAt:now-350000000},
  ];
}

function loadJSON(key, fallback){
  try{ const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch(e){ return fallback; }
}
function saveJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

function ensureSeed(){
  if(!localStorage.getItem(LS_ITEMS)) saveJSON(LS_ITEMS, seedItems());
  if(!localStorage.getItem(LS_CLAIMS)){
    saveJSON(LS_CLAIMS, [
      {id:'CLM-001',itemId:'BRG-005',nama:'Dimas A.',kontak:'0896-7777-6666',bukti:'Foto box AirPods + nota pembelian',pesan:'Itu milik saya, ada goresan sesuai deskripsi.',status:'menunggu',tanggal:new Date().toISOString().slice(0,10)}
    ]);
  }
}
function getItems(){ ensureSeed(); return loadJSON(LS_ITEMS, []); }
function saveItems(arr){ saveJSON(LS_ITEMS, arr); }
function getClaims(){ ensureSeed(); return loadJSON(LS_CLAIMS, []); }
function saveClaims(arr){ saveJSON(LS_CLAIMS, arr); }

function addItem(data){
  const items = getItems();
  const num = items.length+1+Math.floor(Math.random()*80);
  const id = 'BRG-' + String(num).padStart(3,'0') + '-' + Date.now().toString().slice(-3);
  const obj = Object.assign({id, status:'aktif', createdAt:Date.now()}, data);
  items.unshift(obj); saveItems(items); return obj;
}
function getItemById(id){ return getItems().find(x=>x.id===id); }
function updateItem(id, patch){
  const items = getItems(); const i = items.findIndex(x=>x.id===id);
  if(i>=0){ items[i]=Object.assign({},items[i],patch); saveItems(items); return items[i]; } return null;
}
function deleteItem(id){ saveItems(getItems().filter(x=>x.id!==id)); }
function addClaim(data){
  const claims = getClaims();
  const id = 'CLM-' + Date.now().toString().slice(-6);
  const obj = Object.assign({id, status:'menunggu', tanggal:new Date().toISOString().slice(0,10)}, data);
  claims.unshift(obj); saveClaims(claims);
  updateItem(data.itemId,{status:'menunggu'});
  return obj;
}
function updateClaim(id, status){
  const claims = getClaims(); const c = claims.find(x=>x.id===id);
  if(!c) return;
  c.status = status; saveClaims(claims);
  if(status==='disetujui') updateItem(c.itemId,{status:'kembali'});
  else if(status==='ditolak') updateItem(c.itemId,{status:'aktif'});
}
function resetDemo(){ localStorage.removeItem(LS_ITEMS); localStorage.removeItem(LS_CLAIMS); ensureSeed(); }

function iconFor(kat){ return KAT_ICON[kat] || '📦'; }
function fmtTanggal(t){
  if(!t) return '-';
  try{
    const d = new Date(t.length<=10 ? t+'T00:00:00' : t);
    return d.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
  }catch(e){ return t; }
}
function statusLabel(s){
  return s==='aktif'?'Terdaftar':s==='menunggu'?'Menunggu Verifikasi':s==='kembali'?'Sudah Kembali':s;
}
