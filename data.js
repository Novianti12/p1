// ================================
// KEDAY 70 – DATA & STATE
// ================================

const KEDAY = {
  name: 'Keday Tujuh Puluh',
  cabang: {
    sukaseuri: { name: 'Cabang Sukaseuri', address: 'Sukaseuri, Cikampek, Karawang', phone: '0821-3728-7070' },
    purwasari:  { name: 'Cabang Purwasari',  address: 'Purwasari, Karawang, Jawa Barat', phone: '0895-1888-1872' }
  }
};

// ========== USERS ==========
const USERS = [
  { id:'u1', username:'owner',      password:'owner123',  role:'owner',  cabang:'all',        name:'Owner Keday 70' },
  { id:'u2', username:'kasir.sks',  password:'kasir123',  role:'kasir',  cabang:'sukaseuri',  name:'Kasir Sukaseuri' },
  { id:'u3', username:'kasir.pws',  password:'kasir123',  role:'kasir',  cabang:'purwasari',  name:'Kasir Purwasari' },
  { id:'u4', username:'dapur.sks',  password:'dapur123',  role:'dapur',  cabang:'sukaseuri',  name:'Tim Dapur Sukaseuri' },
  { id:'u5', username:'dapur.pws',  password:'dapur123',  role:'dapur',  cabang:'purwasari',  name:'Tim Dapur Purwasari' },
];

// ========== MEJA SUKASEURI ==========
const MEJA_SUKASEURI = [
  'B1-1','B1-2','B1-3','B1-4','B1-5','B1-6','B1-7','B1-8',
  'B2-1','B2-2','B2-3','B2-4','B2-5','B2-6','B2-7','B2-8','B2-9','B2-10','B2-11',
  'AL-1','AL-2','AL-3','AL-4','AL-5','AL-6','AL-7','AL-8',
  'AP-1','AP-2','AP-3','AP-4','AP-5','AP-6','AP-7','AP-8','AP-9','AP-10','AP-11',
  'Take Away'
];

// ========== MEJA PURWASARI (ZONA A1/A2/A3/A4) ==========
const MEJA_PURWASARI_A1 = ['A1-1','A1-2','A1-3','A1-4','A1-5','A1-6','A1-7'];
const MEJA_PURWASARI_A2 = [
  'A2-1','A2-2','A2-3','A2-4','A2-5','A2-6','A2-7','A2-8',
  'A2-9','A2-10','A2-11','A2-12','A2-13','A2-14','A2-15','A2-16'
];
const MEJA_PURWASARI_A3 = ['A3-1','A3-2','A3-3','A3-4'];
const MEJA_PURWASARI_A4 = [
  'A4-1','A4-2','A4-3','A4-4','A4-5','A4-6','A4-7','A4-8',
  'A4-9','A4-10','A4-11','A4-12','A4-13','A4-14','A4-15','A4-16'
];

const MEJA_PURWASARI = [
  ...MEJA_PURWASARI_A1,
  ...MEJA_PURWASARI_A2,
  ...MEJA_PURWASARI_A3,
  ...MEJA_PURWASARI_A4,
  'Take Away'
];

const ZONA_PURWASARI = [
  { zona:'A1', label:'🪑 Depan Kasir (A1)', meja: MEJA_PURWASARI_A1 },
  { zona:'A2', label:'🌿 Outdoor (A2)',      meja: MEJA_PURWASARI_A2 },
  { zona:'A3', label:'🚪 Depan Lesehan (A3)',meja: MEJA_PURWASARI_A3 },
  { zona:'A4', label:'🛋️ Lesehan (A4)',     meja: MEJA_PURWASARI_A4 },
  { zona:'TA', label:'📦 Take Away',         meja: ['Take Away'] },
];

const ZONA_SUKASEURI = [
  { zona:'B1', label:'Blok B1', meja: MEJA_SUKASEURI.filter(m=>m.startsWith('B1')) },
  { zona:'B2', label:'Blok B2', meja: MEJA_SUKASEURI.filter(m=>m.startsWith('B2')) },
  { zona:'AL', label:'Blok AL', meja: MEJA_SUKASEURI.filter(m=>m.startsWith('AL')) },
  { zona:'AP', label:'Blok AP', meja: MEJA_SUKASEURI.filter(m=>m.startsWith('AP')) },
  { zona:'TA', label:'Take Away', meja:['Take Away'] },
];

