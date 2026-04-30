// ================================
// KEDAY 70 – SERVICE WORKER
// ================================

const CACHE_NAME = 'keday70-v1';
const ASSETS = [
  './',
  './index.html',
  './kasir.html',
  './dapur.html',
  './owner.html',
  './order.html',
  './css/style.css',
  './js/data.js',
  './js/auth.js',
  './js/kasir.js',
  './js/dapur.js',
  './js/owner.js',
  './js/order-online.js',
  './manifest.json',
];

// Install: cache semua asset
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: hapus cache lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve dari cache dulu, fallback ke network
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request).then(res => {
        // Cache response baru
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      });
    }).catch(() => {
      // Offline fallback
      if (e.request.destination === 'document') {
        return caches.match('./index.html');
      }
    })
  );
});
