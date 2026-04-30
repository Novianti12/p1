// ================================
// KEDAY 70 – ORDER ONLINE (QR)
// ================================

let cabang, meja, cart = [], activeCategory = 'all', currentMenu = [];

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  cabang = params.get('cabang') || 'sukaseuri';
  meja   = params.get('meja')   || 'Meja 1';

  const info = KEDAY.cabang[cabang];
  document.getElementById('tableInfo').textContent = `${meja} · ${info?.name || cabang}`;
  document.title = `Pesan – ${meja} | Keday 70`;

  currentMenu = getMenuItems().filter(m => m.avail);
  renderCats();
  renderMenuGrid();
  renderCart();
});

// ========== CATEGORIES ==========
function renderCats() {
  const el = document.getElementById('orderCats');
  el.innerHTML = CATEGORIES.map(c =>
    `<div class="order-cat-btn ${c.id === activeCategory ? 'active' : ''}" onclick="setOrderCat('${c.id}')">${c.label}</div>`
  ).join('');
}
function setOrderCat(id) {
  activeCategory = id;
  renderCats();
  renderMenuGrid();
}

// ========== MENU ==========
function renderMenuGrid(query = '') {
  const grid = document.getElementById('orderMenuGrid');
  const items = currentMenu.filter(m => {
    const matchCat = activeCategory === 'all' || m.cat === activeCategory;
    const matchQ   = !query || m.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  if (!items.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-dim)">Menu tidak ditemukan 🍽️</div>`;
    return;
  }

  grid.innerHTML = items.map(m => {
    const inCart = cart.find(c => c.id === m.id);
    return `
      <div class="order-menu-item" onclick="addToOrderCart('${m.id}')">
        <div class="omi-emoji">${m.emoji}</div>
        <div class="omi-name">${m.name}</div>
        <div class="omi-price">${formatRp(m.price)}</div>
        ${inCart ? `<div style="margin-top:6px;background:var(--gold-dim);border:1px solid var(--gold-border);color:var(--gold);font-size:.72rem;padding:3px 10px;border-radius:100px;display:inline-block">${inCart.qty} di keranjang</div>` : ''}
      </div>`;
  }).join('');
}

function filterOrderMenu(q) {
  renderMenuGrid(q);
}

// ========== CART ==========
function addToOrderCart(id) {
  const item = currentMenu.find(m => m.id === id);
  if (!item) return;
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, name: item.name, price: item.price, qty: 1, emoji: item.emoji });
  renderCart();
  renderMenuGrid(document.querySelector('.order-search input')?.value || '');
  showToast(`✅ ${item.name} ditambahkan`);
}

function updateCartQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
  renderCart();
  renderMenuGrid(document.querySelector('.order-search input')?.value || '');
}

function calcCart() {
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax = Math.round(subtotal * 0.1);
  return { subtotal, tax, total: subtotal + tax };
}

function renderCart() {
  const el = document.getElementById('cartItems');
  if (!cart.length) {
    el.innerHTML = `<div class="empty-cart"><div style="font-size:2.5rem">🍽️</div><div>Keranjang kosong</div></div>`;
  } else {
    el.innerHTML = cart.map(c => `
      <div class="cart-item">
        <span style="font-size:1.2rem">${c.emoji}</span>
        <div class="ci-name">${c.name}</div>
        <div class="ci-qty">
          <button class="ci-qbtn" onclick="updateCartQty('${c.id}',-1)">−</button>
          <span class="ci-qnum">${c.qty}</span>
          <button class="ci-qbtn" onclick="updateCartQty('${c.id}',1)">+</button>
        </div>
      </div>`).join('');
  }

  const { subtotal, tax, total } = calcCart();
  document.getElementById('cartSub').textContent   = formatRp(subtotal);
  document.getElementById('cartTax').textContent   = formatRp(tax);
  document.getElementById('cartTotal').textContent = formatRp(total);

  const btn = document.getElementById('btnOrderSend');
  btn.disabled = cart.length === 0;
  btn.style.opacity = cart.length === 0 ? '0.5' : '1';
}

// ========== SUBMIT ORDER ==========
function submitOrder() {
  if (!cart.length) return;
  const { subtotal, tax, total } = calcCart();
  const note = document.getElementById('customerNote').value;

  const order = {
    id: generateOrderId(cabang),
    cabang,
    meja,
    items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price, emoji: c.emoji })),
    subtotal, tax, total,
    status: 'baru',
    note: note ? `[Order Mandiri] ${note}` : '[Order Mandiri via QR]',
    createdAt: Date.now(),
    kasir: 'Self Order'
  };

  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);

  // Show success screen
  document.getElementById('successOrderNum').textContent = `#${order.id}`;
  document.getElementById('orderSuccess').style.display = 'flex';
}

function resetOrder() {
  cart = [];
  document.getElementById('customerNote').value = '';
  document.getElementById('orderSuccess').style.display = 'none';
  renderCart();
  renderMenuGrid();
}