const MEJA = MEJA_SUKASEURI;

function getMeja(cabang) {
  return cabang === 'sukaseuri' ? MEJA_SUKASEURI : MEJA_PURWASARI;
}
function getZona(cabang) {
  return cabang === 'sukaseuri' ? ZONA_SUKASEURI : ZONA_PURWASARI;
}

// ========== MENU ==========
const MENU_ITEMS = [
  { id:'b1',  cat:'bakso',   emoji:'🍜', name:'Bakso Malang Lengkap',            price:19000,  avail:true },
  { id:'b2',  cat:'bakso',   emoji:'🍜', name:'Basmal LKP Tanpa Bihun',          price:17500,  avail:true },
  { id:'b3',  cat:'bakso',   emoji:'🥣', name:'Basmal Hemat',                    price:14000,  avail:true },
  { id:'b4',  cat:'bakso',   emoji:'🍜', name:'Bihun Bakso',                     price:14000,  avail:true },
  { id:'b5',  cat:'bakso',   emoji:'🍜', name:'Mie Ayam',                        price:14000,  avail:true },
  { id:'b6',  cat:'bakso',   emoji:'🍜', name:'Mie Ayam Bakso',                  price:19500,  avail:true },
  { id:'b7',  cat:'bakso',   emoji:'🍜', name:'Mie Ayam Pangsit Rebus',          price:17500,  avail:true },
  { id:'b8',  cat:'bakso',   emoji:'🍜', name:'Mie Sapi',                        price:20000,  avail:true },
  { id:'b9',  cat:'bakso',   emoji:'🥟', name:'Bakso Isi 3',                     price:16500,  avail:true },
  { id:'b10', cat:'bakso',   emoji:'🥟', name:'Gorengan (Pangsit/Risole)',        price:3500,   avail:true },
  { id:'b11', cat:'bakso',   emoji:'🧆', name:'Kukusan (Tahu/Somay)',             price:3500,   avail:true },
  { id:'c1',  cat:'chicken', emoji:'🍗', name:'Karage',                          price:14000,  avail:true },
  { id:'c2',  cat:'chicken', emoji:'🍗', name:'Shilin',                          price:14000,  avail:true },
  { id:'c3',  cat:'chicken', emoji:'🍗', name:'Katsu',                           price:15000,  avail:true },
  { id:'d1',  cat:'dimsum',  emoji:'🥟', name:'Kombi 4 (Ayam,Beef,Kepiting,Udang)', price:14000, avail:true },
  { id:'d2',  cat:'dimsum',  emoji:'🥟', name:'Kombi 3 (Crab Super,Nori,Hakau)',    price:14000, avail:true },
  { id:'d3',  cat:'dimsum',  emoji:'🥟', name:'Dimsum Goreng',                   price:15000,  avail:true },
  { id:'d4',  cat:'dimsum',  emoji:'🥟', name:'Dimsum Mentai',                   price:18000,  avail:true },
  { id:'d5',  cat:'dimsum',  emoji:'🧀', name:'Dimsum Mozarella',                price:18000,  avail:true },
  { id:'d6',  cat:'dimsum',  emoji:'🧀', name:'Dimsum Keju',                     price:18000,  avail:true },
  { id:'d7',  cat:'dimsum',  emoji:'🥟', name:'Dimsum Kombi 12',                 price:41000,  avail:true },
  { id:'d8',  cat:'dimsum',  emoji:'🥟', name:'Dimsum Kombi 10',                 price:41000,  avail:true },
  { id:'d9',  cat:'dimsum',  emoji:'🥟', name:'Lumpia Udang',                    price:14000,  avail:true },
  { id:'d10', cat:'dimsum',  emoji:'🥟', name:'Lumpia Ayam',                     price:14000,  avail:true },
  { id:'d11', cat:'dimsum',  emoji:'🥟', name:'Lumpia Ayam Goreng',              price:15000,  avail:true },
  { id:'d12', cat:'dimsum',  emoji:'📦', name:'Yellow Box Take Away (10/12)',     price:44000,  avail:true },
  { id:'d13', cat:'dimsum',  emoji:'🦶', name:'Angsio Ceker',                    price:14000,  avail:true },
  { id:'n1',  cat:'nasi',    emoji:'🍚', name:'Nasi',                            price:5000,   avail:true },
  { id:'n2',  cat:'nasi',    emoji:'🍱', name:'Rice Bowl Yakiniku',              price:20000,  avail:true },
  { id:'n3',  cat:'nasi',    emoji:'🍱', name:'Rice Bowl Karage',                price:18000,  avail:true },
  { id:'n4',  cat:'nasi',    emoji:'🍱', name:'Rice Bowl Dori',                  price:19000,  avail:true },
  { id:'n5',  cat:'nasi',    emoji:'🍱', name:'Paket Nasi Pepes Ayam',           price:27000,  avail:true },
  { id:'n6',  cat:'nasi',    emoji:'🍱', name:'Paket Nasi Campur Ayam Balado',   price:22000,  avail:true },
  { id:'n7',  cat:'nasi',    emoji:'🍗', name:'Pepes Ayam',                      price:18000,  avail:true },
  { id:'n8',  cat:'nasi',    emoji:'🌶️', name:'Extra Sambal',                   price:4000,   avail:true },
  { id:'n9',  cat:'nasi',    emoji:'🍱', name:'Paket Karage + Nasi',             price:19000,  avail:true },
  { id:'n10', cat:'nasi',    emoji:'🍱', name:'Paket Shilin + Nasi',             price:19000,  avail:true },
  { id:'n11', cat:'nasi',    emoji:'🍱', name:'Paket Katsu + Nasi',              price:20000,  avail:true },
  { id:'m1',  cat:'minuman', emoji:'🥤', name:'Jus Jambu Merah',                price:11000,  avail:true },
  { id:'m2',  cat:'minuman', emoji:'🥤', name:'Jus Mangga',                     price:11000,  avail:true },
  { id:'m3',  cat:'minuman', emoji:'🥤', name:'Jus Sirsak',                     price:11000,  avail:true },
  { id:'m4',  cat:'minuman', emoji:'🍋', name:'Melon Lime',                     price:12000,  avail:true },
  { id:'m5',  cat:'minuman', emoji:'🧋', name:'Jelly Leci',                     price:12000,  avail:true },
  { id:'m6',  cat:'minuman', emoji:'🍋', name:'Lemon Tea',                      price:10000,  avail:true },
  { id:'m7',  cat:'minuman', emoji:'🍊', name:'Jeruk Peras Panas/Es',           price:10000,  avail:true },
  { id:'m8',  cat:'minuman', emoji:'🍵', name:'Teh Manis Hangat',               price:6000,   avail:true },
  { id:'m9',  cat:'minuman', emoji:'🧊', name:'Es Teh Manis',                   price:7000,   avail:true },
  { id:'m10', cat:'minuman', emoji:'🍵', name:'Teh Tawar Hangat',               price:4000,   avail:true },
  { id:'m11', cat:'minuman', emoji:'🧊', name:'Es Teh Tawar',                   price:5000,   avail:true },
  { id:'m12', cat:'minuman', emoji:'🥤', name:'Minuman Seduh',                  price:7000,   avail:true },
  { id:'m13', cat:'minuman', emoji:'🧊', name:'Minuman Seduh Es',               price:8000,   avail:true },
  { id:'m14', cat:'minuman', emoji:'🍹', name:'Fruit Punch',                    price:12000,  avail:true },
  { id:'ds1', cat:'dessert', emoji:'🍨', name:'Ice Cream Bowl',                 price:10000,  avail:true },
  { id:'ds2', cat:'dessert', emoji:'🍦', name:'Roti Ice Cream Caramel',         price:16000,  avail:true },
  { id:'ds3', cat:'dessert', emoji:'🍓', name:'Salad Buah',                     price:18000,  avail:true },
  { id:'ds4', cat:'dessert', emoji:'🍓', name:'Salad Buah Ice Cream',           price:21000,  avail:true },
  { id:'ds5', cat:'dessert', emoji:'🍈', name:'Ximilu',                         price:18000,  avail:true },
];

