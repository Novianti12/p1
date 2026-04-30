# 🍜 Keday 70 – Aplikasi Kasir & Manajemen

Aplikasi kasir lengkap untuk **Keday Tujuh Puluh** (Cabang Sukaseuri & Purwasari).

---

## 📁 Struktur File

```
keday70-kasir/
├── index.html          ← Halaman Login
├── kasir.html          ← Halaman Kasir
├── dapur.html          ← Layar Dapur (Kitchen Display)
├── owner.html          ← Dashboard Owner
├── order.html          ← Order Mandiri via QR (Tamu)
├── manifest.json       ← PWA Manifest (untuk install APK)
├── sw.js               ← Service Worker (offline support)
├── css/
│   └── style.css       ← Semua styling
├── js/
│   ├── data.js         ← Data menu, user, state management
│   ├── auth.js         ← Login & session
│   ├── kasir.js        ← Logic kasir
│   ├── dapur.js        ← Logic dapur (real-time polling)
│   ├── owner.js        ← Dashboard owner
│   └── order-online.js ← Order mandiri tamu
└── icons/
    └── icon.svg        ← Icon aplikasi
```

---

## 🔐 Akun Default

| Role  | Username    | Password  | Cabang      |
|-------|-------------|-----------|-------------|
| Owner | owner       | owner123  | Semua       |
| Kasir | kasir.sks   | kasir123  | Sukaseuri   |
| Kasir | kasir.pws   | kasir123  | Purwasari   |
| Dapur | dapur.sks   | dapur123  | Sukaseuri   |
| Dapur | dapur.pws   | dapur123  | Purwasari   |

---

## 🚀 Cara Menjalankan

### Opsi 1: Lokal (PC/Laptop)
1. Buka folder `keday70-kasir`
2. Klik dua kali `index.html` — ATAU —
3. Gunakan Live Server di VS Code untuk fitur lengkap

### Opsi 2: Deploy ke Hosting (Recommended)
Upload seluruh folder ke:
- **Netlify** (gratis): drag & drop di netlify.com
- **Vercel** (gratis): vercel.com
- **GitHub Pages** (gratis): push ke GitHub repo

---

## 📱 Cara Install sebagai APK di Android

### Metode A – Install via Browser (PWA) — Termudah!
1. Buka link website di **Google Chrome** di HP Android
2. Tap menu ⋮ (titik tiga) di pojok kanan atas
3. Pilih **"Tambahkan ke Layar Utama"** atau **"Install App"**
4. Konfirmasi → Aplikasi langsung terinstall di HP! ✅

### Metode B – Convert ke APK dengan PWABuilder
1. Upload project ke hosting dulu (Netlify/Vercel)
2. Buka **pwabuilder.com**
3. Masukkan URL website kamu
4. Klik **"Build My PWA"** → pilih **Android**
5. Download file `.apk` → install di HP

### Metode C – Bunyakan dengan Capacitor (untuk dev)
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Keday 70" "com.keday70.kasir"
npx cap add android
# Copy file ke www/ folder lalu:
npx cap sync
npx cap open android
# Build APK di Android Studio
```

---

## 🌟 Fitur Lengkap

### 🧾 Kasir
- ✅ Pilih meja (10 meja + Take Away)
- ✅ Tambah/kurangi item dari menu lengkap
- ✅ Pencarian & filter kategori menu
- ✅ Catatan pesanan
- ✅ Kalkulasi otomatis + pajak 10%
- ✅ Kirim order langsung ke dapur
- ✅ Cetak struk (preview + print)
- ✅ Generate QR Code per meja

### 👨‍🍳 Dapur (Kitchen Display)
- ✅ Tampilan 3 kolom: Baru / Diproses / Selesai
- ✅ Auto-refresh setiap 3 detik
- ✅ Notifikasi bunyi saat order baru masuk
- ✅ Update status order (Proses → Selesai)
- ✅ Indikator urgent (order > 10 menit)
- ✅ Statistik real-time

### 👑 Owner Dashboard
- ✅ KPI: Pendapatan, Transaksi, Pending, Rata-rata
- ✅ Filter per cabang (Sukaseuri / Purwasari / Semua)
- ✅ Riwayat transaksi dengan filter tanggal
- ✅ Menu terlaris
- ✅ Kelola menu (tambah/edit/hapus/toggle ketersediaan)
- ✅ Laporan penjualan + grafik
- ✅ Export CSV
- ✅ Manajemen akun

### 📱 Order Mandiri (Tamu via QR)
- ✅ Scan QR → langsung ke halaman order
- ✅ Menu lengkap dengan kategori & pencarian
- ✅ Keranjang belanja
- ✅ Order langsung masuk ke sistem dapur
- ✅ Konfirmasi sukses

---

## ⚙️ Kustomisasi

### Ganti Password Akun
Edit file `js/data.js` → bagian `const USERS`

### Tambah Menu Baru
- Via Owner Dashboard: Login owner → Kelola Menu → Tambah Menu
- Atau langsung edit `js/data.js` → bagian `MENU_ITEMS`

### Tambah Meja
Edit file `js/data.js` → bagian `const MEJA`

### Ganti Info Cabang
Edit file `js/data.js` → bagian `const KEDAY`

---

## 📞 Kontak & Support

- **Admin Pusat:** 0821-2526-4321
- **Admin Sukaseuri:** 0821-3728-7070
- **Admin Purwasari:** 0895-1888-1872

---

© 2025 Keday Tujuh Puluh. Senin–Minggu · 10.00–21.00 WIB
