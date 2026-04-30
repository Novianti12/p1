// ================================
// KEDAY 70 – PROFILE & SHIFT SYSTEM (v4 - Rekap Kas)
// ================================

let profileUser = null;

function initProfile(role) {
  profileUser = getSession();
  if (!profileUser) return;
  renderProfileModal(role);
}

// ========== OPEN PROFILE MODAL ==========
function openProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) {
    modal.style.display = 'flex';
    refreshProfileContent();
  }
}
function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) modal.style.display = 'none';
}

// ========== REFRESH CONTENT ==========
function refreshProfileContent() {
  const user = getSession();
  if (!user) return;
  const cabangInfo = KEDAY.cabang[user.cabang] || { name:'Semua Cabang' };
  const shift = getShiftState(user.cabang, user.role);
  const roleEmoji = user.role === 'kasir' ? '🧾' : user.role === 'dapur' ? '👨‍🍳' : '👑';

  const now = new Date();
  const todayStr = now.toDateString();
  const todayOrders = getOrders().filter(o =>
    new Date(o.createdAt).toDateString() === todayStr &&
    (user.cabang === 'all' || o.cabang === user.cabang)
  );

  const totalPendapatan = todayOrders.filter(o=>o.status==='selesai').reduce((s,o)=>s+o.total,0);
  const totalTransaksi = todayOrders.length;

  let shiftStatus = '';
  if (shift && shift.status === 'open') {
    const dur = Math.floor((Date.now() - shift.openTime) / 60000);
    const hours = Math.floor(dur/60);
    const mins = dur % 60;
    shiftStatus = `
      <div class="profile-shift-info open">
        <div class="psi-indicator">🟢</div>
        <div>
          <div style="font-weight:600;color:#68d391">Shift Aktif</div>
          <div style="font-size:.78rem;color:var(--text-dim)">Buka: ${formatTime(shift.openTime)} · Durasi: ${hours > 0 ? hours+'j ' : ''}${mins}m</div>
          <div style="font-size:.78rem;color:var(--text-dim)">Modal Awal: ${formatRp(shift.modal || 0)}</div>
        </div>
      </div>`;
  } else {
    shiftStatus = `<div class="profile-shift-info closed"><div class="psi-indicator">🔴</div><div><div style="font-weight:600;color:var(--red)">Shift Belum Dibuka</div><div style="font-size:.78rem;color:var(--text-dim)">Gunakan tombol Open di bawah</div></div></div>`;
  }

  let extraSection = '';
  if (user.role === 'kasir') {
    extraSection = buildKasirProfileExtra(shift, todayOrders, totalPendapatan);
  } else if (user.role === 'dapur') {
    extraSection = buildDapurProfileExtra(shift, todayOrders);
  } else if (user.role === 'owner') {
    extraSection = buildOwnerProfileExtra(todayOrders, totalPendapatan);
  }

  document.getElementById('profileContent').innerHTML = `
    <div class="profile-user-card">
      <div class="profile-avatar">${roleEmoji}</div>
      <div class="profile-user-info">
        <div class="profile-name">${user.name}</div>
        <div class="profile-role-badge">${user.role.toUpperCase()}</div>
        <div class="profile-cabang">${cabangInfo.name}</div>
        <div class="profile-username">@${user.username}</div>
      </div>
    </div>

    <div class="profile-stats-row">
      <div class="pstat">
        <div class="pstat-num">${totalTransaksi}</div>
        <div class="pstat-label">Transaksi Hari Ini</div>
      </div>
      <div class="pstat">
        <div class="pstat-num" style="font-size:.95rem">${formatRp(totalPendapatan)}</div>
        <div class="pstat-label">Pendapatan Hari Ini</div>
      </div>
      <div class="pstat">
        <div class="pstat-num">${todayOrders.filter(o=>o.status==='baru'||o.status==='proses').length}</div>
        <div class="pstat-label">Order Pending</div>
      </div>
    </div>

    <div class="profile-section">
      <div class="profile-section-title">📋 Status Shift</div>
      ${shiftStatus}
    </div>

    ${extraSection}

    <div class="profile-section">
      <div class="profile-section-title">⚙️ Pengaturan</div>
      <div class="profile-setting-row">
        <span>🔔 Notifikasi Suara</span>
        <label class="toggle-switch">
          <input type="checkbox" id="settingSound" ${localStorage.getItem('k70_sound') !== 'off' ? 'checked' : ''}
            onchange="localStorage.setItem('k70_sound', this.checked ? 'on' : 'off')"/>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="profile-setting-row">
        <span>🖨️ Auto Print Slip Dapur</span>
        <label class="toggle-switch">
          <input type="checkbox" id="settingAutoPrint" ${localStorage.getItem('k70_autoprint') !== 'off' ? 'checked' : ''}
            onchange="localStorage.setItem('k70_autoprint', this.checked ? 'on' : 'off')"/>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="profile-setting-row">
        <span>⏱️ Interval Refresh Dapur</span>
        <select style="background:var(--card-bg);border:1px solid var(--gold-border);color:var(--text);padding:4px 8px;border-radius:6px;font-size:.8rem"
          onchange="localStorage.setItem('k70_refresh', this.value)">
          <option value="2500" ${localStorage.getItem('k70_refresh')==='2500'?'selected':''}>2.5 detik</option>
          <option value="5000" ${localStorage.getItem('k70_refresh')==='5000'||!localStorage.getItem('k70_refresh')?'selected':''}>5 detik</option>
          <option value="10000" ${localStorage.getItem('k70_refresh')==='10000'?'selected':''}>10 detik</option>
        </select>
      </div>
    </div>

    <div class="profile-section">
      <div class="profile-section-title">📅 Riwayat Shift (7 Hari Terakhir)</div>
      ${buildShiftHistory(user.cabang, user.role)}
    </div>

    <div style="margin-top:8px;display:flex;gap:10px">
      <button class="btn-clear" onclick="closeProfileModal()" style="flex:1">✕ Tutup</button>
      <button class="btn-send" onclick="if(confirm('Yakin logout?')){window.location='index.html'}" style="flex:1;background:rgba(200,50,50,.15);border-color:rgba(200,50,50,.4);color:#fc8181">⏻ Logout</button>
    </div>`;
}

