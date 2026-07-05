# STEPS.md — Panduan Deploy AMTEHI

> Langkah-langkah menjalankan AMTEHI di **localhost (testing)** dan mem-*hosting*-nya ke
> **Vercel (produksi)**. Backend Express dijalankan sebagai **serverless function**, dan
> frontend + backend tampil di **satu domain** lewat **Next.js rewrites**.
>
> © Faga | echofaga · AMTEHI · *Dibuat 2026-07-04*

---

## Daftar Isi

- [Ringkasan Arsitektur Deploy](#ringkasan-arsitektur-deploy)
- [BAGIAN A — Localhost (Testing)](#bagian-a--localhost-testing)
  - [A.1 Prasyarat](#a1-prasyarat)
  - [A.2 Install & Build Shared](#a2-install--build-shared)
  - [A.3 Konfigurasi Environment](#a3-konfigurasi-environment)
  - [A.4 Prisma & Database](#a4-prisma--database)
  - [A.5 Jalankan & Uji](#a5-jalankan--uji)
  - [A.6 (Opsional) Uji Wrapper Serverless Lokal](#a6-opsional-uji-wrapper-serverless-lokal)
- [BAGIAN B — Vercel (Hosting Produksi)](#bagian-b--vercel-hosting-produksi)
  - [B.0 Gambaran & Urutan](#b0-gambaran--urutan)
  - [B.1 Persiapan Supabase untuk Produksi](#b1-persiapan-supabase-untuk-produksi)
  - [B.2 Migrasi Database ke Supabase](#b2-migrasi-database-ke-supabase)
  - [B.3 Deploy Proyek API](#b3-deploy-proyek-api)
  - [B.4 Deploy Proyek Web](#b4-deploy-proyek-web)
  - [B.5 Hubungkan Keduanya (rewrites)](#b5-hubungkan-keduanya-rewrites)
  - [B.6 Seed Admin di Produksi](#b6-seed-admin-di-produksi)
- [BAGIAN C — Verifikasi Pasca-Deploy](#bagian-c--verifikasi-pasca-deploy)
- [BAGIAN D — Troubleshooting](#bagian-d--troubleshooting)
- [Lampiran — Ringkasan Environment Variables](#lampiran--ringkasan-environment-variables)

---

## Ringkasan Arsitektur Deploy

```
                    Browser (user)
                         │  semua request ke SATU domain web
                         ▼
        ┌────────────────────────────────────┐
        │  Vercel Project: WEB (Next.js)      │
        │  https://amtehi.vercel.app          │
        │                                     │
        │  next.config.mjs → rewrites():      │
        │   /api/:path*  ──(server-side)──┐   │
        └─────────────────────────────────┼───┘
                                          │  proxy internal (bukan browser)
                                          ▼
        ┌────────────────────────────────────┐
        │  Vercel Project: API (Express)      │
        │  https://amtehi-api.vercel.app      │
        │  1 serverless function (api/index)  │
        └───────────────┬────────────────────┘
                        │  Prisma (Transaction Pooler :6543)
                        ▼
        ┌────────────────────────────────────┐
        │  Supabase (Auth + Postgres + Storage)│
        └────────────────────────────────────┘
```

**Kenapa dua proyek tapi satu domain?** Browser hanya bicara ke domain web (`/api/...`
relatif). Next.js mem-proxy request itu ke deployment API di sisi server. Hasilnya:
cookie tetap **first-party** dan `SameSite=Strict` dipertahankan — tanpa perlu CORS
lintas-domain. Ini paling aman & paling sedikit perubahan kode.

**Kata kunci penting:**
- Backend = **1 serverless function** (`apps/api/api/index.ts` membungkus `createApp()`).
- DB produksi = **Transaction Pooler port 6543** + `?pgbouncer=true&connection_limit=1`.
- Migrasi = **selalu** lewat `DIRECT_URL` port 5432 (jangan di build serverless).

---

## BAGIAN A — Localhost (Testing)

Bagian ini sama seperti pengembangan biasa; belum menyentuh Vercel.

### A.1 Prasyarat
- Node.js **≥ 20** dan npm.
- Akun & proyek **Supabase** aktif.
- (Opsional, untuk B & A.6) **Vercel CLI**: `npm i -g vercel`.

### A.2 Install & Build Shared
```bash
# dari root repo
npm install

# @amtehi/shared WAJIB dikompilasi ke dist sebelum api/web mengimpornya
npm run build --workspace=@amtehi/shared
```

### A.3 Konfigurasi Environment
Salin `.env.example` menjadi dua file lalu isi nilainya:

**`apps/api/.env`**
```bash
NODE_ENV=development
PORT=3001
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # RAHASIA — backend saja
# Dev lokal: Session Pooler port 5432 cukup untuk keduanya
DATABASE_URL=postgresql://postgres.<ref>:<pw>@aws-1-<region>.pooler.supabase.com:5432/postgres
DIRECT_URL=postgresql://postgres.<ref>:<pw>@aws-1-<region>.pooler.supabase.com:5432/postgres
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE_MB=5
```

**`apps/web/.env.local`**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
NEXT_PUBLIC_API_URL=http://localhost:3001/api   # dev: URL absolut ke API lokal
# API_URL tidak perlu di lokal (rewrites nonaktif saat API_URL kosong)
```

> **Catatan:** `DIRECT_URL` wajib ada karena `schema.prisma` sekarang memakai
> `directUrl`. Di lokal boleh sama dengan `DATABASE_URL` (dua-duanya 5432).

### A.4 Prisma & Database
```bash
npm run prisma:generate        # generate Prisma client
npm run prisma:migrate         # terapkan migrasi ke DB (lewat DIRECT_URL)
```
Lalu terapkan **RLS policy**: jalankan isi `apps/api/prisma/sql/rls-policies.sql`
di **SQL Editor Supabase**.

> Jika `prisma generate` gagal `EPERM` (Windows): **hentikan dev server dulu**
> (lihat [Troubleshooting](#bagian-d--troubleshooting)).

### A.5 Jalankan & Uji
```bash
npm run dev            # web + api bersamaan
# atau terpisah:
npm run dev:api        # http://localhost:3001
npm run dev:web        # http://localhost:3000
```
Cek backend hidup:
```bash
curl http://localhost:3001/api/health
# → {"success":true,"data":{"status":"ok","service":"amtehi-api"}}
```
Buka **http://localhost:3000** dan ikuti skenario uji di `README.md`.

### A.6 (Opsional) Uji Wrapper Serverless Lokal
Untuk memastikan bungkus serverless (`apps/api/api/index.ts`) — yang meng-import
hasil kompilasi `dist/app.js` — benar **sebelum** deploy.

**Langkah 1 (WAJIB untuk kedua metode): build berurutan seperti Vercel**
```bash
# dari root repo
npm run build --workspace=@amtehi/shared
npm run prisma:generate --workspace=@amtehi/api
npm run build --workspace=@amtehi/api      # menghasilkan apps/api/dist/app.js
```
Pastikan `apps/api/dist/app.js` sekarang ada sebelum lanjut.

---

#### Metode 1 — Murni lokal (disarankan; TANPA menyentuh Vercel)
Mem-boot `dist/app.js` `createApp()` persis seperti yang dibungkus wrapper, lalu
hit `/api/health`. Membuktikan artefak kompilasi valid & endpoint hidup, **tanpa**
membuat proyek apa pun di cloud. Buat file sementara `apps/api/_smoke.mjs`:
```js
import { createApp } from './dist/app.js';
const app = createApp();
const server = app.listen(3011, async () => {
  const res = await fetch('http://localhost:3011/api/health');
  console.log('STATUS=' + res.status, 'BODY=' + await res.text());
  server.close(() => process.exit(0));
});
```
Jalankan lalu hapus:
```bash
cd apps/api
node _smoke.mjs      # harus cetak STATUS=200 BODY={"success":true,...}
rm _smoke.mjs        # PowerShell: Remove-Item _smoke.mjs
```
> Catatan: `/api/health` tidak query DB, jadi metode ini tidak menguji koneksi
> Prisma/Supabase — itu terbukti nanti di Bagian C. Di Windows, Node kadang
> mencetak `Assertion failed ... async.c` saat teardown setelah `process.exit`;
> abaikan — hasil `STATUS=200` sudah tercetak sebelum itu.

---

#### Metode 2 — Emulator `vercel dev` (butuh akun Vercel + link proyek)
Meniru cara Vercel menjalankan API. **Pertama kali** menjalankan `vercel dev` di
folder `apps/api`, Vercel akan menautkan folder ini ke sebuah **proyek di cloud**
(dan membuatnya bila belum ada). Ini menulis `apps/api/.vercel/project.json`.
```bash
cd apps/api

# 1. (Pertama kali) tautkan folder ke proyek Vercel.
#    Jawab prompt: pilih scope/tim → "Link to existing project?" →
#    jika sudah deploy API (Bagian B.3), pilih proyek "amtehi-api";
#    jika belum, biarkan Vercel membuat proyek baru.
vercel link

# 2. Jalankan emulator (default http://localhost:3000).
#    --yes melewati prompt konfirmasi bila folder sudah tertaut.
vercel dev --yes

# 3. Di terminal lain, uji catch-all mempertahankan /api
curl http://localhost:3000/api/health       # harus 200
```
> **Peringatan:** `vercel link`/`vercel dev` membuat/menautkan proyek **nyata** di
> akun Vercel-mu. Jika kamu hanya ingin menguji lokal cepat, pakai **Metode 1**.
> Jika `.vercel/project.json` menunjuk proyek yang sudah dihapus, `vercel dev`
> akan error *"Project was deleted / no access"* — jalankan `vercel link` ulang
> untuk memperbaikinya.

> `vercel dev` hanya meniru **satu** proyek + rewrites-nya sendiri; ia tidak
> meniru rewrite lintas-proyek. Untuk itu, uji end-to-end setelah deploy (Bagian C).

---

## BAGIAN B — Vercel (Hosting Produksi)

### B.0 Gambaran & Urutan
Kita buat **dua proyek Vercel** dari repo yang sama:
1. **API** (root `apps/api`) — deploy dulu, agar URL-nya diketahui.
2. **WEB** (root `apps/web`) — perlu URL API untuk rewrites.

Urutan aman: **B.1 → B.2 → B.3 (API) → catat URL API → B.4 (WEB) → B.5 → B.6**.

> Prasyarat: kode sudah di-*push* ke GitHub, dan repo terhubung ke akun Vercel.

### B.1 Persiapan Supabase untuk Produksi
1. Buka **Supabase → Project Settings → Database → Connection string**.
2. Siapkan **dua** connection string:
   - **Transaction Pooler** (port **6543**) → untuk `DATABASE_URL` runtime serverless.
     Tambahkan query: `?pgbouncer=true&connection_limit=1`.
   - **Session Pooler** (port **5432**) → untuk `DIRECT_URL` (migrasi).
3. Pastikan **Storage bucket `item-photos`** sudah ada (dipakai upload foto).

### B.2 Migrasi Database ke Supabase
Jalankan migrasi **dari lokal** menargetkan DB produksi (jangan di build Vercel).
Cara termudah: sementara arahkan `apps/api/.env` `DIRECT_URL` ke DB produksi, lalu:
```bash
cd apps/api
npx prisma migrate deploy         # memakai directUrl (port 5432)
```
Lalu terapkan `prisma/sql/rls-policies.sql` di **SQL Editor Supabase** (produksi).

> **Penting:** `prisma migrate` **tidak boleh** lewat pooler 6543 (pgBouncer tak
> dukung prepared statements/DDL). Selalu port 5432.

### B.3 Deploy Proyek API
1. **Vercel → Add New → Project** → pilih repo AMTEHI.
2. **Root Directory:** `apps/api`. Aktifkan **"Include files outside of the Root
   Directory in the Build Step"** (biasanya otomatis karena terdeteksi monorepo/turbo).
3. **Framework Preset:** `Other`.
4. **Build & Install Command:** biarkan Vercel memakai `apps/api/vercel.json`
   (sudah berisi `installCommand` & `buildCommand` 3-langkah: build shared →
   `prisma generate` → build api). Tidak perlu diisi manual.
5. **Environment Variables** (Settings → Environment Variables):
   | Key | Nilai |
   |---|---|
   | `NODE_ENV` | `production` |
   | `SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `SUPABASE_ANON_KEY` | *(anon key)* |
   | `SUPABASE_SERVICE_ROLE_KEY` | *(service role — RAHASIA)* |
   | `DATABASE_URL` | Transaction Pooler **:6543** `?pgbouncer=true&connection_limit=1` |
   | `DIRECT_URL` | Session Pooler **:5432** |
   | `FRONTEND_URL` | `https://<domain-web>` *(isi setelah B.4; sementara boleh URL web sementara)* |
   | `MAX_FILE_SIZE_MB` | `4` *(batas body Vercel ~4.5MB)* |
6. **Deploy.** Setelah selesai, **catat URL API**, mis. `https://amtehi-api.vercel.app`.
7. Cek: `curl https://amtehi-api.vercel.app/api/health` → harus `200`.

> `NODE_ENV=production` **wajib** — tanpanya cookie tidak mendapat flag `Secure`
> dan akan di-drop browser di HTTPS.

### B.4 Deploy Proyek Web
1. **Vercel → Add New → Project** → pilih repo AMTEHI yang **sama**.
2. **Root Directory:** `apps/web`. **Framework Preset:** `Next.js` (otomatis).
3. **Environment Variables:**
   | Key | Nilai |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(anon key)* |
   | `API_URL` | URL API dari B.3, mis. `https://amtehi-api.vercel.app` *(server-side, TANPA `NEXT_PUBLIC_`)* |
   | `NEXT_PUBLIC_API_URL` | **kosongkan** *(agar axios pakai `/api` relatif)* |
4. **Deploy.** Catat URL web, mis. `https://amtehi.vercel.app`.

### B.5 Hubungkan Keduanya (rewrites)
1. Kembali ke **proyek API** → env `FRONTEND_URL` = URL web dari B.4
   (`https://amtehi.vercel.app`) → **Redeploy** proyek API agar CORS & cookie origin benar.
2. Pastikan proyek web punya `API_URL` yang benar (B.4). `rewrites()` di
   `next.config.mjs` akan mem-proxy `/api/:path*` → `${API_URL}/api/:path*`.
3. **Redeploy** proyek web bila `API_URL` baru diisi/diubah.

### B.6 Seed Admin di Produksi
Role admin tidak bisa dibuat lewat UI. Dua cara:
- **Seed script** (dari lokal, dengan `apps/api/.env` menunjuk DB produksi):
  ```bash
  ADMIN_EMAIL=admin@amikom.ac.id ADMIN_PASSWORD=<kuat> npm run seed:admin --workspace=@amtehi/api
  ```
- **SQL Editor Supabase** — promote akun yang sudah registrasi:
  ```sql
  update public.profiles set role = 'admin'
  where id = (select id from auth.users where email = 'akunmu@students.amikom.ac.id');
  ```

---

## BAGIAN C — Verifikasi Pasca-Deploy

Uji lewat **domain web** (bukan domain API), karena itu alur user asli:

| # | Uji | Cara | Harapan |
|---|---|---|---|
| 1 | **Health** | `curl https://<api-domain>/api/health` | `200` + JSON status ok |
| 2 | **Health via web** | buka `https://<web-domain>/api/health` di browser | `200` (membuktikan rewrites jalan) |
| 3 | **Login cookie** | login di web → DevTools → Application → Cookies | ada `sb-access-token` `HttpOnly; Secure; SameSite=Strict` di domain web |
| 4 | **Sesi terbaca** | setelah login, buka `/dashboard` / `/profile` | terautorisasi (tidak balik ke login) |
| 5 | **Upload foto** | lapor barang + unggah foto (< 4MB) | sukses, foto tampil dari Supabase Storage |
| 6 | **Admin** | login admin → `/admin` | statistik & panel muncul |

---

## BAGIAN D — Troubleshooting

| Gejala | Sebab | Solusi |
|---|---|---|
| `FUNCTION_INVOCATION_FAILED` saat buka `/api/*` | Env var kurang/salah (env.ts kini `throw`) | Cek **Logs** proyek API di Vercel; lengkapi env yang `Required` |
| `PrismaClientInitializationError: Query engine ... not found` | Engine Linux tak ter-*bundle* | Pastikan `binaryTargets=["native","rhel-openssl-3.0.x"]` di schema; `vercel.json` sudah `includeFiles` `node_modules/.prisma/client/**`; redeploy |
| `prisma migrate` error prepared statement | Migrasi lewat pooler 6543 | Jalankan migrasi lewat `DIRECT_URL` (port **5432**) |
| Login sukses tapi langsung logout / sesi hilang | Cookie tak dapat `Secure` | Set `NODE_ENV=production` di proyek API, redeploy |
| `/api/*` dari web kena 404/CORS | `API_URL` belum di-set / salah di proyek web | Isi `API_URL` = URL API, redeploy web |
| Build API gagal: `TS2688 Cannot find type definition file for 'node'` | `NODE_ENV=production` membuat `npm install` membuang devDeps (`@types/node`) | `installCommand` = `npm install --include=dev` di `apps/api/vercel.json` (BUG-004) |
| Deploy API gagal: `No Output Directory named "public" found` | `buildCommand` custom → Vercel cari output statis; proyek serverless-only | Sediakan folder `apps/api/public/` kosong (`.gitkeep`) (BUG-005) |
| Runtime API: `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` | Express `trust proxy=false` di balik proxy Vercel | `app.set('trust proxy', 1)` di `apps/api/src/app.ts` (BUG-006) |
| Web: data barang "gagal memuat"; `/api/*` via web balas HTML 404 (`X-Matched-Path: /404`) | Turborepo memfilter env; `API_URL` tak diteruskan ke `next build` → `rewrites()` kosong | Tambah `env: ["API_URL", ...]` pada task `build` di `turbo.json`, lalu redeploy tanpa cache (BUG-007) |
| Link web/API minta login Vercel (redirect ke `vercel.com/sso-api`) | **Deployment Protection** (Vercel Authentication) aktif | Proyek → Settings → **Deployment Protection** → matikan *Vercel Authentication* (set Disabled) di **kedua** proyek. Wajib agar link bisa diakses publik/penguji |
| Upload foto > ~4.5MB gagal (413) | Batas body Vercel | Set `MAX_FILE_SIZE_MB=4`; atau (lanjutan) upload langsung browser→Supabase Storage |
| Build API gagal: `@amtehi/shared` tak ketemu | `npm install` jalan di `apps/api`, bukan root | Aktifkan "Include files outside Root Directory"; pastikan monorepo terdeteksi |
| `EPERM rename query_engine-windows.dll.node` (LOKAL) | Dev server memegang DLL (Windows) | Stop dev server (Ctrl+C) → `npx prisma generate` → `npm run dev`. Tidak terjadi di Vercel (Linux) |

---

## Lampiran — Ringkasan Environment Variables

| Variabel | Lokal (`.env`) | Vercel API | Vercel Web | Keterangan |
|---|---|---|---|---|
| `NODE_ENV` | `development` | `production` | — | Wajib `production` di API (flag cookie Secure) |
| `PORT` | `3001` | — | — | Tak dipakai di serverless |
| `SUPABASE_URL` | ✅ | ✅ | — | |
| `SUPABASE_ANON_KEY` | ✅ | ✅ | — | |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | ❌ | RAHASIA, backend saja |
| `DATABASE_URL` | :5432 | **:6543** `?pgbouncer=true&connection_limit=1` | — | Runtime |
| `DIRECT_URL` | :5432 | :5432 | — | Migrasi |
| `FRONTEND_URL` | `http://localhost:3000` | URL web | — | CORS/origin |
| `MAX_FILE_SIZE_MB` | `5` | `4` | — | Batas body Vercel ~4.5MB |
| `NEXT_PUBLIC_SUPABASE_URL` | — | — | ✅ | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | — | — | ✅ | |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` | — | *(kosong)* / `/api` | Kosong → axios pakai `/api` relatif. Bila Vercel mewajibkan diisi, set `/api` (hasil identik). **Jangan** isi URL absolut API (memecah cookie `SameSite=Strict`) |
| `API_URL` | *(tak perlu)* | — | URL API | Server-side, untuk `rewrites()`. **Tanpa** `/api` di akhir |

> ⚠️ **Turborepo & env var:** proyek ini monorepo Turbo. Env var yang dipakai saat
> `build` (mis. `API_URL`, `NEXT_PUBLIC_*`) **wajib** didaftarkan di `turbo.json`
> (`tasks.build.env`), jika tidak Turbo tak meneruskannya ke `next build` dan
> `rewrites()` gagal (lihat BUG-007 di `README.md`). Setelah mengubah `API_URL` di
> dashboard, **redeploy web tanpa build cache** agar nilainya ter-*bake*.

---

*Panduan ini melengkapi `README.md` (setup dev) dan `MANUAL.md` (penggunaan aplikasi).*
*© Faga | echofaga · AMTEHI*
