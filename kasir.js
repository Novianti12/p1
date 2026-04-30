// ================================
// KEDAY 70 – KASIR LOGIC (v3 - Enhanced)
// ================================

let user, currentMenu, cart = [], activeTable = '', activeCategory = 'all';
let editingCartId = null;
let pendingOrderForPayment = null;

// ======= PRINTER CONFIG =======
const PRINTER_CONFIG = {
  kasir:   { name: 'Printer Kasir',   desc: 'Struk pembayaran utama' },
  kitchen: { name: 'Printer Dapur',   desc: 'Order makanan berat & bakso' },
  dessert: { name: 'Printer Dessert', desc: 'Order dessert & minuman' },
};

const DESSERT_CATS = ['dessert', 'minuman'];
const KITCHEN_CATS = ['bakso', 'chicken', 'dimsum', 'nasi'];

document.addEventListener('DOMContentLoaded', () => {
  user = requireAuth('kasir');
  if (!user) return;
  currentMenu = getMenuItems();
  const mejaList = getMeja(user.cabang);
  activeTable = mejaList[0];
  renderCategories();
  renderMenu();
  renderTables();
  renderCart();
  checkShiftStatus();
});

function checkShiftStatus() {
  const shift = getShiftState(user.cabang, 'kasir');
  const indicator = document.getElementById('shiftIndicator');
  if (indicator) {
    if (shift && shift.status === 'open') {
      indicator.textContent = '🟢 Shift Aktif';
      indicator.style.color = '#68d391';
    } else {
      indicator.textContent = '🔴 Shift Belum Buka';
      indicator.style.color = '#fc8181';
    }
  }
}

function renderCategories() {
  const el = document.getElementById('categoryTabs');
  el.innerHTML = CATEGORIES.map(c =>
    `<div class="cat-tab ${c.id === activeCategory ? 'active' : ''}" onclick="setCategory('${c.id}')">${c.label}</div>`
  ).join('');
}
function setCategory(id) {
  activeCategory = id;
  renderCategories();
  renderMenu();
}

function renderMenu(query = '') {
  const grid = document.getElementById('menuGrid');
  let items = currentMenu.filter(m => {
    const matchCat = activeCategory === 'all' || m.cat === activeCategory;
    const matchQ   = !query || m.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });
  if (!items.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-dim)">Menu tidak ditemukan</div>`;
    return;
  }
  grid.innerHTML = items.map(m => {
    const inCart = cart.find(c => c.id === m.id);
    return `
    <div class="menu-item ${!m.avail ? 'unavail' : ''}" onclick="addToCart('${m.id}')">
      ${inCart ? `<div class="menu-add-badge">${inCart.qty}</div>` : ''}
      <div class="menu-item-emoji">${m.emoji}</div>
      <div class="menu-item-name">${m.name}</div>
      <div class="menu-item-price">${formatRp(m.price)}</div>
      <div class="menu-item-cat">${m.cat}</div>
      ${!m.avail ? '<div style="font-size:.7rem;color:var(--red);margin-top:4px">Tidak Tersedia</div>' : ''}
    </div>`;
  }).join('');
}
function filterMenu() {
  renderMenu(document.getElementById('searchMenu').value);
}

function addToCart(id) {
  const menuItem = currentMenu.find(m => m.id === id);
  if (!menuItem || !menuItem.avail) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, name: menuItem.name, price: menuItem.price, qty: 1, emoji: menuItem.emoji, cat: menuItem.cat || '', note: '' });
  renderCart();
  renderMenu(document.getElementById('searchMenu').value);
  showToast(`✅ ${menuItem.name} ditambahkan`, 'success');
}

function updateQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  renderCart();
  renderMenu(document.getElementById('searchMenu').value);
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  renderCart();
  renderMenu(document.getElementById('searchMenu').value);
}

function clearOrder() {
  if (!cart.length) return;
  if (!confirm('Hapus semua item pesanan?')) return;
  cart = [];
  renderCart();
  renderMenu();
}

