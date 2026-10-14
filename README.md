# OneMarket — Centralized Multi-Channel Marketplace Management & Auto-Publisher

OneMarket adalah aplikasi web *Omnichannel Product Management* terpusat yang dirancang untuk toko keluarga dan UMKM. Cukup masukkan data produk 1x, sistem akan mempublikasikannya ke **Shopee**, **Tokopedia**, dan **OLX** secara otomatis.

---

## 🏗️ Tech Stack

- **Frontend**: Vite + React (TypeScript) + Vanilla CSS Modern Design System.
- **Backend API**: Hono (Node.js / TypeScript).
- **Database & ORM**: SQLite (`better-sqlite3`) dengan WAL mode + Drizzle ORM.
- **Queue Engine**: In-process Queue (`p-queue`) dengan rate-limiting & auto-retry.
- **Automation Ready**: Playwright worker scaffolding untuk OLX.

---

## 🚀 Cara Menjalankan

### 1. Menjalankan Server & Client Bersamaan (Development)
```bash
npm run dev
```
- Frontend Web App: [http://localhost:5173](http://localhost:5173)
- Backend REST API: [http://localhost:3001](http://localhost:3001)

### 2. Menjalankan Secara Terpisah
```bash
# Menjalankan Backend saja
npm run dev:server

# Menjalankan Frontend saja
npm run dev:client
```

### 3. Build Production
```bash
npm run build
```

---

## 🌟 Fitur Utama (Fase 1 MVP)

1. **Mode Toko Keluarga (Simple Mode)**:
   - Antarmuka ramah non-teknis / orang tua.
   - Form upload foto (drag & drop), nama, harga, stok, dan pilihan marketplace.
   - Tombol 1-klik: **Simpan & Terbitkan Sekarang**.
2. **Mode Admin & Pengembang**:
   - Pengaturan kredensial toko resmi Shopee Open API & Tokopedia Partner API.
   - Sandbox / Live toggle.
   - Category & Attribute Mapper table.
3. **Multi-Channel Distribution Queue**:
   - Pemrosesan background queue tanpa freeze atau blocking request HTTP.
   - Status badge live per kanal (`Shopee`, `Tokopedia`, `OLX`) beserta tautan langsung ke etalase toko.