// ========== KASIR SECTION ==========
function buildKasirProfileExtra(shift, todayOrders, totalPendapatan) {
  const isOpen = shift && shift.status === 'open';
  return `
    <div class="profile-section">
      <div class="profile-section-title">🧾 Operasional Kasir</div>

      ${!isOpen ? `
      <div class="shift-open-box">
        <div style="font-size:.85rem;color:var(--text-dim);margin-bottom:10px">
          Buka kasir dengan mengisi modal awal:
        </div>
        <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px">
          <label style="font-size:.82rem;white-space:nowrap">Modal Awal:</label>
          <input type="number" id="inputModal" value="100000" min="0" step="10000"
            style="flex:1;background:var(--card-bg);border:1px solid var(--gold-border);color:var(--text);padding:8px 12px;border-radius:8px;font-size:.9rem"/>
        </div>
        <button class="btn-send" style="width:100%" onclick="doOpenKasir()">
          🔓 Buka Kasir (Open Shift)
        </button>
      </div>` : `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <button class="profile-action-btn" onclick="openRekapKasModal()">
          📋 Rekap Kas
        </button>
        <button class="profile-action-btn danger" onclick="openTutupKasirModal()">
          🔒 Tutup Kasir
        </button>
      </div>
      <div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <button class="profile-action-btn" onclick="openUangMasukModal()">
          💚 Uang Masuk
        </button>
        <button class="profile-action-btn" onclick="openUangKeluarModal()">
          ❤️ Uang Keluar
        </button>
      </div>
      <div style="margin-top:10px">
        <button class="profile-action-btn" style="width:100%" onclick="previewRekapHarian()">
          📊 Preview Rekap Harian
        </button>
      </div>`}
    </div>`;
}

// ========== DAPUR SECTION ==========
function buildDapurProfileExtra(shift, todayOrders) {
  const isOpen = shift && shift.status === 'open';
  const selesaiCount = todayOrders.filter(o=>o.status==='selesai').length;
  const prosesCount = todayOrders.filter(o=>o.status==='proses').length;
  return `
    <div class="profile-section">
      <div class="profile-section-title">👨‍🍳 Operasional Dapur</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div class="pstat" style="background:rgba(56,161,105,.1);border:1px solid rgba(56,161,105,.3)">
          <div class="pstat-num" style="color:#68d391">${selesaiCount}</div>
          <div class="pstat-label">Selesai Dimasak</div>
        </div>
        <div class="pstat" style="background:rgba(226,169,37,.1);border:1px solid rgba(226,169,37,.3)">
          <div class="pstat-num" style="color:var(--gold)">${prosesCount}</div>
          <div class="pstat-label">Sedang Masak</div>
        </div>
      </div>
      ${!isOpen ? `
        <button class="btn-send" style="width:100%" onclick="doOpenDapur()">
          🔥 Buka Dapur (Start Kitchen)
        </button>
      ` : `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <button class="profile-action-btn" onclick="printRekapDapur()">
            🖨️ Rekap Dapur Hari Ini
          </button>
          <button class="profile-action-btn danger" onclick="doTutupDapur()">
            🔒 Tutup Dapur
          </button>
        </div>
      `}
    </div>`;
}

// ========== OWNER SECTION ==========
function buildOwnerProfileExtra(todayOrders, totalPendapatan) {
  return `
    <div class="profile-section">
      <div class="profile-section-title">👑 Panel Owner</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <button class="profile-action-btn" onclick="printRekapOwner()">
          🖨️ Rekap Semua Cabang
        </button>
        <button class="profile-action-btn" onclick="exportOwnerCSV()">
          📥 Export CSV Hari Ini
        </button>
      </div>
    </div>`;
}

// ========== SHIFT HISTORY ==========
function buildShiftHistory(cabang, role) {
  const hist = getShiftHistory(cabang).filter(h => role === 'owner' || h.role === role).slice(-7).reverse();
  if (!hist.length) return `<div style="color:var(--text-dim);font-size:.82rem;text-align:center;padding:12px">Belum ada riwayat shift</div>`;
  return hist.map(h => `
    <div class="shift-hist-row">
      <div>
        <div style="font-size:.82rem;font-weight:600">${formatDate(h.openTime)}</div>
        <div style="font-size:.72rem;color:var(--text-dim)">${h.role.toUpperCase()} · ${formatTime(h.openTime)} – ${h.closeTime ? formatTime(h.closeTime) : 'Belum ditutup'}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:.82rem;color:var(--gold);font-weight:600">${formatRp(h.totalPendapatan || 0)}</div>
        <div style="font-size:.72rem;color:var(--text-dim)">${h.totalTransaksi || 0} transaksi</div>
      </div>
    </div>`).join('');
}

// ========== OPEN KASIR ==========
function doOpenKasir() {
  const user = getSession();
  const modal = parseInt(document.getElementById('inputModal').value) || 100000;
  const shiftData = {
    status: 'open',
    role: 'kasir',
    cabang: user.cabang,
    kasir: user.name,
    openTime: Date.now(),
    modal,
    uangMasuk: [],
    uangKeluar: [],
    totalPendapatan: 0,
    totalTransaksi: 0,
  };
  saveShiftState(user.cabang, 'kasir', shiftData);
  showToast(`✅ Kasir dibuka! Modal: ${formatRp(modal)}`, 'success');
  refreshProfileContent();
}

// ========== OPEN DAPUR ==========
function doOpenDapur() {
  const user = getSession();
  const shiftData = {
    status: 'open',
    role: 'dapur',
    cabang: user.cabang,
    dapur: user.name,
    openTime: Date.now(),
  };
  saveShiftState(user.cabang, 'dapur', shiftData);
  showToast('🔥 Dapur dibuka! Siap masak!', 'success');
  refreshProfileContent();
}