function openItemNote(id) {
  editingCartId = id;
  const item = cart.find(c => c.id === id);
  if (!item) return;
  document.getElementById('itemNoteTitle').textContent = item.emoji + ' ' + item.name;
  document.getElementById('itemNoteInput').value = item.note || '';
  document.getElementById('itemNoteModal').style.display = 'flex';
  setTimeout(() => document.getElementById('itemNoteInput').focus(), 100);
}

function saveItemNote() {
  const item = cart.find(c => c.id === editingCartId);
  if (item) item.note = document.getElementById('itemNoteInput').value.trim();
  closeItemNote();
  renderCart();
  showToast('📝 Catatan disimpan', 'success');
}

function closeItemNote() {
  document.getElementById('itemNoteModal').style.display = 'none';
  editingCartId = null;
}

function setQuickNote(text) {
  const el = document.getElementById('itemNoteInput');
  const cur = el.value;
  if (cur && !cur.endsWith(' ')) el.value = cur + ', ' + text;
  else el.value = cur + text;
}

function calcTotals() {
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  return { subtotal: total, total };
}

function renderCart() {
  const el = document.getElementById('orderItems');
  if (!cart.length) {
    el.innerHTML = `<div class="empty-order">
      <div style="font-size:3rem">🍜</div>
      <div>Belum ada pesanan</div>
      <div style="font-size:.8rem;opacity:.5">Pilih menu di sebelah kiri</div>
    </div>`;
  } else {
    el.innerHTML = cart.map(c => `
      <div class="order-item">
        <div class="oi-emoji">${c.emoji}</div>
        <div class="oi-info">
          <div class="oi-name">${c.name}</div>
          <div class="oi-price">${formatRp(c.price)} × ${c.qty} = ${formatRp(c.price * c.qty)}</div>
          ${c.note ? `<div class="oi-note">📝 ${c.note}</div>` : ''}
        </div>
        <div class="oi-actions-col">
          <div class="oi-qty">
            <button class="qty-btn" onclick="updateQty('${c.id}',-1)">−</button>
            <span class="qty-num">${c.qty}</span>
            <button class="qty-btn" onclick="updateQty('${c.id}',1)">+</button>
          </div>
          <div class="oi-bottom-btns">
            <button class="oi-note-btn" onclick="openItemNote('${c.id}')" title="Tambah catatan">✏️</button>
            <button class="oi-remove" onclick="removeFromCart('${c.id}')">🗑</button>
          </div>
        </div>
      </div>`).join('');
  }
  const { subtotal, total } = calcTotals();
  document.getElementById('totalAmt').textContent = formatRp(total);
}

function renderTables() {
  const badge = document.getElementById("activeMejaLabel");
  if (badge) badge.textContent = activeTable;
  const el = document.getElementById('tableBtns');
  const zona = getZona(user.cabang);
  el.innerHTML = zona.map(z => {
    const labels = z.meja.map(m => {
      let label = m.replace(/^[A-Z][0-9]-/, '').replace('Take Away','TA');
      return `<div class="table-btn ${m === activeTable ? 'active' : ''}" onclick="setTable('${m}')">${label}</div>`;
    }).join('');
    return `<div class="zona-block"><div class="zona-block-label">${z.label}</div><div class="zona-block-meja">${labels}</div></div>`;
  }).join('');
}

function setTable(m) {
  activeTable = m;
  renderTables();
}

// ========== SEND ORDER -> PAYMENT MODAL ==========
function sendOrder() {
  if (!cart.length) { showToast('❌ Keranjang kosong!', 'error'); return; }
  const { subtotal, total } = calcTotals();
  const note = document.getElementById('orderNote').value;

  pendingOrderForPayment = {
    id: generateOrderId(user.cabang),
    cabang: user.cabang,
    meja: activeTable,
    items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price, emoji: c.emoji, cat: c.cat || '', note: c.note || '' })),
    subtotal, total,
    status: 'baru',
    note,
    createdAt: Date.now(),
    kasir: user.name
  };

  openPaymentModal(total);
}