const CATEGORIES = [
  { id:'all',     label:'🍽️ Semua' },
  { id:'bakso',   label:'🍜 Bakso' },
  { id:'chicken', label:'🍗 Chicken' },
  { id:'dimsum',  label:'🥟 Dimsum' },
  { id:'nasi',    label:'🍚 Nasi' },
  { id:'minuman', label:'🥤 Minuman' },
  { id:'dessert', label:'🍨 Dessert' },
];

// ========== LOCAL STORAGE ==========
function getOrders() {
  try { return JSON.parse(localStorage.getItem('k70_orders') || '[]'); } catch { return []; }
}
function saveOrders(orders) {
  localStorage.setItem('k70_orders', JSON.stringify(orders));
}
function getMenuItems() {
  try {
    const stored = localStorage.getItem('k70_menu');
    return stored ? JSON.parse(stored) : MENU_ITEMS;
  } catch { return MENU_ITEMS; }
}
function saveMenuItems(items) {
  localStorage.setItem('k70_menu', JSON.stringify(items));
}

// ========== SHIFT STATE ==========
function getShiftState(cabang, role) {
  const key = `k70_shift_${cabang}_${role}`;
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function saveShiftState(cabang, role, state) {
  const key = `k70_shift_${cabang}_${role}`;
  if (state === null) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(state));
}
function getShiftHistory(cabang) {
  const key = `k70_shift_history_${cabang}`;
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function saveShiftHistory(cabang, history) {
  const key = `k70_shift_history_${cabang}`;
  localStorage.setItem(key, JSON.stringify(history));
}

function generateOrderId(cabang) {
  const prefix = cabang === 'sukaseuri' ? 'SKS' : 'PWS';
  const num = String(Math.floor(Math.random()*9000)+1000);
  return `${prefix}-${num}`;
}
function formatRp(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID');
}
function formatTime(d) {
  const dt = new Date(d);
  return dt.toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'});
}
function formatDate(d) {
  return new Date(d).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'});
}

function seedDemoData() {
  const existing = getOrders();
  if (existing.length > 0) return;
  const now = Date.now();
  const demo = [
    { id:'SKS-1001', cabang:'sukaseuri', meja:'B1-3', items:[{name:'Bakso Malang Lengkap',qty:2,price:19000,emoji:'🍜',note:''},{name:'Es Teh Manis',qty:2,price:7000,emoji:'🧊',note:''}], total:52000, subtotal:52000, status:'selesai', note:'', createdAt: now-3600000, kasir:'Kasir Sukaseuri' },
    { id:'SKS-1002', cabang:'sukaseuri', meja:'AL-5', items:[{name:'Dimsum Goreng',qty:3,price:15000,emoji:'🥟',note:'Pedas'},{name:'Rice Bowl Yakiniku',qty:1,price:20000,emoji:'🍱',note:''}], total:65000, subtotal:65000, status:'proses', note:'Tidak pedas', createdAt: now-900000, kasir:'Kasir Sukaseuri' },
    { id:'SKS-1003', cabang:'sukaseuri', meja:'B2-1', items:[{name:'Karage',qty:2,price:14000,emoji:'🍗',note:'Ekstra saus'},{name:'Nasi',qty:2,price:5000,emoji:'🍚',note:''},{name:'Lemon Tea',qty:2,price:10000,emoji:'🍋',note:'Es sedikit'}], total:48000, subtotal:48000, status:'baru', note:'', createdAt: now-120000, kasir:'Kasir Sukaseuri' },
    { id:'PWS-2001', cabang:'purwasari', meja:'A1-2', items:[{name:'Mie Ayam Bakso',qty:2,price:19500,emoji:'🍜',note:''},{name:'Jus Mangga',qty:2,price:11000,emoji:'🥤',note:''}], total:61000, subtotal:61000, status:'selesai', note:'', createdAt: now-7200000, kasir:'Kasir Purwasari' },
    { id:'PWS-2002', cabang:'purwasari', meja:'A2-5', items:[{name:'Dimsum Kombi 12',qty:1,price:41000,emoji:'🥟',note:''},{name:'Ice Cream Bowl',qty:2,price:10000,emoji:'🍨',note:''}], total:61000, subtotal:61000, status:'baru', note:'Dibungkus', createdAt: now-300000, kasir:'Kasir Purwasari' },
  ];
  saveOrders(demo);
}
seedDemoData();
