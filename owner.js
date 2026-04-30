// ================================
// KEDAY 70 – OWNER DASHBOARD
// ================================

let user, activeBranch = 'all', editingMenuId = null;

document.addEventListener('DOMContentLoaded', () => {
  user = requireAuth('owner');
  if (!user) return;
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  document.getElementById('filterDate').value = new Date().toISOString().split('T')[0];
  loadOverview();
  loadTransaksi();
  loadMenuMgmt();
  loadLaporan();
  loadAkun();
  setInterval(() => { if (document.getElementById('sec-overview').classList.contains('active')) loadOverview(); }, 10000);
});

// ========== NAVIGATION ==========
function showSection(id) {
  document.querySelectorAll('.owner-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('sec-'+id).classList.add('active');
  document.getElementById('btn-'+id).classList.add('active');
}

function switchBranch(b) {
  activeBranch = b;
  document.querySelectorAll('.btab').forEach(el => el.classList.remove('active'));
  document.getElementById('btab-'+b).classList.add('active');
  loadOverview();
}

// ========== OVERVIEW ==========
function loadOverview() {
  const orders = getFilteredOrders(activeBranch);
  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);

  const revenue    = todayOrders.filter(o=>o.status==='selesai').reduce((s,o)=>s+o.total,0);
  const totalTx    = todayOrders.length;
  const pending    = todayOrders.filter(o=>o.status==='baru'||o.status==='proses').length;
  const avgOrder   = totalTx ? Math.round(revenue / Math.max(1, todayOrders.filter(o=>o.status==='selesai').length)) : 0;

  document.getElementById('kpiGrid').innerHTML = `
    <div class="kpi-card"><div class="kpi-icon">💰</div><div class="kpi-label">Pendapatan Hari Ini</div><div class="kpi-value">${formatRp(revenue)}</div><div class="kpi-sub">Dari transaksi selesai</div></div>
    <div class="kpi-card"><div class="kpi-icon">🧾</div><div class="kpi-label">Total Transaksi</div><div class="kpi-value">${totalTx}</div><div class="kpi-sub">Hari ini</div></div>
    <div class="kpi-card"><div class="kpi-icon">⏳</div><div class="kpi-label">Order Pending</div><div class="kpi-value" style="color:var(--red)">${pending}</div><div class="kpi-sub">Baru + Diproses</div></div>
    <div class="kpi-card"><div class="kpi-icon">📊</div><div class="kpi-label">Rata-rata Order</div><div class="kpi-value">${formatRp(avgOrder)}</div><div class="kpi-sub">Per transaksi</div></div>
  `;

  // Recent orders
  const recent = [...orders].sort((a,b)=>b.createdAt-a.createdAt).slice(0,8);
  document.getElementById('recentOrders').innerHTML = recent.length ? recent.map(o=>`
    <div class="recent-order-row">
      <div class="ro-num">${o.id}</div>
      <div><div style="font-size:.88rem;font-weight:600">${o.meja}</div><div style="font-size:.72rem;color:var(--text-dim)">${KEDAY.cabang[o.cabang]?.name||o.cabang}</div></div>
      <div style="font-size:.78rem;color:var(--text-dim)">${formatTime(o.createdAt)}</div>
      <div style="font-size:.88rem;font-weight:600">${formatRp(o.total)}</div>
      <div><span class="ro-badge badge-${o.status}">${o.status.charAt(0).toUpperCase()+o.status.slice(1)}</span></div>
    </div>`).join('') : '<div style="padding:20px;text-align:center;color:var(--text-dim)">Belum ada transaksi</div>';

  // Top menu
  const menuCount = {};
  orders.forEach(o => o.items.forEach(i => { menuCount[i.name] = (menuCount[i.name]||0)+i.qty; }));
  const sorted = Object.entries(menuCount).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const maxCount = sorted[0]?.[1] || 1;
  document.getElementById('topMenu').innerHTML = sorted.map(([name,count],i)=>`
    <div class="top-menu-item">
      <div class="tmi-rank">${i+1}</div>
      <div class="tmi-info"><div class="tmi-name">${name}</div><div class="tmi-count">${count} porsi terjual</div></div>
      <div class="tmi-bar-wrap"><div class="tmi-bar" style="width:${(count/maxCount*100).toFixed(0)}%"></div></div>
    </div>`).join('') || '<div style="color:var(--text-dim);font-size:.85rem">Belum ada data</div>';

  // Status chart
  const statusCount = { baru:0, proses:0, selesai:0 };
  orders.forEach(o => { if(statusCount[o.status]!==undefined) statusCount[o.status]++; });
  const total = Object.values(statusCount).reduce((a,b)=>a+b,0)||1;
  document.getElementById('orderStatusChart').innerHTML = `
    <div class="pie-wrap">
      <div class="pie-row"><div class="pie-dot" style="background:var(--red)"></div><div class="pie-label">Baru</div><div class="pie-bar-wrap"><div class="pie-bar" style="width:${(statusCount.baru/total*100).toFixed(0)}%;background:var(--red)"></div></div><div class="pie-val">${statusCount.baru}</div></div>
      <div class="pie-row"><div class="pie-dot" style="background:var(--gold)"></div><div class="pie-label">Proses</div><div class="pie-bar-wrap"><div class="pie-bar" style="width:${(statusCount.proses/total*100).toFixed(0)}%;background:var(--gold)"></div></div><div class="pie-val">${statusCount.proses}</div></div>
      <div class="pie-row"><div class="pie-dot" style="background:var(--green)"></div><div class="pie-label">Selesai</div><div class="pie-bar-wrap"><div class="pie-bar" style="width:${(statusCount.selesai/total*100).toFixed(0)}%;background:var(--green)"></div></div><div class="pie-val">${statusCount.selesai}</div></div>
    </div>`;
}