// ========== PAYMENT MODAL ==========
function openPaymentModal(total) {
  document.getElementById('payTotalDisplay').textContent = formatRp(total);
  document.getElementById('payCashInput').value = '';
  document.getElementById('payCashChange').textContent = '';
  document.getElementById('payNominalInput').value = '';
  selectPayMethod('cash');
  document.getElementById('paymentModal').style.display = 'flex';
}

function closePaymentModal() {
  document.getElementById('paymentModal').style.display = 'none';
  pendingOrderForPayment = null;
}

function selectPayMethod(method) {
  document.querySelectorAll('.pay-method-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('payBtn_' + method);
  if (btn) btn.classList.add('active');
  document.getElementById('cashSection').style.display   = method === 'cash'     ? 'block' : 'none';
  document.getElementById('transferSection').style.display = method === 'transfer' ? 'block' : 'none';
  document.getElementById('qrisSection').style.display   = method === 'qris'     ? 'block' : 'none';
  document.getElementById('selectedPayMethod').value = method;
}

function calcChange() {
  const total = pendingOrderForPayment ? pendingOrderForPayment.total : 0;
  const raw = document.getElementById('payCashInput').value.replace(/\D/g,'');
  const cash = parseInt(raw) || 0;
  const change = cash - total;
  const el = document.getElementById('payCashChange');
  if (!raw) { el.textContent = ''; return; }
  if (change < 0) {
    el.innerHTML = `<span style="color:var(--red)">⚠️ Kurang ${formatRp(Math.abs(change))}</span>`;
  } else {
    el.innerHTML = `<span style="color:var(--green)">💵 Kembalian: <b>${formatRp(change)}</b></span>`;
  }
}

function setQuickCash(amount) {
  document.getElementById('payCashInput').value = amount;
  calcChange();
}

function confirmPayment() {
  if (!pendingOrderForPayment) return;
  const method = document.getElementById('selectedPayMethod').value;
  const total  = pendingOrderForPayment.total;

  if (method === 'cash') {
    const cash = parseInt(document.getElementById('payCashInput').value.replace(/\D/g,'')) || 0;
    if (cash < total) { showToast('❌ Uang cash kurang dari total!', 'error'); return; }
    pendingOrderForPayment.payMethod   = 'cash';
    pendingOrderForPayment.cashPaid    = cash;
    pendingOrderForPayment.cashChange  = cash - total;
  } else if (method === 'transfer') {
    pendingOrderForPayment.payMethod   = 'transfer';
    pendingOrderForPayment.bankName    = document.getElementById('payBankSelect').value;
    pendingOrderForPayment.cashPaid    = total;
    pendingOrderForPayment.cashChange  = 0;
  } else if (method === 'qris') {
    pendingOrderForPayment.payMethod  = 'qris';
    pendingOrderForPayment.cashPaid   = total;
    pendingOrderForPayment.cashChange = 0;
  }

  const order = { ...pendingOrderForPayment };
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);

  closePaymentModal();
  showToast(`✅ Pembayaran ${order.id} berhasil!`, 'success');
  showStrukModal(order);

  cart = [];
  document.getElementById('orderNote').value = '';
  renderCart();
  renderMenu();
}