// ========== REKAP KAS MODAL (mirip app foto) ==========
function openRekapKasModal() {
  const user = getSession();
  const cabang = user.cabang;

  // Build list: active shift first, then history
  const activeShift = getShiftState(cabang, 'kasir');
  const history = getShiftHistory(cabang).filter(h => h.role === 'kasir').slice(-10).reverse();

  let listHtml = '';

  // Active shift
  if (activeShift && activeShift.status === 'open') {
    const d = new Date(activeShift.openTime);
    const label = d.toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'short', year:'numeric'}) + ' ' + formatTime(activeShift.openTime);
    listHtml += `
      <div style="margin-bottom:16px">
        <div style="font-size:.8rem;font-weight:700;margin-bottom:6px;color:var(--text)">${label}</div>
        <div style="background:var(--card-bg);border:1px solid var(--gold-border);border-radius:10px;padding:14px;cursor:pointer"
          onclick="openDetailKas(null)">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:600">kasir</div>
              <div style="font-size:.78rem;color:#68d391;font-weight:600">Terbuka</div>
            </div>
            <div style="font-size:1.2rem;color:var(--text-dim)">›</div>
          </div>
        </div>
      </div>`;
  }

  // Uang Masuk / Uang Keluar buttons
  listHtml += `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">
      <button onclick="openUangMasukModal()" style="background:#276749;border:none;color:#fff;font-weight:700;padding:14px;border-radius:10px;font-size:.9rem;cursor:pointer">
        Uang Masuk
      </button>
      <button onclick="openUangKeluarModal()" style="background:var(--red, #e53e3e);border:none;color:#fff;font-weight:700;padding:14px;border-radius:10px;font-size:.9rem;cursor:pointer">
        Uang Keluar
      </button>
    </div>`;

  // History shifts
  history.forEach(h => {
    const d = new Date(h.openTime);
    const label = d.toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'short', year:'numeric'});
    const closeLabel = h.closeTime ? formatTime(h.closeTime) : '-';
    listHtml += `
      <div style="margin-bottom:16px">
        <div style="font-size:.8rem;font-weight:700;margin-bottom:6px;color:var(--text)">${label}</div>
        <div style="background:var(--card-bg);border:1px solid var(--gold-border);border-radius:10px;padding:14px;cursor:pointer"
          onclick="openDetailKas('${h.openTime}')">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:600">kasir</div>
              <div style="font-size:.78rem;color:var(--text-dim)">Selesai</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:.78rem;color:var(--text-dim)">${closeLabel}</span>
              <span style="font-size:1.2rem;color:var(--text-dim)">›</span>
            </div>
          </div>
        </div>
      </div>`;
  });

  document.getElementById('rekapPreviewContent').innerHTML = `
    <div style="padding:4px">
      <div style="font-size:1rem;font-weight:700;margin-bottom:16px">📋 Rekap Kas</div>
      ${listHtml}
    </div>`;
  document.getElementById('rekapModal').style.display = 'flex';
}