function getFilteredOrders(branch) {
  const all = getOrders();
  return branch === 'all' ? all : all.filter(o=>o.cabang===branch);
}

// ========== TRANSAKSI ==========
function loadTransaksi() {
  const cabang = document.getElementById('filterCabang').value;
  const date   = document.getElementById('filterDate').value;
  let orders = getOrders();
  if (cabang !== 'all') orders = orders.filter(o=>o.cabang===cabang);
  if (date) orders = orders.filter(o=>new Date(o.createdAt).toISOString().split('T')[0]===date);
  orders.sort((a,b)=>b.createdAt-a.createdAt);

  document.getElementById('transaksiBody').innerHTML = orders.map(o=>`
    <tr>
      <td style="font-family:'Bebas Neue';letter-spacing:1px;color:var(--gold)">${o.id}</td>
      <td>${KEDAY.cabang[o.cabang]?.name||o.cabang}</td>
      <td>${o.meja}</td>
      <td>${formatTime(o.createdAt)}</td>
      <td>${o.items.length} item</td>
      <td style="font-weight:600">${formatRp(o.total)}</td>
      <td><span class="ro-badge badge-${o.status}">${o.status}</span></td>
      <td><button onclick="viewOrder('${o.id}')" style="background:var(--gold-dim);border:1px solid var(--gold-border);color:var(--gold);padding:4px 10px;border-radius:6px;font-size:.75rem">Detail</button></td>
    </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--text-dim)">Tidak ada transaksi</td></tr>';
}

function viewOrder(id) {
  const o = getOrders().find(o=>o.id===id);
  if (!o) return;
  const items = o.items.map(i=>`${i.name} x${i.qty} = ${formatRp(i.price*i.qty)}`).join('\n');
  alert(`📋 Order ${o.id}\nMeja: ${o.meja}\nWaktu: ${new Date(o.createdAt).toLocaleString('id-ID')}\n\n${items}\n\nSubtotal: ${formatRp(o.subtotal)}\nPajak: ${formatRp(o.tax)}\nTotal: ${formatRp(o.total)}\n\nCatatan: ${o.note||'-'}`);
}

// ========== MENU MANAGEMENT ==========
function loadMenuMgmt() {
  const items = getMenuItems();
  document.getElementById('menuMgmtGrid').innerHTML = items.map(m=>`
    <div class="mgmt-card">
      <div class="mgmt-card-top">
        <div class="mgmt-emoji">${m.emoji}</div>
        <label class="toggle-switch" title="${m.avail?'Tersedia':'Tidak Tersedia'}">
          <input type="checkbox" ${m.avail?'checked':''} onchange="toggleMenuAvail('${m.id}',this.checked)"/>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="mgmt-name">${m.name}</div>
      <div class="mgmt-cat">${m.cat}</div>
      <div class="mgmt-price">${formatRp(m.price)}</div>
      <div class="mgmt-actions">
        <button class="mgmt-btn edit" onclick="openEditMenu('${m.id}')">✏️ Edit</button>
        <button class="mgmt-btn del" onclick="deleteMenu('${m.id}')">🗑 Hapus</button>
      </div>
    </div>`).join('');
}

function toggleMenuAvail(id, val) {
  const items = getMenuItems();
  const item = items.find(m=>m.id===id);
  if (item) { item.avail = val; saveMenuItems(items); showToast(`${item.name} ${val?'diaktifkan':'dinonaktifkan'}`); }
}

function openAddMenu() {
  editingMenuId = null;
  document.getElementById('menuModalTitle').textContent = 'Tambah Menu';
  document.getElementById('mNama').value = '';
  document.getElementById('mHarga').value = '';
  document.getElementById('mEmoji').value = '🍽️';
  document.getElementById('mAvail').checked = true;
  document.getElementById('menuModal').style.display = 'flex';
}

function openEditMenu(id) {
  editingMenuId = id;
  const items = getMenuItems();
  const m = items.find(i=>i.id===id);
  if (!m) return;
  document.getElementById('menuModalTitle').textContent = 'Edit Menu';
  document.getElementById('mNama').value = m.name;
  document.getElementById('mKategori').value = m.cat;
  document.getElementById('mHarga').value = m.price;
  document.getElementById('mEmoji').value = m.emoji;
  document.getElementById('mAvail').checked = m.avail;
  document.getElementById('menuModal').style.display = 'flex';
}

function saveMenu() {
  const nama   = document.getElementById('mNama').value.trim();
  const kat    = document.getElementById('mKategori').value;
  const harga  = parseInt(document.getElementById('mHarga').value);
  const emoji  = document.getElementById('mEmoji').value.trim() || '🍽️';
  const avail  = document.getElementById('mAvail').checked;
  if (!nama || !harga) { showToast('Nama dan harga wajib diisi!', 'error'); return; }

  const items = getMenuItems();
  if (editingMenuId) {
    const idx = items.findIndex(m=>m.id===editingMenuId);
    if (idx>=0) { items[idx] = {...items[idx], name:nama, cat:kat, price:harga, emoji, avail}; }
  } else {
    items.push({ id:'custom_'+Date.now(), cat:kat, emoji, name:nama, price:harga, avail });
  }
  saveMenuItems(items);
  closeMenuModal();
  loadMenuMgmt();
  showToast('✅ Menu disimpan!', 'success');
}

function deleteMenu(id) {
  if (!confirm('Hapus menu ini?')) return;
  const items = getMenuItems().filter(m=>m.id!==id);
  saveMenuItems(items);
  loadMenuMgmt();
  showToast('🗑 Menu dihapus');
}

function closeMenuModal() {
  document.getElementById('menuModal').style.display = 'none';
}

// ========== LAPORAN ==========
function loadLaporan() {
  const cabang = document.getElementById('laporanCabang').value;
  const period = document.getElementById('laporanPeriod').value;
  let orders = getOrders();
  if (cabang !== 'all') orders = orders.filter(o=>o.cabang===cabang);

  const now = new Date();
  if (period === 'today') {
    const today = now.toDateString();
    orders = orders.filter(o=>new Date(o.createdAt).toDateString()===today);
  } else if (period === 'week') {
    const weekAgo = now - 7*24*3600*1000;
    orders = orders.filter(o=>o.createdAt>=weekAgo);
  } else {
    orders = orders.filter(o=>new Date(o.createdAt).getMonth()===now.getMonth()&&new Date(o.createdAt).getFullYear()===now.getFullYear());
  }

  const done = orders.filter(o=>o.status==='selesai');
  const totalRev = done.reduce((s,o)=>s+o.total,0);
  const totalTx  = orders.length;
  const avgOrder = done.length ? Math.round(totalRev/done.length) : 0;

  document.getElementById('laporanSummary').innerHTML = `
    <div class="kpi-card"><div class="kpi-icon">💰</div><div class="kpi-label">Total Pendapatan</div><div class="kpi-value">${formatRp(totalRev)}</div></div>
    <div class="kpi-card"><div class="kpi-icon">🧾</div><div class="kpi-label">Jumlah Transaksi</div><div class="kpi-value">${totalTx}</div></div>
    <div class="kpi-card"><div class="kpi-icon">📊</div><div class="kpi-label">Rata-rata per Order</div><div class="kpi-value">${formatRp(avgOrder)}</div></div>`;

  // Simple bar chart via canvas
  const canvas = document.getElementById('laporanChart');
  const ctx = canvas.getContext('2d');
  const cabangData = {
    sukaseuri: orders.filter(o=>o.cabang==='sukaseuri').filter(o=>o.status==='selesai').reduce((s,o)=>s+o.total,0),
    purwasari:  orders.filter(o=>o.cabang==='purwasari').filter(o=>o.status==='selesai').reduce((s,o)=>s+o.total,0),
  };
  const maxVal = Math.max(...Object.values(cabangData), 1);
  canvas.width = canvas.parentElement.clientWidth - 40;
  canvas.height = 200;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const bars = [
    { label:'Sukaseuri', val:cabangData.sukaseuri, color:'#e2a925' },
    { label:'Purwasari',  val:cabangData.purwasari,  color:'#38a169' },
  ];
  const bw = 80, gap = 40, startX = (canvas.width - bars.length*(bw+gap))/2;
  bars.forEach((b,i)=>{
    const bh = (b.val/maxVal)*(canvas.height-60);
    const x = startX + i*(bw+gap);
    const y = canvas.height - bh - 30;
    const grad = ctx.createLinearGradient(x,y,x,canvas.height-30);
    grad.addColorStop(0,b.color); grad.addColorStop(1,b.color+'44');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.roundRect(x,y,bw,bh,6); ctx.fill();
    ctx.fillStyle = '#e8dcc8'; ctx.font = '13px DM Sans'; ctx.textAlign = 'center';
    ctx.fillText(b.label, x+bw/2, canvas.height-10);
    ctx.fillStyle = b.color; ctx.font = 'bold 12px DM Sans';
    ctx.fillText(formatRp(b.val).replace('Rp ','Rp'), x+bw/2, y-8);
  });
}

function exportLaporan() {
  const orders = getOrders();
  const rows = [['ID','Cabang','Meja','Waktu','Items','Subtotal','Pajak','Total','Status']];
  orders.forEach(o=>{
    rows.push([o.id, o.cabang, o.meja, new Date(o.createdAt).toLocaleString('id-ID'),
      o.items.map(i=>`${i.name}x${i.qty}`).join('; '),
      o.subtotal, o.tax, o.total, o.status]);
  });
  const csv = rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `laporan-keday70-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  showToast('📥 Laporan diexport!', 'success');
}

// ========== AKUN ==========
function loadAkun() {
  document.getElementById('akunGrid').innerHTML = USERS.map(u=>`
    <div class="akun-card">
      <div class="akun-avatar ${u.role}">${u.role==='kasir'?'🧾':u.role==='dapur'?'👨‍🍳':'👑'}</div>
      <div class="akun-info">
        <div class="akun-name">${u.name}</div>
        <div class="akun-role">${u.role.toUpperCase()}</div>
        <div class="akun-cabang">${u.cabang==='all'?'Semua Cabang':KEDAY.cabang[u.cabang]?.name||u.cabang}</div>
      </div>
    </div>`).join('');
}

function openAddAkun() {
  showToast('Fitur tambah akun: hubungi developer untuk update data.js', '');
}
