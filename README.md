# .prodigi Setup

Dokumen ini merangkum langkah cara setup (dari clone lokal) hingga produksi-ready deployment untuk aplikasi Digital Product E-Commerce `.prodigi`:
- Backend: Express (Node.js) + Prisma (PostgreSQL)
- Frontend: Next.js (App Router) + REST API
- Payment: Xendit Invoice + webhook callback

## 🚀 Panduan Setup Lokal (Quick Start)

Ikuti langkah-langkah berikut ini jika Anda baru saja men-clone repository ini dan ingin menjalankannya di lokal (development):

### 1. Install Dependencies
Project ini menggunakan `npm`. Anda perlu menginstall dependencies di folder backend maupun frontend.
```bash
# Buka terminal dan masuk ke folder backend
cd backend
npm install

# Kembali ke root dan masuk ke folder frontend
cd ../frontend
npm install
cd ..
```

### 2. Setup Environment Variables
Buat file env untuk konfigurasi sistem agar terhubung dengan baik.
- **Backend:** Duplikat file `backend/.env.example` dan ubah namanya menjadi `backend/.env`. Di dalamnya sudah terdapat konfigurasi default untuk koneksi lokal. Pastikan Anda punya akun/API key yang sesuai jika ingin mencoba Xendit.
- **Frontend:** Buat file `frontend/.env.local` dan tambahkan baris berikut agar dapat melakukan request ke backend saat frontend dijalankan:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:8000
  ```
  *(Sesuaikan port jika backend Anda berjalan pada port selain 8000).*

### 3. Setup Database & Jalankan Backend
Backend membutuhkan PostgreSQL untuk menyimpan data. Cara termudah adalah dengan menggunakan Docker (pastikan Docker Desktop/Engine sudah berjalan).
```bash
cd backend

# A. Jalankan PostgreSQL melalui Docker Compose
docker compose -f compose.yaml up -d db

# B. Jalankan Prisma Migration (membuat tabel & tipe data)
npx prisma migrate dev

# C. Jalankan server backend (development mode)
npm run dev
```
Server Backend akan berjalan (default: `http://localhost:8000`).

### 4. Jalankan Frontend
Buka terminal baru di root project ini, lalu jalankan Next.js (TurboRepo):
```bash
cd frontend

# Jalankan server Next.js (development mode)
npm run dev
```
Frontend biasanya akan bisa diakses melalui `http://localhost:3000`.

---
## 📑 Variabel Environment & Deployment Checklist


## 1) Environment Variables

### Backend (`backend/.env`)
Minimal (mengikuti `backend/.env.example` + penambahan RBAC bootstrap):
- `DATABASE_URL` (PostgreSQL connection string)
- `JWT_SECRET`
- `XENDIT_SECRET_KEY`
- `XENDIT_CALLBACK_TOKEN`
- `FRONTEND_URL` (CORS allowlist)
- `ADMIN_BOOTSTRAP_EMAILS` (opsional, comma-separated; email di daftar ini akan dibuat `ADMIN` saat register)

Catatan keamanan:
- Untuk produksi, pastikan cookie `token` menggunakan `secure: true` (saat `NODE_ENV=production`).
- Backend menyimpan dan memverifikasi webhook dengan `XENDIT_CALLBACK_TOKEN` (lihat bagian webhook).

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL` (mis. `https://api.example.com:8080` atau URL backend Anda)

## 2) Database (PostgreSQL) dengan Docker Compose

Repo menyediakan Compose untuk PostgreSQL di `backend/compose.yaml`.

Langkah lokal:
1. Pastikan `docker` daemon berjalan.
2. Jalankan PostgreSQL:
   - `docker compose -f backend/compose.yaml up -d db`
3. Pastikan `DATABASE_URL` menunjuk ke host DB yang berjalan (mis. `localhost:5432` untuk dev).

## 3) Prisma: Migration & Generate

### Development
- Buat migration sesuai perubahan Prisma:
  - `npx prisma migrate dev --name <migration_name>`
- Generate client:
  - `npx prisma generate --schema backend/prisma/schema.prisma`

### Production
- Jalankan migration:
  - `npx prisma migrate deploy --schema backend/prisma/schema.prisma`
- Generate client biasanya dijalankan saat build image (opsional tergantung strategi CI/CD).

## 4) Backend Deployment (Express API)

Rekomendasi produksi:
1. Jalankan backend di container (Node.js) atau VM.
2. Pastikan REST API dapat diakses oleh frontend (CORS):
   - `FRONTEND_URL` harus sesuai origin frontend.
3. Pastikan webhook endpoint publik dapat diakses oleh Xendit.

## 5) Webhook Xendit (Canonical + Compatibility)

Backend memiliki 2 endpoint webhook:
- Canonical (required by spec): `POST /webhooks/xendit`
- Compatibility (existing): `POST /orders/webhook/xendit`

Webhook menggunakan:
- header token: `x-callback-token` (atau `X-CALLBACK-TOKEN`)
- validasi payload dengan Zod schema
- idempotency via upsert/unique constraints (PAID callbacks)

Pastikan Anda mengonfigurasi Xendit untuk mengirim webhook ke endpoint canonical (`/webhooks/xendit`) dan gunakan `XENDIT_CALLBACK_TOKEN` yang sama.

## 6) Frontend Deployment (Next.js App Router)

Langkah produksi:
1. Set `NEXT_PUBLIC_API_URL` untuk menunjuk backend REST API.
2. Build:
   - `npm run build` (di folder `frontend`)
3. Serve:
   - `npm run start` (di folder `frontend`)

## 7) Routing / Ingress (Reverse Proxy)

Rekomendasi pola:
- Proxy frontend dari domain utama (mis. `https://app.example.com`)
- Proxy backend dari subdomain atau path terpisah (mis. `https://api.example.com`)

Karena frontend memakai `NEXT_PUBLIC_API_URL` absolut (bukan `/api` prefix), pastikan:
- `NEXT_PUBLIC_API_URL` mengarah ke base URL backend yang benar.

## 8) Smoke Test Checklist

1. Register -> login -> akses `/library` (harus berhasil).
2. Admin bootstrap:
   - email yang ada di `ADMIN_BOOTSTRAP_EMAILS` harus menjadi `ADMIN`.
   - `POST/PUT/DELETE` pada `products/categories` harus menolak non-admin.
3. Checkout -> redirect ke Xendit -> webhook PAID -> library unlock.
4. Cek expiry untuk COURSE/SUBSCRIPTION (status dan tombol akses).

