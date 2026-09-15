// Shared UI helpers
function toast(msg){
  let wrap = document.getElementById('toast');
  if(!wrap){ wrap = document.createElement('div'); wrap.id='toast'; document.body.appendChild(wrap); }
  const el = document.createElement('div');
  el.className='toast-item'; el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='.4s'; setTimeout(()=>el.remove(),400); }, 2600);
}
function setupNav(){
  const btn = document.getElementById('hamburger');
  const links = document.getElementById('navLinks');
  if(btn && links) btn.addEventListener('click', ()=> links.classList.toggle('open'));
  // tandai menu aktif
  const path = (location.pathname.split('/').pop()||'index.html').split('?')[0] || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a=>{
    const h = a.getAttribute('href');
    if(h===path) a.classList.add('active');
  });
}
function cardHTML(it){
  const img = it.foto ? `<img src="${it.foto}" alt="${escapeHtml(it.nama)}" onerror="this.remove()">` : iconFor(it.kategori);
  const tipeCls = it.tipe==='hilang'?'tag-hilang':'tag-temuan';
  const tipeTxt = it.tipe==='hilang'?'HILANG':'DITEMUKAN';
  const stCls = it.status==='aktif'?'tag-kat':it.status==='menunggu'?'tag-menunggu':'tag-kembali';
  return `<article class="item-card">
    <div class="item-img">${img}
      <span class="tag ${tipeCls}" style="position:absolute;top:12px;left:12px">${tipeTxt}</span>
    </div>
    <div class="item-body">
      <div class="item-meta"><span class="tag tag-kat">${iconFor(it.kategori)} ${escapeHtml(it.kategori)}</span><span class="tag ${stCls}">${statusLabel(it.status)}</span></div>
      <h3>${escapeHtml(it.nama)}</h3>
      <p class="desc">${escapeHtml(it.deskripsi||'')}</p>
      <div class="item-foot"><span>📍 ${escapeHtml((it.lokasi||'').slice(0,22))}</span><span>${fmtTanggal(it.tanggal)}</span></div>
      <a class="btn btn-outline btn-small" href="detail.html?id=${encodeURIComponent(it.id)}" style="margin-top:10px;justify-content:center">Lihat Detail →</a>
    </div>
  </article>`;
}
function escapeHtml(s){
  return String(s??'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
document.addEventListener('DOMContentLoaded', setupNav);