// ========== DETAIL KAS (mirip screen "Detail Kas" di foto) ==========
function openDetailKas(openTime) {
  const user = getSession();
  let shift;
  if (openTime === null) {
    shift = getShiftState(user.cabang, 'kasir');
  } else {
    shift = getShiftHistory(user.cabang).find(h => String(h.openTime) === String(openTime));
  }
  if (!shift) return;

  const todayOrders = getOrders().filter(o => {
    const d = new Date(o.createdAt).toDateString();
    const sd = new Date(shift.openTime).toDateString();
    return d === sd && o.cabang === user.cabang;
  });

  const transaksiTunai = todayOrders.filter(o => o.payMethod === 'cash').reduce((s,o) => s+o.total, 0);
  const transaksiNontunai = todayOrders.filter(o => o.payMethod === 'transfer' || o.payMethod === 'qris').reduce((s,o) => s+o.total, 0);
  const kasAwal = shift.modal || 0;
  const jumlahTunaiDiharapkan = kasAwal + transaksiTunai;
  const totalPenerimaan = jumlahTunaiDiharapkan + transaksiNontunai;

  // Additional cash in/out
  const uangMasuk = (shift.uangMasuk || []);
  const uangKeluar = (shift.uangKeluar || []);

  // Build kas awal entry for Detail Kas list
  const d = new Date(shift.openTime);
  const waktuLabel = d.toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'short', year:'numeric'}) + ' ' +
    formatTime(shift.openTime);

  let kasDetailHtml = `
    <!-- Uang Awal entry -->
    <div style="border-bottom:1px solid var(--gold-border);padding:12px 0">
      <div style="display:inline-block;background:#276749;color:#fff;font-size:.7rem;padding:2px 10px;border-radius:4px;margin-bottom:8px">💵 Uang Awal</div>
      <div style="display:flex;justify-content:flex-end;font-size:.9rem;font-weight:700;color:#68d391;margin-bottom:6px">+${formatRp(kasAwal)}</div>
      <div style="font-size:.75rem;color:var(--text-dim)">Keterangan:</div>
      <div style="display:flex;justify-content:space-between;font-size:.78rem">
        <span>Waktu</span><span>${waktuLabel}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:.78rem">
        <span>Nama Pegawai</span><span>${shift.kasir || user.name}</span>
      </div>
      <div style="font-size:.75rem;color:var(--text-dim);margin-top:4px">Catatan:</div>
      <div style="font-size:.78rem">Kas Awal</div>
    </div>`;

  // Additional uang masuk
  uangMasuk.forEach(um => {
    kasDetailHtml += `
      <div style="border-bottom:1px solid var(--gold-border);padding:12px 0">
        <div style="display:inline-block;background:#276749;color:#fff;font-size:.7rem;padding:2px 10px;border-radius:4px;margin-bottom:8px">💚 Uang Masuk</div>
        <div style="display:flex;justify-content:flex-end;font-size:.9rem;font-weight:700;color:#68d391;margin-bottom:6px">+${formatRp(um.jumlah)}</div>
        <div style="display:flex;justify-content:space-between;font-size:.78rem">
          <span>Waktu</span><span>${new Date(um.waktu).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'short',year:'numeric'})} ${formatTime(um.waktu)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.78rem">
          <span>Nama Pegawai</span><span>${um.pegawai}</span>
        </div>
        <div style="font-size:.75rem;color:var(--text-dim);margin-top:4px">Catatan:</div>
        <div style="font-size:.78rem">${um.catatan || '-'}</div>
      </div>`;
  });

  // Additional uang keluar
  uangKeluar.forEach(uk => {
    kasDetailHtml += `
      <div style="border-bottom:1px solid var(--gold-border);padding:12px 0">
        <div style="display:inline-block;background:#e53e3e;color:#fff;font-size:.7rem;padding:2px 10px;border-radius:4px;margin-bottom:8px">❤️ Uang Keluar</div>
        <div style="display:flex;justify-content:flex-end;font-size:.9rem;font-weight:700;color:#fc8181;margin-bottom:6px">-${formatRp(uk.jumlah)}</div>
        <div style="display:flex;justify-content:space-between;font-size:.78rem">
          <span>Waktu</span><span>${new Date(uk.waktu).toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'short',year:'numeric'})} ${formatTime(uk.waktu)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.78rem">
          <span>Nama Pegawai</span><span>${uk.pegawai}</span>
        </div>
        <div style="font-size:.75rem;color:var(--text-dim);margin-top:4px">Catatan:</div>
        <div style="font-size:.78rem">${uk.catatan || '-'}</div>
      </div>`;
  });

  if (!uangMasuk.length && !uangKeluar.length) {
    kasDetailHtml += `<div style="text-align:center;color:var(--text-dim);font-size:.82rem;padding:20px">Tidak ada data lagi.</div>`;
  }

  document.getElementById('rekapPreviewContent').innerHTML = `
    <div style="padding:4px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <button onclick="openRekapKasModal()" style="background:none;border:none;color:var(--text);font-size:1.1rem;cursor:pointer;padding:0">←</button>
        <div style="font-size:1rem;font-weight:700">Detail Kas</div>
      </div>

      <!-- Penerimaan Sistem -->
      <div style="background:var(--card-bg);border:1px solid var(--gold-border);border-radius:10px;padding:14px;margin-bottom:14px">
        <div style="font-weight:700;font-size:.9rem;margin-bottom:10px">Penerimaan Sistem</div>
        <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:4px">
          <span>Total Kas</span><span>${formatRp(0)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:4px">
          <span>Transaksi Tunai</span><span>${formatRp(transaksiTunai)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:4px">
          <span>Jumlah tunai yang diharapkan</span><span>${formatRp(jumlahTunaiDiharapkan)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:4px">
          <span>Transaksi Nontunai &amp; Website Usaha</span><span>${formatRp(transaksiNontunai)}</span>
        </div>
        <div style="border-top:1px solid var(--gold-border);margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-size:.85rem;font-weight:700">
          <span>Total Penerimaan Sistem</span><span>${formatRp(totalPenerimaan)}</span>
        </div>
      </div>

      <!-- Penerimaan Aktual di Kasir (readonly display) -->
      <div style="background:var(--card-bg);border:1px solid var(--gold-border);border-radius:10px;padding:14px;margin-bottom:14px">
        <div style="font-weight:700;font-size:.9rem;margin-bottom:10px">Penerimaan Aktual di Kasir</div>
        <div style="font-size:.78rem;color:var(--text-dim);margin-bottom:4px">Jumlah Tunai di Kasir</div>
        <div style="border:1px solid var(--gold-border);border-radius:6px;padding:8px 12px;font-size:.82rem;margin-bottom:8px;color:var(--text-dim)">Tidak termasuk kas awal</div>
        <div style="font-size:.78rem;color:var(--text-dim);margin-bottom:4px">Transaksi Nontunai &amp; Website Usaha</div>
        <div style="border:1px solid var(--gold-border);border-radius:6px;padding:8px 12px;font-size:.82rem;font-weight:600">${formatRp(transaksiNontunai).replace('Rp ','')}</div>
      </div>

      <!-- Kas detail list -->
      <div style="font-size:.85rem;font-weight:700;margin-bottom:8px">Riwayat Kas</div>
      ${kasDetailHtml}

      <!-- Tutup Kasir button (only if shift still open) -->
      ${openTime === null && shift.status === 'open' ? `
      <div style="margin-top:20px">
        <button onclick="openTutupKasirModal()" style="width:100%;background:#e53e3e;border:none;color:#fff;font-weight:700;padding:16px;border-radius:10px;font-size:.95rem;cursor:pointer">
          Tutup Kasir
        </button>
      </div>` : ''}
    </div>`;
}