// ========== STRUK MODAL ==========
function showStrukModal(order) {
  const cabangInfo = KEDAY.cabang[order.cabang];
  const now = new Date(order.createdAt);

  const kitchenItems = order.items.filter(i => KITCHEN_CATS.includes(i.cat));
  const dessertItems = order.items.filter(i => DESSERT_CATS.includes(i.cat));

  const strukKasir   = buildStrukKasir(order, cabangInfo, now);
  const strukKitchen = kitchenItems.length ? buildStrukKitchen(order, cabangInfo, now, kitchenItems) : null;
  const strukDessert = dessertItems.length ? buildStrukDessert(order, cabangInfo, now, dessertItems) : null;

  const container = document.getElementById('strukContainer');
  let html = `<div class="struk-tabs">`;
  html += `<button class="struk-tab active" onclick="showStrukTab('kasir',this)">🧾 Kasir</button>`;
  if (strukKitchen) html += `<button class="struk-tab" onclick="showStrukTab('kitchen',this)">👨‍🍳 Dapur</button>`;
  if (strukDessert) html += `<button class="struk-tab" onclick="showStrukTab('dessert',this)">🍨 Dessert</button>`;
  html += `</div>`;
  html += `<div id="struk_kasir" class="struk-pane active">${strukKasir}</div>`;
  if (strukKitchen) html += `<div id="struk_kitchen" class="struk-pane">${strukKitchen}</div>`;
  if (strukDessert) html += `<div id="struk_dessert" class="struk-pane">${strukDessert}</div>`;

  container.innerHTML = html;
  document.getElementById('strukModal').style.display = 'flex';
  document.getElementById('activeStrukPrinter').textContent = '🖨️ Printer: ' + PRINTER_CONFIG.kasir.name;
}

function showStrukTab(tab, btn) {
  document.querySelectorAll('.struk-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.struk-pane').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
  btn.classList.add('active');
  const pane = document.getElementById('struk_' + tab);
  if (pane) { pane.classList.add('active'); pane.style.display = 'block'; }
  const map = { kasir: PRINTER_CONFIG.kasir, kitchen: PRINTER_CONFIG.kitchen, dessert: PRINTER_CONFIG.dessert };
  document.getElementById('activeStrukPrinter').textContent = `🖨️ Printer: ${(map[tab] || PRINTER_CONFIG.kasir).name}`;
}

function doPrint() {
  const pane = document.querySelector('.struk-pane.active') || document.getElementById('struk_kasir');
  openPrintWindow(pane ? pane.innerHTML : '');
}

function printAllStruk() {
  const panes = document.querySelectorAll('.struk-pane');
  let combined = '';
  panes.forEach((p, i) => {
    combined += p.innerHTML;
    if (i < panes.length - 1) combined += '<div style="page-break-after:always;margin:20px 0;border-top:3px double #000"></div>';
  });
  openPrintWindow(combined);
}

function openPrintWindow(html) {
  // Use hidden iframe to avoid popup blocker inconsistency
  let iframe = document.getElementById('_k70StrukFrame');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = '_k70StrukFrame';
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:380px;height:650px;border:none;';
    document.body.appendChild(iframe);
  }
  const iDoc = iframe.contentDocument || iframe.contentWindow.document;
  iDoc.open();
  iDoc.write(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8"/>
    <title>Struk</title>
    <style>
      body{font-family:monospace;font-size:12px;width:280px;margin:0 auto;padding:8px}
      .struk-divider{border:none;border-top:1px dashed #ccc;margin:6px 0}
      .struk-row{display:flex;justify-content:space-between;margin:2px 0;font-size:11px}
      .struk-total{font-weight:bold;font-size:13px}
      .struk-footer{text-align:center;margin-top:10px;font-size:10px}
      .struk-sub{font-size:10px;color:#555;text-align:center}
      @media print{body{margin:0}button{display:none}}
    </style>
  </head><body>${html}</body></html>`);
  iDoc.close();
  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch(e) {
      // fallback for browsers that block iframe print
      const win = window.open('', '_blank', 'width=380,height=650');
      if (win) {
        win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Struk</title>
          <style>body{font-family:monospace;font-size:12px;width:280px;margin:0 auto;padding:8px}
          .struk-divider{border:none;border-top:1px dashed #ccc;margin:6px 0}
          .struk-row{display:flex;justify-content:space-between;margin:2px 0;font-size:11px}
          .struk-total{font-weight:bold;font-size:13px}.struk-footer{text-align:center;margin-top:10px;font-size:10px}
          .struk-sub{font-size:10px;color:#555;text-align:center}
          @media print{body{margin:0}button{display:none}}</style>
          </head><body onload="window.print();window.close()">${html}</body></html>`);
        win.document.close();
      }
    }
  }, 350);
}

function closeStrukModal() { document.getElementById('strukModal').style.display = 'none'; }

