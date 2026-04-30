// ================================
// KEDAY 70 – AUTH
// ================================

function doLogin() {
  const cabang   = document.getElementById('cabang').value;
  const role     = document.getElementById('role').value;
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const errEl    = document.getElementById('loginError');

  if (!username || !password) {
    showErr('Username dan password wajib diisi!'); return;
  }

  const user = USERS.find(u =>
    u.username === username &&
    u.password === password &&
    u.role === role &&
    (u.cabang === cabang || u.cabang === 'all')
  );

  if (!user) {
    showErr('Username, password, atau role tidak sesuai!'); return;
  }

  // Save session
  sessionStorage.setItem('k70_user', JSON.stringify({
    id: user.id, name: user.name, role: user.role,
    cabang: user.cabang === 'all' ? cabang : user.cabang,
    username: user.username
  }));

  // Redirect
  if (role === 'kasir')  { window.location.href = 'kasir.html'; }
  else if (role === 'dapur') { window.location.href = 'dapur.html'; }
  else if (role === 'owner') { window.location.href = 'owner.html'; }
}

function showErr(msg) {
  const el = document.getElementById('loginError');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function getSession() {
  try {
    const s = sessionStorage.getItem('k70_user');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function requireAuth(requiredRole) {
  const user = getSession();
  if (!user) { window.location.href = 'index.html'; return null; }
  if (requiredRole && user.role !== requiredRole) {
    window.location.href = 'index.html'; return null;
  }
  return user;
}

function togglePass() {
  const inp = document.getElementById('password');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

// Clock
function startClock() {
  const el = document.getElementById('timeDisplay');
  if (!el) return;
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }
  tick(); setInterval(tick, 1000);
}

// Toast
function showToast(msg, type='') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' '+type : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3000);
}

// Enter key on login
document.addEventListener('DOMContentLoaded', () => {
  const pw = document.getElementById('password');
  if (pw) pw.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  const un = document.getElementById('username');
  if (un) un.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  startClock();

  // Set user chip & cabang label
  const user = getSession();
  const uc = document.getElementById('userChip');
  const cl = document.getElementById('cabangLabel');
  if (uc && user) uc.textContent = `👤 ${user.name}`;
  if (cl && user) {
    const info = KEDAY.cabang[user.cabang];
    cl.textContent = info ? info.name : 'Semua Cabang';
  }
});