// ========== TUTUP KASIR MODAL (step-by-step seperti foto) ==========
function openTutupKasirModal() {
  const user = getSession();
  const shift = getShiftState(user.cabang, 'kasir');
  if (!shift) return;

  const todayOrders = getOrders().filter(o => {
    const d = new Date(o.createdAt).toDateString();
    const sd = new Date(shift.openTime).toDateString();
    return d === sd && o.cabang === user.cabang;
  });

  const transaksiTunai = todayOrders.filter(o => o.payMethod === 'cash').reduce((s,o) => s+o.total, 0);
  const transaksiNontunai = todayOrders.filter(o => o.payMethod === 'transfer' || o.payMethod === 'qris').reduce((s,o) => s+o.total, 0);
  const kasAwal = shift.modal || 0;
  const jumlahTunaiDiharapkan = kasAwal + transaksiTunai;
  const totalPenerimaan = jumlahTunaiDiharapkan + transaksiNontunai;

  document.getElementById('rekapPreviewContent').innerHTML = `
    <div style="padding:4px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <button onclick="openRekapKasModal()" style="background:none;border:none;color:var(--text);font-size:1.1rem;cursor:pointer;padding:0">✕</button>
        <div style="font-size:1rem;font-weight:700">Tutup Kasir</div>
      </div>

      <!-- Penerimaan Sistem -->
      <div style="margin-bottom:16px">
        <div style="font-weight:700;font-size:.9rem;margin-bottom:10px">Penerimaan Sistem</div>
        <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:6px">
          <span>Total Kas</span><span style="font-weight:600">${formatRp(0)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:6px">
          <span>Transaksi Tunai</span><span style="font-weight:600">${formatRp(transaksiTunai)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:6px">
          <span style="max-width:55%">Jumlah tunai yang diharapkan</span><span style="font-weight:600">${formatRp(jumlahTunaiDiharapkan)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:.82rem;margin-bottom:6px">
          <span style="max-width:55%">Transaksi Nontunai &amp; Website Usaha</span><span style="font-weight:600">${formatRp(transaksiNontunai)}</span>
        </div>
        <div style="border-top:1px solid var(--gold-border);margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;font-size:.85rem;font-weight:700">
          <span>Total Penerimaan Sistem</span><span>${formatRp(totalPenerimaan)}</span>
        </div>
      </div>

      <!-- Penerimaan Aktual -->
      <div style="margin-bottom:20px">
        <div style="font-weight:700;font-size:.9rem;margin-bottom:10px">Penerimaan Aktual di Kasir</div>

        <!-- Input tunai aktual - editable -->
        <div style="border:2px solid var(--gold-border);border-radius:8px;padding:12px;margin-bottom:10px;background:var(--card-bg)">
          <div style="font-size:.75rem;color:var(--text-dim);margin-bottom:6px">Jumlah Tunai di Kasir</div>
          <input type="number" id="inputJumlahTunaiAktual"
            placeholder="Masukkan jumlah tunai..."
            min="0"
            oninput="hitungSelisihTunai(${jumlahTunaiDiharapkan})"
            style="width:100%;box-sizing:border-box;background:transparent;border:none;outline:none;font-size:1rem;font-weight:700;color:var(--text);font-family:inherit;padding:4px 0"/>
          <div style="font-size:.72rem;color:var(--text-dim);margin-top:4px">Tidak termasuk kas awal · Diharapkan: ${formatRp(jumlahTunaiDiharapkan)}</div>
        </div>

        <!-- Selisih live -->
        <div id="selisihTunaiDisplay" style="border-radius:8px;padding:10px 12px;margin-bottom:10px;font-size:.85rem;font-weight:700;text-align:center;border:1px solid var(--gold-border);color:var(--text-dim)">
          ← Isi jumlah tunai untuk lihat selisih
        </div>

        <!-- Nontunai readonly -->
        <div style="border:1px solid var(--gold-border);border-radius:8px;padding:12px">
          <div style="font-size:.75rem;color:var(--text-dim);margin-bottom:4px">Transaksi Nontunai &amp; Website Usaha</div>
          <div style="font-size:.9rem;font-weight:600">${transaksiNontunai.toLocaleString('id-ID')}</div>
        </div>
      </div>

      <button onclick="doKonfirmasiTutupKasir(${transaksiTunai},${transaksiNontunai},${kasAwal})"
        style="width:100%;background:#e53e3e;border:none;color:#fff;font-weight:700;padding:16px;border-radius:10px;font-size:.95rem;cursor:pointer">
        Tutup Kasir
      </button>
    </div>`;
  document.getElementById('rekapModal').style.display = 'flex';
}

// ========== LIVE SELISIH CALCULATOR ==========
function hitungSelisihTunai(diharapkan) {
  const el = document.getElementById('inputJumlahTunaiAktual');
  const display = document.getElementById('selisihTunaiDisplay');
  if (!el || !display) return;

  const aktual = parseInt(el.value) || 0;
  if (!el.value) {
    display.innerHTML = '<span style="color:var(--text-dim)">← Isi jumlah tunai untuk lihat selisih</span>';
    display.style.borderColor = 'var(--gold-border)';
    display.style.background = 'rgba(255,255,255,.03)';
    return;
  }

  const selisih = aktual - diharapkan;
  if (selisih === 0) {
    display.innerHTML = `✅ <span style="color:#68d391">Pas! Tidak ada selisih</span>`;
    display.style.borderColor = '#276749';
    display.style.background = 'rgba(39,103,73,.15)';
  } else if (selisih > 0) {
    display.innerHTML = `📈 <span style="color:#68d391">Kelebihan: +${formatRp(selisih)}</span>`;
    display.style.borderColor = '#276749';
    display.style.background = 'rgba(39,103,73,.15)';
  } else {
    display.innerHTML = `📉 <span style="color:#fc8181">Kekurangan: ${formatRp(selisih)}</span>`;
    display.style.borderColor = '#e53e3e';
    display.style.background = 'rgba(229,62,62,.15)';
  }
}

function doKonfirmasiTutupKasir(transaksiTunai, transaksiNontunai, kasAwal) {
  const user = getSession();
  const shift = getShiftState(user.cabang, 'kasir');
  if (!shift) return;

  const aktualTunai = parseInt(document.getElementById('inputJumlahTunaiAktual')?.value || '0') || 0;
  const jumlahDiharapkan = kasAwal + transaksiTunai;
  const selisihTunai = aktualTunai - jumlahDiharapkan;

  const todayStr = new Date(shift.openTime).toDateString();
  const todayOrders = getOrders().filter(o =>
    new Date(o.createdAt).toDateString() === todayStr && o.cabang === user.cabang
  );
  const totalPendapatan = todayOrders.filter(o=>o.status==='selesai').reduce((s,o)=>s+o.total,0);

  const closedShift = {
    ...shift,
    status: 'closed',
    closeTime: Date.now(),
    totalPendapatan,
    totalTransaksi: todayOrders.length,
    aktualTunai,
    transaksiTunai,
    transaksiNontunai,
    selisihTunai,
  };

  saveShiftState(user.cabang, 'kasir', null);
  const hist = getShiftHistory(user.cabang);
  hist.push(closedShift);
  saveShiftHistory(user.cabang, hist);

  // Close rekap modal
  document.getElementById('rekapModal').style.display = 'none';

  // Close profile modal
  closeProfileModal();

  showToast('🔒 Kasir ditutup! Rekap tersimpan.', 'success');
  printRekapHarianData(closedShift, todayOrders, user);

  // Refresh shift status in kasir page
  if (typeof checkShiftStatus === 'function') checkShiftStatus();
}