function printStruk() {
  if (!cart.length) { showToast('❌ Keranjang kosong!', 'error'); return; }
  const { subtotal, total } = calcTotals();
  const note = document.getElementById('orderNote').value;
  const tempOrder = {
    id: 'PREVIEW-' + Date.now(),
    cabang: user.cabang,
    meja: activeTable,
    items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price, emoji: c.emoji, cat: c.cat || '', note: c.note || '' })),
    subtotal, total, status: 'draft', note, createdAt: Date.now(), kasir: user.name, payMethod: null
  };
  showStrukModal(tempOrder);
}

// ========== BUILD STRUK ==========
function buildStrukKasir(order, cabangInfo, now) {
  const tgl = now.toLocaleDateString('id-ID');
  const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const rows = order.items.map(i => `
    <div class="struk-row"><span>${i.emoji||''} ${i.name} x${i.qty}</span><span>${formatRp(i.price*i.qty)}</span></div>
    ${i.note ? `<div style="font-size:10px;color:#666;padding-left:10px">📝 ${i.note}</div>` : ''}
  `).join('');
  const payInfo = buildPayInfo(order);
  return `
    <div style="text-align:center;margin-bottom:10px">
      <b style="font-size:13px">KEDAY TUJUH PULUH</b><br>
      <span class="struk-sub">${cabangInfo.name}</span><br>
      <span class="struk-sub">${cabangInfo.address}</span><br>
      <span class="struk-sub">Telp: ${cabangInfo.phone}</span>
    </div>
    <hr class="struk-divider"/>
    <div class="struk-row"><span>No Order</span><span><b>${order.id}</b></span></div>
    <div class="struk-row"><span>Tanggal</span><span>${tgl} ${jam}</span></div>
    <div class="struk-row"><span>Meja</span><span><b>${order.meja}</b></span></div>
    <div class="struk-row"><span>Kasir</span><span>${order.kasir}</span></div>
    <hr class="struk-divider"/>
    ${rows}
    <hr class="struk-divider"/>
    <div class="struk-row struk-total"><span>TOTAL</span><span>${formatRp(order.total)}</span></div>
    <hr class="struk-divider"/>
    ${payInfo}
    ${order.note ? `<div style="margin:6px 0;font-size:10px;font-style:italic">Catatan: ${order.note}</div>` : ''}
    <div class="struk-footer">
      Terima kasih sudah makan di<br><b>Keday Tujuh Puluh!</b><br>
      <span style="font-size:10px">Senin–Minggu · 10.00–21.00</span>
    </div>`;
}

function buildStrukKitchen(order, cabangInfo, now, items) {
  const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const rows = items.map(i => `
    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dotted #ddd;font-size:13px;font-weight:bold">
      <span>${i.emoji||''} ${i.name}</span><span>x${i.qty}</span>
    </div>
    ${i.note ? `<div style="font-size:10px;background:#fffde7;padding:4px 8px;border-left:3px solid orange">⚠️ ${i.note}</div>` : ''}
  `).join('');
  return `
    <div style="text-align:center;margin-bottom:10px;border-bottom:2px solid #000;padding-bottom:8px">
      <b style="font-size:14px">👨‍🍳 ORDER DAPUR</b><br>
      <span style="font-size:10px">${cabangInfo.name}</span>
    </div>
    <div class="struk-row"><span>No Order</span><span><b>${order.id}</b></span></div>
    <div style="margin:8px 0;padding:6px;border:2px solid #000;text-align:center">
      <b style="font-size:16px">MEJA: ${order.meja}</b>
    </div>
    <div class="struk-row"><span>Waktu</span><span>${jam}</span></div>
    <hr class="struk-divider"/>
    <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666;margin-bottom:4px">MAKANAN:</div>
    ${rows}
    <hr class="struk-divider"/>
    ${order.note ? `<div style="background:#fffde7;padding:6px;font-size:11px;margin-top:4px"><b>📋 Catatan:</b> ${order.note}</div>` : ''}
    <div style="text-align:center;font-size:10px;margin-top:8px">— Segera diproses —</div>`;
}

