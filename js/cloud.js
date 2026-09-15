// ============================================================
// Pusat Barang Hilang — Cloud Sync (Supabase)
// Membuat riwayat barang bisa dilihat dari DEVICE BERBEDA.
//
// Prinsip:
// - Jika Supabase dikonfigurasi → data dibaca/tulis ke cloud (sumber utama),
//   localStorage hanya jadi cache/offline fallback.
// - Jika belum dikonfigurasi / offline → tetap jalan 100% lokal seperti dulu.
// - Tidak butuh npm / build / server. Murni fetch() REST, jalan di file://.
// ============================================================
(function () {
  'use strict';

  var LS_SB_URL = 'pbh_sb_url';
  var LS_SB_KEY = 'pbh_sb_key';

  window.PBH_CLOUD_MODE = 'local'; // 'cloud' | 'local'
  window.PBH_CLOUD_ERROR = '';

  function cleanUrl(u) {
    return String(u || '').trim().replace(/\/+$/, '');
  }

  function getSupabaseConfig() {
    var fileUrl = '', fileKey = '';
    var lsUrl = '', lsKey = '';
    try {
      if (typeof window.PBH_SUPABASE_URL === 'string') fileUrl = window.PBH_SUPABASE_URL.trim();
      if (typeof window.PBH_SUPABASE_ANON_KEY === 'string') fileKey = window.PBH_SUPABASE_ANON_KEY.trim();
    } catch (e) {}
    try {
      lsUrl = (localStorage.getItem(LS_SB_URL) || '').trim();
      lsKey = (localStorage.getItem(LS_SB_KEY) || '').trim();
    } catch (e) {}
    // Prioritas: file config (deploy permanen) → localStorage (setting dashboard)
    var url = fileUrl || lsUrl;
    var key = fileKey || lsKey;
    return { url: cleanUrl(url), key: String(key || '').trim() };
  }

  function isCloudEnabled() {
    var c = getSupabaseConfig();
    return !!(c.url && c.url.indexOf('https://') === 0 && c.key && c.key.length > 20);
  }

  function saveSupabaseConfig(url, key) {
    try {
      localStorage.setItem(LS_SB_URL, cleanUrl(url));
      localStorage.setItem(LS_SB_KEY, String(key || '').trim());
    } catch (e) {}
  }

  function clearSupabaseConfig() {
    try {
      localStorage.removeItem(LS_SB_URL);
      localStorage.removeItem(LS_SB_KEY);
    } catch (e) {}
  }

  function sbHeaders(extra) {
    var c = getSupabaseConfig();
    var h = {
      'apikey': c.key,
      'Authorization': 'Bearer ' + c.key,
      'Content-Type': 'application/json'
    };
    if (extra) for (var k in extra) h[k] = extra[k];
    return h;
  }

  function sbFetch(path, options) {
    var c = getSupabaseConfig();
    if (!c.url || !c.key) return Promise.reject(new Error('Supabase belum dikonfigurasi'));
    var opt = options || {};
    opt.headers = sbHeaders(opt.headers);
    return fetch(c.url + '/rest/v1/' + path, opt).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) {
          var msg = 'Supabase error ' + res.status;
          try {
            var j = JSON.parse(t);
            if (j.message) msg += ': ' + j.message;
            else if (j.hint) msg += ': ' + j.hint;
            else if (t) msg += ': ' + t.slice(0, 200);
          } catch (e) { if (t) msg += ': ' + t.slice(0, 200); }
          throw new Error(msg);
        });
      }
      var ct = res.headers.get('content-type') || '';
      if (ct.indexOf('application/json') >= 0) return res.json();
      return res.text().then(function (t) { return t ? JSON.parse(t) : []; });
    });
  }

  function normDate(d) {
    if (!d) return null;
    var s = String(d).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    return s;
  }

  // ---- mapping JS <-> Supabase (kolom createdat & item_id mengikuti konvensi SQL) ----
  function toCloudItem(it) {
    return {
      id: it.id,
      tipe: it.tipe,
      nama: it.nama,
      kategori: it.kategori,
      deskripsi: it.deskripsi || null,
      lokasi: it.lokasi || null,
      tanggal: normDate(it.tanggal),
      pelapor: it.pelapor || null,
      kontak: it.kontak || null,
      foto: it.foto || null,
      status: it.status || 'aktif',
      createdat: typeof it.createdAt === 'number' ? it.createdAt : Date.now()
    };
  }

  function fromCloudItem(r) {
    return {
      id: r.id,
      tipe: r.tipe,
      nama: r.nama,
      kategori: r.kategori,
      deskripsi: r.deskripsi || '',
      lokasi: r.lokasi || '',
      tanggal: r.tanggal || '',
      pelapor: r.pelapor || '',
      kontak: r.kontak || '',
      foto: r.foto || '',
      status: r.status || 'aktif',
      createdAt: typeof r.createdat === 'number' ? r.createdat : (r.created_at ? Date.parse(r.created_at) : Date.now())
    };
  }

  function toCloudClaim(c) {
    return {
      id: c.id,
      item_id: c.itemId,
      nama: c.nama,
      kontak: c.kontak,
      bukti: c.bukti,
      pesan: c.pesan || null,
      status: c.status || 'menunggu',
      tanggal: normDate(c.tanggal)
    };
  }

  function fromCloudClaim(r) {
    return {
      id: r.id,
      itemId: r.item_id,
      nama: r.nama,
      kontak: r.kontak,
      bukti: r.bukti,
      pesan: r.pesan || '',
      status: r.status || 'menunggu',
      tanggal: r.tanggal || ''
    };
  }

  // ---- operasi cloud mentah ----
  function fetchItemsCloud() {
    return sbFetch('tb_barang?select=*&order=createdat.desc&limit=1000').then(function (rows) {
      return (rows || []).map(fromCloudItem);
    });
  }

  function fetchClaimsCloud() {
    return sbFetch('tb_klaim?select=*&order=created_at.desc&limit=1000').then(function (rows) {
      return (rows || []).map(fromCloudClaim);
    });
  }

  function insertItemCloud(item) {
    return sbFetch('tb_barang', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(toCloudItem(item))
    });
  }

  function updateItemCloud(id, patch) {
    var body = {};
    if (patch.nama !== undefined) body.nama = patch.nama;
    if (patch.kategori !== undefined) body.kategori = patch.kategori;
    if (patch.deskripsi !== undefined) body.deskripsi = patch.deskripsi;
    if (patch.lokasi !== undefined) body.lokasi = patch.lokasi;
    if (patch.tanggal !== undefined) body.tanggal = normDate(patch.tanggal);
    if (patch.pelapor !== undefined) body.pelapor = patch.pelapor;
    if (patch.kontak !== undefined) body.kontak = patch.kontak;
    if (patch.foto !== undefined) body.foto = patch.foto;
    if (patch.tipe !== undefined) body.tipe = patch.tipe;
    if (patch.status !== undefined) body.status = patch.status;
    if (patch.createdAt !== undefined) body.createdat = patch.createdAt;
    return sbFetch('tb_barang?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  function deleteItemCloud(id) {
    return sbFetch('tb_barang?id=eq.' + encodeURIComponent(id), { method: 'DELETE' });
  }

  function insertClaimCloud(claim) {
    return sbFetch('tb_klaim', {
      method: 'POST',
      headers: { 'Prefer': 'return=representation' },
      body: JSON.stringify(toCloudClaim(claim))
    });
  }

  function updateClaimCloud(id, status) {
    return sbFetch('tb_klaim?id=eq.' + encodeURIComponent(id), {
      method: 'PATCH',
      body: JSON.stringify({ status: status })
    });
  }

  function testConnection() {
    return sbFetch('tb_barang?select=id&limit=1').then(function (rows) {
      return { ok: true, count_sample: (rows || []).length };
    });
  }

  // ---- API level tinggi (dipakai semua halaman) ----
  // Selalu tulis ke lokal dulu (biar UI instan + offline), lalu sync ke cloud di background.
  function getItemsAsync() {
    if (!isCloudEnabled()) {
      window.PBH_CLOUD_MODE = 'local';
      return Promise.resolve(typeof getItems === 'function' ? getItems() : []);
    }
    return fetchItemsCloud().then(function (items) {
      window.PBH_CLOUD_MODE = 'cloud';
      window.PBH_CLOUD_ERROR = '';
      try {
        var local = [];
        try { local = (typeof getItems === 'function') ? getItems() : []; } catch (e) {}
        // Jangan timpa cache lokal berisi data dengan cloud yang masih kosong
        // (terjadi saat pertama kali hubungkan sebelum migrasi).
        if ((!items || !items.length) && local && local.length) {
          return local;
        }
        if (typeof saveItems === 'function') saveItems(items);
        localStorage.setItem('pbh_last_sync', String(Date.now()));
      } catch (e) {}
      return items;
    }).catch(function (err) {
      window.PBH_CLOUD_MODE = 'local';
      window.PBH_CLOUD_ERROR = err.message;
      try { return typeof getItems === 'function' ? getItems() : []; }
      catch (e) { return []; }
    });
  }

  function getClaimsAsync() {
    if (!isCloudEnabled()) return Promise.resolve(typeof getClaims === 'function' ? getClaims() : []);
    return fetchClaimsCloud().then(function (claims) {
      try {
        var local = [];
        try { local = (typeof getClaims === 'function') ? getClaims() : []; } catch (e) {}
        if ((!claims || !claims.length) && local && local.length) return local;
        if (typeof saveClaims === 'function') saveClaims(claims);
      } catch (e) {}
      return claims;
    }).catch(function () {
      try { return typeof getClaims === 'function' ? getClaims() : []; }
      catch (e) { return []; }
    });
  }

  function addItemAsync(data) {
    var saved = (typeof addItem === 'function') ? addItem(data) : data;
    if (!isCloudEnabled()) return Promise.resolve(saved);
    return insertItemCloud(saved).then(function () {
      window.PBH_CLOUD_MODE = 'cloud';
      return saved;
    }).catch(function (err) {
      // kemungkinan id bentrok → coba update (upsert manual)
      if (String(err.message).indexOf('409') >= 0 || String(err.message).toLowerCase().indexOf('duplicate') >= 0) {
        return updateItemCloud(saved.id, saved).then(function () { return saved; }).catch(function () { return saved; });
      }
      window.PBH_CLOUD_ERROR = err.message;
      return saved; // tetap sukses lokal
    });
  }

  function updateItemAsync(id, patch) {
    try { if (typeof updateItem === 'function') updateItem(id, patch); } catch (e) {}
    if (!isCloudEnabled()) return Promise.resolve(true);
    return updateItemCloud(id, patch).catch(function (err) {
      window.PBH_CLOUD_ERROR = err.message;
      return false;
    }).then(function () { return true; });
  }

  function deleteItemAsync(id) {
    try { if (typeof deleteItem === 'function') deleteItem(id); } catch (e) {}
    if (!isCloudEnabled()) return Promise.resolve(true);
    return deleteItemCloud(id).catch(function () { return false; }).then(function () { return true; });
  }

  function addClaimAsync(data) {
    var saved = (typeof addClaim === 'function') ? addClaim(data) : data;
    if (!isCloudEnabled()) return Promise.resolve(saved);
    // addClaim lokal sudah mengubah status barang jadi 'menunggu' → sync keduanya
    return insertClaimCloud(saved).then(function () {
      return updateItemCloud(saved.itemId, { status: 'menunggu' }).catch(function () {});
    }).then(function () { return saved; }).catch(function (err) {
      window.PBH_CLOUD_ERROR = err.message;
      return saved;
    });
  }

  function updateClaimAsync(id, status) {
    try { if (typeof updateClaim === 'function') updateClaim(id, status); } catch (e) {}
    if (!isCloudEnabled()) return Promise.resolve(true);
    var claims = [];
    try { claims = typeof getClaims === 'function' ? getClaims() : []; } catch (e) {}
    var c = null;
    for (var i = 0; i < claims.length; i++) if (claims[i].id === id) c = claims[i];
    return updateClaimCloud(id, status).then(function () {
      if (!c) return true;
      var nextStatus = status === 'disetujui' ? 'kembali' : (status === 'ditolak' ? 'aktif' : null);
      if (nextStatus) return updateItemCloud(c.itemId, { status: nextStatus }).catch(function () {}).then(function () { return true; });
      return true;
    }).catch(function (err) {
      window.PBH_CLOUD_ERROR = err.message;
      return true; // lokal sudah benar
    });
  }

  // Upload data lokal (seed/demo + laporan lama) ke cloud sekali klik.
  function migrateLocalToCloud(onProgress) {
    var items = [];
    var claims = [];
    try { items = typeof getItems === 'function' ? getItems() : []; } catch (e) {}
    try { claims = typeof getClaims === 'function' ? getClaims() : []; } catch (e) {}
    var total = items.length + claims.length;
    var done = 0;
    function tick(msg) {
      done++;
      if (typeof onProgress === 'function') onProgress(done, total, msg);
    }
    var chain = Promise.resolve();
    items.forEach(function (it) {
      chain = chain.then(function () {
        return insertItemCloud(it).catch(function () {
          return updateItemCloud(it.id, it).catch(function () {});
        }).then(function () { tick(it.id); });
      });
    });
    claims.forEach(function (cl) {
      chain = chain.then(function () {
        return insertClaimCloud(cl).catch(function () {
          return updateClaimCloud(cl.id, cl.status).catch(function () {});
        }).then(function () { tick(cl.id); });
      });
    });
    return chain.then(function () { return { items: items.length, claims: claims.length }; });
  }

  // ---- indikator UI kecil: "☁️ Cloud" / "📴 Lokal" ----
  function renderCloudBadge(targetId) {
    var el = document.getElementById(targetId || 'cloudBadge');
    if (!el) return;
    if (isCloudEnabled()) {
      var mode = window.PBH_CLOUD_MODE === 'cloud' ? '☁️ Database Bersama: TERHUBUNG' : '☁️ Database Bersama: MENGHUBUNGKAN…';
      el.innerHTML = '<span class="tag tag-temuan">' + mode + '</span> <span class="hint">semua device lihat data yang sama</span>';
      el.style.display = '';
    } else {
      el.innerHTML = '<span class="tag tag-menunggu">📴 Mode Lokal</span> <span class="hint">beda device belum sinkron — hubungkan database di <a href="dashboard.html#pengaturan" style="color:var(--primary);font-weight:700">Dashboard → Pengaturan</a></span>';
      el.style.display = '';
    }
  }

  window.PBHCloud = {};
  window.getSupabaseConfig = getSupabaseConfig;
  window.isCloudEnabled = isCloudEnabled;
  window.saveSupabaseConfig = saveSupabaseConfig;
  window.clearSupabaseConfig = clearSupabaseConfig;
  window.testConnection = testConnection;
  window.getItemsAsync = getItemsAsync;
  window.getClaimsAsync = getClaimsAsync;
  window.addItemAsync = addItemAsync;
  window.updateItemAsync = updateItemAsync;
  window.deleteItemAsync = deleteItemAsync;
  window.addClaimAsync = addClaimAsync;
  window.updateClaimAsync = updateClaimAsync;
  window.migrateLocalToCloud = migrateLocalToCloud;
  window.renderCloudBadge = renderCloudBadge;
})();