// ========== UANG MASUK MODAL ==========
function openUangMasukModal() {
  const user = getSession();
  document.getElementById('rekapPreviewContent').innerHTML = `
    <div style="padding:4px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <button onclick="openRekapKasModal()" style="background:none;border:none;color:var(--text);font-size:1.1rem;cursor:pointer;padding:0">←</button>
        <div style="font-size:1rem;font-weight:700">💚 Tambah Uang Masuk</div>
      </div>
      <div style="margin-bottom:12px">
        <label style="font-size:.82rem;color:var(--text-dim)">Jumlah (Rp)</label>
        <input type="number" id="inputUMJumlah" placeholder="Contoh: 50000" min="0"
          style="width:100%;box-sizing:border-box;margin-top:4px;background:var(--card-bg);border:1px solid var(--gold-border);color:var(--text);padding:10px 12px;border-radius:8px;font-size:.9rem"/>
      </div>
      <div style="margin-bottom:20px">
        <label style="font-size:.82rem;color:var(--text-dim)">Catatan</label>
        <input type="text" id="inputUMCatatan" placeholder="Contoh: Tambahan modal"
          style="width:100%;box-sizing:border-box;margin-top:4px;background:var(--card-bg);border:1px solid var(--gold-border);color:var(--text);padding:10px 12px;border-radius:8px;font-size:.9rem"/>
      </div>
      <button onclick="doSimpanUangMasuk()" style="width:100%;background:#276749;border:none;color:#fff;font-weight:700;padding:14px;border-radius:10px;font-size:.9rem;cursor:pointer">
        Simpan Uang Masuk
      </button>
    </div>`;
  document.getElementById('rekapModal').style.display = 'flex';
}

function doSimpanUangMasuk() {
  const user = getSession();
  const jumlah = parseInt(document.getElementById('inputUMJumlah').value) || 0;
  const catatan = document.getElementById('inputUMCatatan').value.trim();
  if (!jumlah) { showToast('❌ Isi jumlah uang masuk!', 'error'); return; }

  const shift = getShiftState(user.cabang, 'kasir');
  if (!shift) { showToast('❌ Kasir belum dibuka!', 'error'); return; }
  if (!shift.uangMasuk) shift.uangMasuk = [];
  shift.uangMasuk.push({ jumlah, catatan, waktu: Date.now(), pegawai: user.name });
  saveShiftState(user.cabang, 'kasir', shift);

  showToast(`✅ Uang Masuk ${formatRp(jumlah)} tersimpan!`, 'success');
  openRekapKasModal();
}

// ========== UANG KELUAR MODAL ==========
function openUangKeluarModal() {
  const user = getSession();
  document.getElementById('rekapPreviewContent').innerHTML = `
    <div style="padding:4px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <button onclick="openRekapKasModal()" style="background:none;border:none;color:var(--text);font-size:1.1rem;cursor:pointer;padding:0">←</button>
        <div style="font-size:1rem;font-weight:700">❤️ Tambah Uang Keluar</div>
      </div>
      <div style="margin-bottom:12px">
        <label style="font-size:.82rem;color:var(--text-dim)">Jumlah (Rp)</label>
        <input type="number" id="inputUKJumlah" placeholder="Contoh: 30000" min="0"
          style="width:100%;box-sizing:border-box;margin-top:4px;background:var(--card-bg);border:1px solid var(--gold-border);color:var(--text);padding:10px 12px;border-radius:8px;font-size:.9rem"/>
      </div>
      <div style="margin-bottom:20px">
        <label style="font-size:.82rem;color:var(--text-dim)">Catatan</label>
        <input type="text" id="inputUKCatatan" placeholder="Contoh: Bayar belanja bahan"
          style="width:100%;box-sizing:border-box;margin-top:4px;background:var(--card-bg);border:1px solid var(--gold-border);color:var(--text);padding:10px 12px;border-radius:8px;font-size:.9rem"/>
      </div>
      <button onclick="doSimpanUangKeluar()" style="width:100%;background:#e53e3e;border:none;color:#fff;font-weight:700;padding:14px;border-radius:10px;font-size:.9rem;cursor:pointer">
        Simpan Uang Keluar
      </button>
    </div>`;
  document.getElementById('rekapModal').style.display = 'flex';
}

function doSimpanUangKeluar() {
  const user = getSession();
  const jumlah = parseInt(document.getElementById('inputUKJumlah').value) || 0;
  const catatan = document.getElementById('inputUKCatatan').value.trim();
  if (!jumlah) { showToast('❌ Isi jumlah uang keluar!', 'error'); return; }

  const shift = getShiftState(user.cabang, 'kasir');
  if (!shift) { showToast('❌ Kasir belum dibuka!', 'error'); return; }
  if (!shift.uangKeluar) shift.uangKeluar = [];
  shift.uangKeluar.push({ jumlah, catatan, waktu: Date.now(), pegawai: user.name });
  saveShiftState(user.cabang, 'kasir', shift);

  showToast(`✅ Uang Keluar ${formatRp(jumlah)} tersimpan!`, 'success');
  openRekapKasModal();
}

// ========== TUTUP KASIR (OLD / DAPUR) ==========
function doTutupKasir() {
  openTutupKasirModal();
}

function doTutupDapur() {
  if (!confirm('Tutup dapur sekarang?')) return;
  const user = getSession();
  const shift = getShiftState(user.cabang, 'dapur');
  if (!shift) return;

  const todayStr = new Date().toDateString();
  const todayOrders = getOrders().filter(o =>
    new Date(o.createdAt).toDateString() === todayStr && o.cabang === user.cabang
  );

  const closedShift = { ...shift, status:'closed', closeTime: Date.now(), totalTransaksi: todayOrders.length };
  saveShiftState(user.cabang, 'dapur', null);

  const hist = getShiftHistory(user.cabang);
  hist.push(closedShift);
  saveShiftHistory(user.cabang, hist);

  showToast('🔒 Dapur ditutup!', 'success');
  printRekapDapurData(closedShift, todayOrders, user);
  refreshProfileContent();
}

// ========== PREVIEW REKAP ==========
function previewRekapHarian() {
  const user = getSession();
  const shift = getShiftState(user.cabang, 'kasir');
  const todayStr = new Date().toDateString();
  const todayOrders = getOrders().filter(o =>
    new Date(o.createdAt).toDateString() === todayStr && o.cabang === user.cabang
  );
  openRekapModal(shift, todayOrders, user, false);
}

function printRekapHarian() {
  const user = getSession();
  const shift = getShiftState(user.cabang, 'kasir');
  const todayStr = new Date().toDateString();
  const todayOrders = getOrders().filter(o =>
    new Date(o.createdAt).toDateString() === todayStr && o.cabang === user.cabang
  );
  openRekapModal(shift, todayOrders, user, true);
}

function printRekapDapur() {
  const user = getSession();
  const shift = getShiftState(user.cabang, 'dapur');
  const todayStr = new Date().toDateString();
  const todayOrders = getOrders().filter(o =>
    new Date(o.createdAt).toDateString() === todayStr && o.cabang === user.cabang
  );
  openRekapDapurModal(shift, todayOrders, user);
}