function buildStrukDessert(order, cabangInfo, now, items) {
  const jam = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const rows = items.map(i => `
    <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dotted #ddd;font-size:13px;font-weight:bold">
      <span>${i.emoji||''} ${i.name}</span><span>x${i.qty}</span>
    </div>
    ${i.note ? `<div style="font-size:10px;background:#fffde7;padding:4px 8px;border-left:3px solid orange">⚠️ ${i.note}</div>` : ''}
  `).join('');
  return `
    <div style="text-align:center;margin-bottom:10px;border-bottom:2px solid #000;padding-bottom:8px">
      <b style="font-size:14px">🍨 DESSERT & MINUMAN</b><br>
      <span style="font-size:10px">${cabangInfo.name}</span>
    </div>
    <div class="struk-row"><span>No Order</span><span><b>${order.id}</b></span></div>
    <div style="margin:8px 0;padding:6px;border:2px solid #000;text-align:center">
      <b style="font-size:16px">MEJA: ${order.meja}</b>
    </div>
    <div class="struk-row"><span>Waktu</span><span>${jam}</span></div>
    <hr class="struk-divider"/>
    <div style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666;margin-bottom:4px">DESSERT & MINUMAN:</div>
    ${rows}
    <hr class="struk-divider"/>
    ${order.note ? `<div style="background:#fffde7;padding:6px;font-size:11px;margin-top:4px"><b>📋 Catatan:</b> ${order.note}</div>` : ''}
    <div style="text-align:center;font-size:10px;margin-top:8px">— Segera diproses —</div>`;
}

function buildPayInfo(order) {
  if (!order.payMethod) return '';
  const labels = { cash:'💵 Tunai / Cash', transfer:'🏦 Transfer Bank', qris:'📱 QRIS' };
  let html = `<div class="struk-row"><span>Metode Bayar</span><span><b>${labels[order.payMethod]||order.payMethod}</b></span></div>`;
  if (order.payMethod === 'cash') {
    html += `<div class="struk-row"><span>Dibayar</span><span>${formatRp(order.cashPaid)}</span></div>`;
    html += `<div class="struk-row struk-total"><span>Kembalian</span><span>${formatRp(order.cashChange)}</span></div>`;
  } else if (order.payMethod === 'transfer') {
    html += `<div class="struk-row"><span>Bank</span><span>${order.bankName||'-'}</span></div>`;
  } else if (order.payMethod === 'qris') {
    html += `<div class="struk-row"><span>Status</span><span>✅ Lunas</span></div>`;
  }
  return html + '<hr class="struk-divider"/>';
}

// ========== QR CODE ==========
function openQRModal() {
  const grid = document.getElementById('tableQRGrid');
  const baseUrl = location.href.replace('kasir.html','order.html');
  const zona = getZona(user.cabang);
  grid.innerHTML = zona.map(z => `
    <div style="grid-column:1/-1">
      <div style="font-family:'Bebas Neue';letter-spacing:3px;color:var(--gold);font-size:1rem;margin:16px 0 10px;padding-bottom:8px;border-bottom:1px solid var(--gold-border)">${z.label}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px">
        ${z.meja.map(m => buildQRCard(m, baseUrl)).join('')}
      </div>
    </div>`).join('');
  document.getElementById('qrModal').style.display = 'flex';
}

function buildQRCard(m, baseUrl) {
  const url = `${baseUrl}?cabang=${user.cabang}&meja=${encodeURIComponent(m)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&bgcolor=ffffff&color=111008&margin=6&data=${encodeURIComponent(url)}`;
  return `<div class="table-qr-item"><div style="width:120px;height:120px"><img src="${qrUrl}" alt="QR ${m}" width="120" height="120" style="display:block;border-radius:6px"/></div><div class="qr-table-label">${m}</div></div>`;
}

function closeQRModal() { document.getElementById('qrModal').style.display = 'none'; }
function printQRCodes() { window.print(); }
