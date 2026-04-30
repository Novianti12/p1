// ================================
// KEDAY 70 – DAPUR (KITCHEN)
// ================================

let user, lastOrderIds = new Set();

document.addEventListener('DOMContentLoaded', () => {
  user = requireAuth('dapur');
  if (!user) return;

  // Init set dengan order yang sudah ada
  getOrders().filter(o => o.cabang === user.cabang).forEach(o => lastOrderIds.add(o.id));

  renderBoard();
  updateShiftIndicator();
  setInterval(() => {
    checkNewOrders();
    renderBoard();
  }, 2500);
});

function renderBoard() {
  const orders = getOrders().filter(o => o.cabang === user.cabang);
  const baru    = orders.filter(o => o.status === 'baru').sort((a,b) => a.createdAt - b.createdAt);
  const proses  = orders.filter(o => o.status === 'proses').sort((a,b) => a.createdAt - b.createdAt);
  const selesai = orders.filter(o => o.status === 'selesai').sort((a,b) => b.selesaiAt - a.selesaiAt).slice(0, 6);

  document.getElementById('statMenunggu').textContent = baru.length;
  document.getElementById('statDiproses').textContent = proses.length;
  document.getElementById('statSelesai').textContent  = selesai.length;

  document.getElementById('colBaru').innerHTML    = baru.length    ? baru.map(o => kitchenCard(o)).join('') : emptyCol('Tidak ada pesanan baru 🎉');
  document.getElementById('colProses').innerHTML  = proses.length  ? proses.map(o => kitchenCard(o)).join('') : emptyCol('Tidak ada yang diproses');
  document.getElementById('colSelesai').innerHTML = selesai.length ? selesai.map(o => kitchenCard(o)).join('') : emptyCol('Belum ada yang selesai');
}

function emptyCol(msg) {
  return `<div style="text-align:center;padding:30px 16px;color:var(--text-dim);font-size:.85rem">${msg}</div>`;
}

function kitchenCard(order) {
  const age = Math.floor((Date.now() - order.createdAt) / 60000);
  const ageStr = age < 1 ? 'Baru saja' : `${age} menit lalu`;
  const urgent = age >= 10 && order.status === 'baru';

  let actions = '';
  if (order.status === 'baru') {
    actions = `<button class="kc-btn proses" onclick="updateStatus('${order.id}','proses')">🟡 Mulai Masak</button>`;
  } else if (order.status === 'proses') {
    actions = `<button class="kc-btn selesai" onclick="updateStatus('${order.id}','selesai')">✅ Siap Antar</button>`;
  } else {
    actions = `<button class="kc-btn done-btn">✔ Sudah Disajikan</button>`;
  }

  // Kumpulkan semua catatan per item
  const itemsWithNote = order.items.filter(i => i.note);

  return `
    <div class="kitchen-card status-${order.status}" ${urgent ? 'style="animation:slideIn .3s ease,pulse 1.5s infinite .3s;"' : ''}>
      <div class="kc-header">
        <div class="kc-order-num">${order.id}</div>
        <div class="kc-table">${order.meja}</div>
      </div>
      <div class="kc-time">⏱ ${ageStr}${urgent ? ' ⚠️' : ''}</div>
      <ul class="kc-items">
        ${order.items.map(i => `
          <li>
            <span>${i.emoji || ''} ${i.name}</span>
            <span><b>×${i.qty}</b></span>
          </li>
          ${i.note ? `<li style="font-size:.75rem;color:var(--gold);padding-left:12px;border-bottom:none">└ 📝 ${i.note}</li>` : ''}
        `).join('')}
      </ul>
      ${order.note ? `<div class="kc-note">📋 ${order.note}</div>` : ''}
      <div class="kc-actions">${actions}</div>
      ${order.status === 'baru' ? `<div style="margin-top:8px"><button class="kc-btn" style="background:rgba(49,130,206,.15);border:1px solid rgba(49,130,206,.3);color:#63b3ed;font-size:.72rem;width:100%" onclick="printKitchenSlip('${order.id}')">🖨️ Cetak Slip Dapur</button></div>` : ''}
    </div>`;
}