function printRekapOwner() {
  const user = getSession();
  const todayStr = new Date().toDateString();
  const todayOrders = getOrders().filter(o => new Date(o.createdAt).toDateString() === todayStr);
  openRekapOwnerModal(todayOrders);
}

function exportOwnerCSV() {
  const todayStr = new Date().toDateString();
  const orders = getOrders().filter(o => new Date(o.createdAt).toDateString() === todayStr);
  const rows = [['ID','Cabang','Meja','Waktu','Items','Total','Status']];
  orders.forEach(o => {
    rows.push([o.id, o.cabang, o.meja, new Date(o.createdAt).toLocaleTimeString('id-ID'),
      o.items.map(i=>`${i.name}x${i.qty}`).join('; '), o.total, o.status]);
  });
  const csv = rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `rekap-keday70-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  showToast('📥 CSV diexport!', 'success');
}

// ========== REKAP MODAL (KASIR) ==========
function openRekapModal(shift, orders, user, autoPrint) {
  const totalPendapatan = orders.filter(o=>o.status==='selesai').reduce((s,o)=>s+o.total,0);
  const totalTransaksi  = orders.length;
  const selesai = orders.filter(o=>o.status==='selesai').length;
  const pending = orders.filter(o=>o.status==='baru'||o.status==='proses').length;
  const modal = shift?.modal || 0;

  const menuCount = {};
  orders.forEach(o => o.items.forEach(i => { menuCount[i.name] = (menuCount[i.name]||0)+i.qty; }));
  const topMenu = Object.entries(menuCount).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const now = new Date();
  const html = `
    <div id="rekapPrintArea">
      <div style="text-align:center;font-family:monospace">
        <h3 style="margin:0;font-size:1rem">LAPORAN HARIAN KASIR</h3>
        <div style="font-size:.82rem">Keday Tujuh Puluh</div>
        <div style="font-size:.78rem">${KEDAY.cabang[user.cabang]?.name}</div>
        <div style="font-size:.78rem">${now.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
      </div>
      <hr style="border:1px dashed #666;margin:10px 0"/>
      <div style="font-family:monospace;font-size:.82rem">
        <div style="display:flex;justify-content:space-between"><span>Kasir:</span><span>${user.name}</span></div>
        <div style="display:flex;justify-content:space-between"><span>Jam Buka:</span><span>${shift ? formatTime(shift.openTime) : '-'}</span></div>
        <div style="display:flex;justify-content:space-between"><span>Jam Tutup:</span><span>${shift?.closeTime ? formatTime(shift.closeTime) : formatTime(Date.now())}</span></div>
        <div style="display:flex;justify-content:space-between"><span>Modal Awal:</span><span>${formatRp(modal)}</span></div>
      </div>
      <hr style="border:1px dashed #666;margin:10px 0"/>
      <div style="font-family:monospace;font-size:.82rem">
        <div style="display:flex;justify-content:space-between"><span>Total Transaksi:</span><span><b>${totalTransaksi}</b></span></div>
        <div style="display:flex;justify-content:space-between"><span>Selesai:</span><span>${selesai}</span></div>
        <div style="display:flex;justify-content:space-between"><span>Pending:</span><span>${pending}</span></div>
      </div>
      <hr style="border:1px dashed #666;margin:10px 0"/>
      <div style="font-family:monospace;font-size:.82rem">
        <div style="font-weight:bold;margin-bottom:4px">TOP MENU HARI INI:</div>
        ${topMenu.map(([name,qty],i)=>`<div style="display:flex;justify-content:space-between"><span>${i+1}. ${name}</span><span>${qty}x</span></div>`).join('')}
      </div>
      <hr style="border:1px dashed #666;margin:10px 0"/>
      <div style="font-family:monospace;font-size:.9rem;font-weight:bold;display:flex;justify-content:space-between">
        <span>TOTAL PENDAPATAN:</span><span>${formatRp(totalPendapatan)}</span>
      </div>
      <div style="font-family:monospace;font-size:.82rem;display:flex;justify-content:space-between">
        <span>Total + Modal:</span><span>${formatRp(totalPendapatan + modal)}</span>
      </div>
      <hr style="border:1px dashed #666;margin:10px 0"/>
      <div style="font-family:monospace;font-size:.8rem;font-weight:bold;margin-bottom:6px">DETAIL TRANSAKSI:</div>
      ${orders.map(o=>`
        <div style="font-family:monospace;font-size:.72rem;border-bottom:1px dotted #444;padding:4px 0">
          <div style="display:flex;justify-content:space-between">
            <span>${o.id} · ${o.meja}</span>
            <span style="color:${o.status==='selesai'?'#68d391':'#fc8181'}">${o.status}</span>
          </div>
          <div style="display:flex;justify-content:space-between;color:#999">
            <span>${formatTime(o.createdAt)}</span>
            <span>${formatRp(o.total)}</span>
          </div>
        </div>`).join('')}
      <div style="text-align:center;font-family:monospace;font-size:.75rem;margin-top:12px;color:#666">
        Dicetak: ${now.toLocaleString('id-ID')}<br/>Keday Tujuh Puluh ✓
      </div>
    </div>`;

  document.getElementById('rekapPreviewContent').innerHTML = html;
  document.getElementById('rekapModal').style.display = 'flex';
  if (autoPrint) setTimeout(() => doPrintRekap(), 300);
}

function openRekapDapurModal(shift, orders, user) {
  const selesai = orders.filter(o=>o.status==='selesai').length;
  const pending = orders.filter(o=>o.status==='baru'||o.status==='proses').length;
  const menuCount = {};
  orders.forEach(o => o.items.forEach(i => { menuCount[i.name] = (menuCount[i.name]||0)+i.qty; }));
  const now = new Date();
  const html = `
    <div id="rekapPrintArea">
      <div style="text-align:center;font-family:monospace">
        <h3 style="margin:0">REKAP HARIAN DAPUR</h3>
        <div style="font-size:.82rem">Keday Tujuh Puluh – ${KEDAY.cabang[user.cabang]?.name}</div>
        <div style="font-size:.78rem">${now.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
      </div>
      <hr style="border:1px dashed #666;margin:10px 0"/>
      <div style="font-family:monospace;font-size:.82rem">
        <div style="display:flex;justify-content:space-between"><span>Dapur:</span><span>${user.name}</span></div>
        <div style="display:flex;justify-content:space-between"><span>Jam Buka:</span><span>${shift ? formatTime(shift.openTime) : '-'}</span></div>
        <div style="display:flex;justify-content:space-between"><span>Total Order Masuk:</span><span><b>${orders.length}</b></span></div>
        <div style="display:flex;justify-content:space-between"><span>Selesai Dimasak:</span><span style="color:#68d391"><b>${selesai}</b></span></div>
        <div style="display:flex;justify-content:space-between"><span>Masih Pending:</span><span style="color:#fc8181">${pending}</span></div>
      </div>
      <hr style="border:1px dashed #666;margin:10px 0"/>
      <div style="font-family:monospace;font-size:.82rem;font-weight:bold;margin-bottom:6px">REKAP MENU DIMASAK:</div>
      ${Object.entries(menuCount).sort((a,b)=>b[1]-a[1]).map(([name,qty])=>
        `<div style="font-family:monospace;font-size:.78rem;display:flex;justify-content:space-between;padding:2px 0">
          <span>${name}</span><span><b>${qty}x</b></span>
        </div>`
      ).join('')}
      <div style="text-align:center;font-family:monospace;font-size:.75rem;margin-top:12px;color:#666">
        Dicetak: ${now.toLocaleString('id-ID')}<br/>Keday Tujuh Puluh ✓
      </div>
    </div>`;
  document.getElementById('rekapPreviewContent').innerHTML = html;
  document.getElementById('rekapModal').style.display = 'flex';
}

function openRekapOwnerModal(orders) {
  const sks = orders.filter(o=>o.cabang==='sukaseuri');
  const pws = orders.filter(o=>o.cabang==='purwasari');
  const revSks = sks.filter(o=>o.status==='selesai').reduce((s,o)=>s+o.total,0);
  const revPws = pws.filter(o=>o.status==='selesai').reduce((s,o)=>s+o.total,0);
  const now = new Date();
  const menuCount = {};
  orders.forEach(o => o.items.forEach(i => { menuCount[i.name] = (menuCount[i.name]||0)+i.qty; }));
  const topMenu = Object.entries(menuCount).sort((a,b)=>b[1]-a[1]).slice(0,10);
  const html = `
    <div id="rekapPrintArea">
      <div style="text-align:center;font-family:monospace">
        <h3 style="margin:0">REKAP HARIAN OWNER</h3>
        <div style="font-size:.82rem">Keday Tujuh Puluh – Semua Cabang</div>
        <div style="font-size:.78rem">${now.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
      </div>
      <hr style="border:1px dashed #666;margin:10px 0"/>
      <div style="font-family:monospace;font-size:.82rem">
        <div style="font-weight:bold">📍 Sukaseuri:</div>
        <div style="display:flex;justify-content:space-between"><span>  Transaksi:</span><span>${sks.length}</span></div>
        <div style="display:flex;justify-content:space-between"><span>  Pendapatan:</span><span><b>${formatRp(revSks)}</b></span></div>
        <br/>
        <div style="font-weight:bold">📍 Purwasari:</div>
        <div style="display:flex;justify-content:space-between"><span>  Transaksi:</span><span>${pws.length}</span></div>
        <div style="display:flex;justify-content:space-between"><span>  Pendapatan:</span><span><b>${formatRp(revPws)}</b></span></div>
      </div>
      <hr style="border:1px dashed #666;margin:10px 0"/>
      <div style="font-family:monospace;font-size:.9rem;font-weight:bold;display:flex;justify-content:space-between">
        <span>TOTAL SEMUA CABANG:</span><span>${formatRp(revSks+revPws)}</span>
      </div>
      <hr style="border:1px dashed #666;margin:10px 0"/>
      <div style="font-family:monospace;font-size:.82rem;font-weight:bold;margin-bottom:4px">TOP 10 MENU TERLARIS:</div>
      ${topMenu.map(([name,qty],i)=>`<div style="font-family:monospace;font-size:.78rem;display:flex;justify-content:space-between;padding:2px 0">
        <span>${i+1}. ${name}</span><span>${qty}x</span>
      </div>`).join('')}
      <div style="text-align:center;font-family:monospace;font-size:.75rem;margin-top:12px;color:#666">
        Dicetak: ${now.toLocaleString('id-ID')}<br/>Keday Tujuh Puluh ✓
      </div>
    </div>`;
  document.getElementById('rekapPreviewContent').innerHTML = html;
  document.getElementById('rekapModal').style.display = 'flex';
}

function printRekapHarianData(shift, orders, user) {
  openRekapModal(shift, orders, user, false);
}
function printRekapDapurData(shift, orders, user) {
  openRekapDapurModal(shift, orders, user);
}

// ========== PRINT REKAP (FIXED - no popup blocker) ==========
function doPrintRekap() {
  const content = document.getElementById('rekapPrintArea');
  if (!content) return;

  // Inject a hidden iframe to avoid popup blockers
  let iframe = document.getElementById('_k70PrintFrame');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = '_k70PrintFrame';
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:400px;height:600px;border:none;';
    document.body.appendChild(iframe);
  }

  const iDoc = iframe.contentDocument || iframe.contentWindow.document;
  iDoc.open();
  iDoc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/>
    <style>
      body{font-family:monospace;font-size:13px;padding:12px;width:310px;color:#000;margin:0}
      hr{border:1px dashed #000;margin:8px 0}
      @media print{body{margin:0}}
    </style></head><body>
    ${content.innerHTML}
    </body></html>`);
  iDoc.close();
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch(e) {
      // fallback: open window
      const win = window.open('', '_blank', 'width=400,height=700');
      if (win) {
        win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/>
          <style>body{font-family:monospace;font-size:13px;padding:12px;width:310px;color:#000}
          hr{border:1px dashed #000;margin:8px 0}@media print{body{margin:0}}</style>
          </head><body onload="window.print();window.close()">${content.innerHTML}</body></html>`);
        win.document.close();
      }
    }
  }, 300);
}

function closeRekapModal() {
  document.getElementById('rekapModal').style.display = 'none';
}