function updateStatus(id, newStatus) {
  const orders = getOrders();
  const order = orders.find(o => o.id === id);
  if (!order) return;
  order.status = newStatus;
  if (newStatus === 'proses') order.prosesAt = Date.now();
  if (newStatus === 'selesai') order.selesaiAt = Date.now();
  saveOrders(orders);
  renderBoard();
  const msg = newStatus === 'proses' ? `🟡 Mulai masak order ${id}` : `✅ Order ${id} siap disajikan ke ${order.meja}!`;
  showToast(msg, newStatus === 'selesai' ? 'success' : '');
}

// ========== CEK ORDER BARU ==========
function checkNewOrders() {
  const orders = getOrders().filter(o => o.cabang === user.cabang && o.status === 'baru');
  const newOnes = orders.filter(o => !lastOrderIds.has(o.id));

  if (newOnes.length > 0) {
    newOnes.forEach(o => {
      lastOrderIds.add(o.id);
      playNotif();
      showToast(`🔔 Pesanan baru: ${o.id} – ${o.meja}!`);
      // Auto print slip dapur untuk order baru
      setTimeout(() => autoPrintSlip(o), 500);
    });
  }
}

// ========== AUTO PRINT SLIP DAPUR ==========
function autoPrintSlip(order) {
  const slip = buildKitchenSlip(order);
  const win = window.open('', '_blank', 'width=320,height=500');
  if (!win) return; // popup blocked
  win.document.write(`
    <!DOCTYPE html><html><head>
    <meta charset="UTF-8"/>
    <style>
      body{font-family:monospace;font-size:13px;padding:10px;width:280px;color:#000}
      h3{text-align:center;margin:0 0 4px;font-size:14px}
      .sub{text-align:center;font-size:11px;margin-bottom:8px}
      hr{border:1px dashed #000;margin:6px 0}
      .row{display:flex;justify-content:space-between}
      .items{list-style:none;padding:0;margin:6px 0}
      .items li{padding:3px 0;border-bottom:1px dotted #ccc}
      .items li.note-line{font-size:11px;color:#555;padding-left:10px;border-bottom:none}
      .footer{text-align:center;margin-top:8px;font-size:11px}
      @media print{body{margin:0}}
    </style>
    </head><body onload="window.print();window.close()">
    ${slip}
    </body></html>`);
  win.document.close();
}

function printKitchenSlip(id) {
  const order = getOrders().find(o => o.id === id);
  if (!order) return;
  autoPrintSlip(order);
}

function buildKitchenSlip(order) {
  const age = new Date(order.createdAt).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  return `
    <h3>⬛ SLIP DAPUR</h3>
    <div class="sub">Keday Tujuh Puluh – ${order.cabang === 'sukaseuri' ? 'Sukaseuri' : 'Purwasari'}</div>
    <hr/>
    <div class="row"><span>Order:</span><span><b>${order.id}</b></span></div>
    <div class="row"><span>Meja:</span><span><b>${order.meja}</b></span></div>
    <div class="row"><span>Waktu:</span><span>${age}</span></div>
    <hr/>
    <ul class="items">
      ${order.items.map(i => `
        <li><b>${i.qty}×</b> ${i.name}</li>
        ${i.note ? `<li class="note-line">└ 📝 ${i.note}</li>` : ''}
      `).join('')}
    </ul>
    <hr/>
    ${order.note ? `<div style="font-size:11px">📋 ${order.note}</div><hr/>` : ''}
    <div class="footer">Segera diproses! 🍳</div>`;
}

function playNotif() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [[523,0],[659,.15],[784,.3],[659,.45],[784,.6]].forEach(([freq,delay]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = 'sine';
      gain.gain.setValueAtTime(0.35, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.35);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.35);
    });
  } catch(e) {}
}

function updateShiftIndicator() {
  const shift = getShiftState(user.cabang, 'dapur');
  const el = document.getElementById('shiftIndicator');
  if (!el) return;
  if (shift && shift.status === 'open') {
    el.textContent = '🟢 Dapur Aktif';
    el.style.color = '#68d391';
  } else {
    el.textContent = '🔴 Dapur Belum Buka';
    el.style.color = '#fc8181';
  }
}
