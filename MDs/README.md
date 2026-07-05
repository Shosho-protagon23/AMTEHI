# AMTEHI — Amikom Temu Hilang

Platform lost & found digital khusus lingkungan kampus **Universitas Amikom**.
Mahasiswa, dosen, dan staf dapat melaporkan barang hilang/temuan, mengajukan klaim,
dan memverifikasi kepemilikan secara aman.

> © Faga | echofaga · AMTEHI

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js (App Router), Tailwind CSS, shadcn/ui, Zustand, TanStack Query |
| Backend | Express.js, Prisma, Zod |
| Auth & DB | Supabase (Auth + PostgreSQL + Storage + Realtime) |
| Monorepo | npm workspaces + Turborepo |

## Struktur Monorepo

```
amtehi/
├── apps/
│   ├── web/                # Next.js frontend
│   │   ├── app/            # Routes: (auth), (dashboard), items/{lost,found}, admin/{claims,users,logs}
│   │   ├── components/     # items/, shared/ (Navbar, Footer), admin/ (AdminGuard, ClaimReviewCard, AdminItemActions)
│   │   ├── hooks/          # use-auth, use-items, use-upload, use-create-item, use-admin, use-claims
│   │   └── lib/            # api (axios), supabase, utils
│   └── api/                # Express.js backend
│       ├── src/
│       │   ├── routes/         # auth, items, claims, profile, upload, admin
│       │   ├── controllers/    # request handlers
│       │   ├── services/       # business logic (termasuk admin.service, stats.service)
│       │   ├── middleware/     # auth, validate, rate-limit, upload, error-handler
│       │   └── lib/            # prisma, supabase, storage
│       └── prisma/
│           ├── schema.prisma
│           ├── seed-admin.ts   # seed akun admin (npm run seed:admin)
│           ├── migrations/     # 20260627084320_init, 20260703090000_add_admin_logs
│           └── sql/rls-policies.sql
├── packages/
│   └── shared/             # @amtehi/shared — types, Zod schemas, constants
├── .env.example
├── turbo.json
└── package.json            # npm workspaces root
```

## Status Pengembangan

Sudah terbangun:

- **Backend API** lengkap — auth, items (lost/found), claims, profile, upload, admin
- **Frontend** — halaman login/register, dashboard, halaman profil (edit & hapus
  field opsional), daftar & form lapor barang lost/found, detail item, alur klaim,
  panel admin, komponen item (card, grid, form, image upload, status badge)
- **Panel Admin lengkap** — dashboard statistik, review klaim, kelola user
  (**ubah role** student↔staff), **hapus/moderasi item** dengan alasan, dan
  **audit log** (`admin_logs`) yang mencatat setiap aksi admin
- **Seed akun admin** — `npm run seed:admin` (idempotent) untuk membuat/promote admin
- **Shared package** `@amtehi/shared` — types & Zod schema dipakai bersama web + api
- **Database** — Prisma schema, migration (init + admin_logs), dan RLS policy (`prisma/sql/rls-policies.sql`)

## Endpoint API

Base URL: `http://localhost:3001/api`

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/health` | publik | Health check |
| POST | `/auth/register` | publik | Registrasi *(rate-limited)* |
| POST | `/auth/login` | publik | Login *(rate-limited)* |
| POST | `/auth/refresh` | publik | Refresh token |
| POST | `/auth/logout` | publik | Logout |
| GET | `/items/lost` | publik | List barang hilang (filter & search) |
| GET | `/items/lost/:id` | publik | Detail barang hilang |
| POST | `/items/lost` | auth | Lapor barang hilang |
| PATCH | `/items/lost/:id` | auth, owner | Update laporan |
| DELETE | `/items/lost/:id` | auth, owner | Hapus laporan |
| GET | `/items/found` | publik | List barang temuan |
| GET | `/items/found/:id` | publik | Detail barang temuan |
| POST | `/items/found` | auth | Lapor barang temuan |
| PATCH | `/items/found/:id` | auth, owner | Update laporan |
| DELETE | `/items/found/:id` | auth, owner | Hapus laporan |
| POST | `/claims` | auth | Ajukan klaim |
| GET | `/claims/me` | auth | Daftar klaim sendiri |
| PATCH | `/claims/:id/review` | admin | Approve/reject klaim |
| GET | `/profile/me` | auth | Profil sendiri |
| PATCH | `/profile/me` | auth | Update profil |
| POST | `/upload/item-photo` | auth | Upload foto item (`multipart`, field `photo`) |
| GET | `/admin/stats` | admin | Statistik item |
| GET | `/admin/users` | admin | Daftar semua user |
| PATCH | `/admin/users/:id/role` | admin | Ubah role user (student↔staff) |
| GET | `/admin/claims` | admin | Semua klaim |
| DELETE | `/admin/items/:id` | admin | Hapus/moderasi item (wajib alasan) |
| GET | `/admin/logs` | admin | Audit log aksi admin (filter `?action=`) |

## Persiapan

1. **Install dependencies** (dari root):
   ```bash
   npm install
   ```

2. **Build shared package** — `@amtehi/shared` harus dikompilasi ke `dist`
   sebelum API/web bisa mengimpornya:
   ```bash
   npm run build --workspace=@amtehi/shared
   ```

3. **Konfigurasi environment** — salin `.env.example`:
   - `apps/api/.env` (isi blok `apps/api/.env`)
   - `apps/web/.env.local` (isi blok `apps/web/.env.local`)

   Koneksi Supabase menggunakan **pooler** (bukan direct connection). Untuk dev
   lokal, `DATABASE_URL` dan `DIRECT_URL` sama-sama **Session Pooler port 5432**.
   Untuk produksi serverless, `DATABASE_URL` pakai **Transaction Pooler port 6543** —
   lihat [`STEPS.md`](STEPS.md).

4. **Generate Prisma client & jalankan migrasi**:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

5. **Terapkan RLS policy** di Supabase — jalankan isi
   `apps/api/prisma/sql/rls-policies.sql` lewat SQL editor Supabase.

6. **(Opsional) Buat akun admin** untuk menguji panel `/admin/*`:
   ```bash
   npm run seed:admin --workspace=@amtehi/api
   ```
   Lihat bagian [Membuat akun admin](#membuat-akun-admin) untuk detail & override kredensial.

## Menjalankan

```bash
# Jalankan web + api bersamaan
npm run dev

# Atau satu per satu
npm run dev:api    # http://localhost:3001
npm run dev:web    # http://localhost:3000
```

## Build

```bash
npm run build
```

## Deploy

Backend Express dijalankan sebagai **serverless function** dan di-*hosting* ke
**Vercel** (dua proyek — web + api — tampil di satu domain lewat Next.js rewrites).
Panduan langkah demi langkah (localhost testing **dan** Vercel hosting) ada di
**[`STEPS.md`](STEPS.md)**.

---

## Panduan Pengujian

Setelah `npm run dev` berjalan, buka **http://localhost:3000**. API berjalan di
**http://localhost:3001**. Pastikan langkah **Persiapan** (build shared, env,
migrasi, RLS policy) sudah dilakukan.

### Cek cepat backend hidup

```bash
curl http://localhost:3001/api/health
# → {"success":true,"data":{"status":"ok","service":"amtehi-api"}}
```

### Skenario uji per fitur

| # | Alur | Langkah | Hasil yang diharapkan |
|---|---|---|---|
| 1 | **Registrasi** | `/register` → isi nama, email, password (min 8 karakter) | Otomatis login, diarahkan ke `/dashboard` |
| 2 | **Login / Logout** | `/login` → masuk; klik **Keluar** di navbar | Sesi aktif/berakhir; navbar berubah |
| 3 | **Edit profil** | `/profile` → ubah nama/NIM/fakultas/telepon → **Simpan** | Muncul notif "Profil berhasil diperbarui" |
| 4 | **Hapus field profil** | `/profile` → klik **hapus** di samping NIM/fakultas/telepon (atau kosongkan input) → **Simpan** | Field menjadi kosong setelah reload |
| 5 | **Lapor barang hilang** | `/items/lost/new` → isi form + unggah foto → submit | Item muncul di `/items/lost` berstatus `open` |
| 6 | **Lapor barang temuan** | `/items/found/new` → isi form + foto → submit | Item muncul di `/items/found` |
| 7 | **Cari & filter** | `/items/lost` → ketik kata kunci, pilih kategori/status | Daftar item ter-filter |
| 8 | **Ajukan klaim** | Buka detail item → **Ajukan Klaim** → isi bukti → submit | Klaim muncul di `/claims` berstatus `pending` |
| 9 | **Review klaim (admin)** | `/admin/claims` → **Approve**/**Reject** | Status klaim & item berubah; tercatat di audit log |
| 10 | **Statistik admin** | `/admin` | Ringkasan jumlah item open/claimed/closed |
| 11 | **Ubah role user (admin)** | `/admin/users` → dropdown **Ubah Role** (student↔staff) | Role tersimpan; baris admin & diri sendiri terkunci |
| 12 | **Hapus item (admin)** | Detail item → **Hapus Laporan Ini** → isi alasan → konfirmasi | Item terhapus, diarahkan ke list; tercatat di audit log |
| 13 | **Audit log (admin)** | `/admin/logs` → filter per jenis aksi | Daftar aksi admin (review/hapus/ubah role) terbaru dulu |

### Membuat akun admin

Registrasi default berperan `student`. Role `admin` tidak bisa di-set lewat panel
(anti eskalasi hak akses) — hanya via seed script atau SQL langsung. Ada dua cara:

**Cara A — Seed script (disarankan, idempotent):**

```bash
npm run seed:admin --workspace=@amtehi/api
# atau dari apps/api: npm run seed:admin
```

Membuat akun admin default `admin@amikom.ac.id` / `REDACTED`. Aman
dijalankan berulang (jika sudah ada, hanya di-promote). Override kredensial:

```bash
ADMIN_EMAIL=admin@amikom.ac.id ADMIN_PASSWORD=REDACTED npm run seed:admin
```

**Cara B — Promote akun yang sudah ada via SQL Editor Supabase:**

```sql
-- ganti dengan email akun yang sudah didaftarkan
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'akunmu@students.amikom.ac.id');
```

Logout lalu login ulang agar role baru terbaca. Menu **Admin** akan muncul di navbar.

### Validasi yang diuji otomatis oleh form/backend

- Password minimal 8 karakter; email harus format valid.
- NIM 5–20 karakter; nomor telepon hanya angka/`+`/`-`/spasi (8–20 karakter).
- File foto: maksimal 5 MB, format JPG/PNG/WEBP (divalidasi di server).
- Field opsional yang dikosongkan akan dihapus (`null`), bukan ditolak.

---

## Catatan Keamanan

- `SUPABASE_SERVICE_ROLE_KEY` **hanya** di backend (`apps/api`), tidak pernah di frontend.
- JWT disimpan di httpOnly cookie, bukan localStorage.
- RLS wajib aktif di semua tabel Supabase (termasuk `admin_logs` — baca admin-only).
- Semua input divalidasi dengan Zod di backend.
- Rate limiting aktif (global + lebih ketat pada endpoint auth).
- Aksi admin (review klaim, hapus item, ubah role) dicatat ke audit trail `admin_logs`.
- Role `admin` tidak dapat di-set/diubah lewat panel — hanya via seed/DB (anti eskalasi hak akses).

Lihat `CLAUDE.md` untuk panduan arsitektur & konvensi lengkap.

---

## Bug Log

Catatan bug yang ditemukan & status penanganannya. Format ID: `BUG-NNN`.

### BUG-001 — Upload foto kena 404 (endpoint salah)

| Atribut | Detail |
|---|---|
| **Tanggal ditemukan** | 2026-06-29 |
| **Status** | ✅ Fixed (2026-06-29) |
| **Severity** | High — fitur upload foto tidak berfungsi sama sekali |
| **Letak** | `apps/web/hooks/use-upload.ts:23` |
| **Komponen terdampak** | `ItemForm` (lapor barang) & `ClaimForm` (ajukan klaim) — keduanya pakai `useUploadPhoto` |
| **Masalah** | Hook mengirim `POST /upload`, sedangkan route backend yang terdaftar adalah `POST /upload/item-photo` (`apps/api/src/routes/upload.routes.ts:11`). Akibatnya setiap upload foto mendapat respons 404 dan pembuatan item/klaim dengan foto gagal. |
| **Solusi** | Ubah path request di hook dari `/upload` menjadi `/upload/item-photo`. |
| **Verifikasi** | Controller `uploadPhoto` mengembalikan `{ url }` via `sendSuccess(res, { url }, 201)`, sesuai yang dibaca frontend (`res.data.data.url`). Type-check `apps/web` lolos. |
| **Catatan** | Bug pre-existing — sudah ada sebelum pengerjaan alur detail item & klaim, ditemukan saat menelusuri kode untuk fitur klaim. |

### BUG-002 — UI tampil polos tanpa styling (CSS 404)

| Atribut | Detail |
|---|---|
| **Tanggal ditemukan** | 2026-06-29 |
| **Status** | ✅ Fixed (2026-06-29) |
| **Severity** | Medium — aplikasi tetap berfungsi, tapi seluruh tema/desain (Tailwind) tidak muncul; halaman tampil seperti HTML polos |
| **Letak** | Lingkungan dev (proses & cache), bukan kode. Konfigurasi `tailwind.config.ts`, `postcss.config.mjs`, dan `globals.css` semuanya benar. |
| **Komponen terdampak** | Semua halaman frontend (`apps/web`) |
| **Masalah** | Penumpukan **proses Node zombie** dari sesi `npm run dev` sebelumnya yang tidak dimatikan dengan benar (ditemukan 10 proses node berjalan; PID yang memegang port 3000 melayani build lama yang rusak). Akibatnya request `/_next/static/css/app/layout.css` mendapat respons **404** (hanya 9 byte "Not Found"), sehingga halaman dirender tanpa CSS. Diperparah cache `.next` yang korup. |
| **Solusi** | (1) Hentikan proses yang memegang port 3000/3001; (2) hapus cache build `apps/web/.next`; (3) jalankan ulang `npm run dev`. |
| **Verifikasi** | Setelah restart bersih, `GET /_next/static/css/app/layout.css` → **HTTP 200, 31 KB**, berisi preflight Tailwind + class tema (`card-surface`, `btn-primary`, var `--color-primary`). |
| **Pencegahan** | Selalu hentikan dev server dengan **`Ctrl + C`** di terminalnya — jangan sekadar menutup jendela terminal. Bila UI kembali polos: hapus `.next` lalu `npm run dev`, kemudian hard-refresh browser (`Ctrl + Shift + R`). |

### BUG-003 — `prisma generate` gagal `EPERM` saat dev server berjalan

| Atribut | Detail |
|---|---|
| **Tanggal ditemukan** | 2026-07-03 |
| **Status** | ✅ Resolved (2026-07-03) — isu lingkungan dev (Windows), bukan bug kode |
| **Severity** | Low — hanya menghambat regenerasi Prisma client, tidak memengaruhi runtime |
| **Letak** | Windows file lock pada `node_modules/.prisma/client/query_engine-windows.dll.node` |
| **Komponen terdampak** | `npm run prisma:generate` / `npx prisma generate` |
| **Masalah** | Saat menambah model `AdminLog`, `prisma generate` gagal dengan `EPERM: operation not permitted, rename ...query_engine-windows.dll.node`. Penyebab: dev server API (`tsx watch`) masih berjalan dan mengunci DLL query engine Prisma, sehingga Prisma tidak bisa menimpanya. Di Windows file yang sedang dipakai proses tidak bisa di-rename/hapus. |
| **Solusi** | Hentikan proses dev server (turbo `dev` → `tsx watch` API, Next.js, `tsc --watch`) lebih dulu, lalu jalankan `npx prisma generate`, kemudian `npm run dev` lagi. |
| **Verifikasi** | Setelah dev server dihentikan: `prisma generate` sukses (`Generated Prisma Client v6.19.3`), `migrate deploy` menerapkan `20260703090000_add_admin_logs`, dan `tsc --noEmit` di `apps/api` & `apps/web` lolos (exit 0). |
| **Pencegahan** | Selalu **stop dev server sebelum** mengubah `schema.prisma` + `prisma generate`. Alur aman untuk perubahan skema: stop dev → edit schema → `prisma migrate dev` (yang otomatis generate) → `npm run dev`. |

### BUG-004 — Build API Vercel gagal `TS2688: Cannot find type definition file for 'node'`

| Atribut | Detail |
|---|---|
| **Tanggal ditemukan** | 2026-07-05 |
| **Status** | ✅ Fixed (2026-07-05) |
| **Severity** | High — deploy API gagal total di tahap `tsc` build |
| **Letak** | `apps/api/vercel.json` (`installCommand`) |
| **Masalah** | `NODE_ENV=production` (wajib di API untuk flag cookie `Secure`) juga aktif saat `npm install` di build, sehingga npm **membuang semua devDependencies** — termasuk `@types/node`. `tsconfig.json` api punya `"types": ["node"]`, jadi `tsc` gagal karena type `node` tak ada. Build lokal (Windows) lolos karena devDeps ada, menyamarkan masalah. |
| **Solusi** | Ubah `installCommand` menjadi `npm install --include=dev` agar devDeps tetap terpasang meski `NODE_ENV=production`. |
| **Verifikasi** | Dry-run `NODE_ENV=production npm install --include=dev` tidak lagi membuang `@types/node`; deploy Vercel berikutnya lolos tahap build api. |
| **Catatan** | Web (`apps/web`) rawan masalah serupa — **jangan** set `NODE_ENV=production` manual di proyek Web; Next.js sudah mengaturnya, dan set manual akan memangkas `@types/react`/`typescript`. |

### BUG-005 — Deploy API gagal `No Output Directory named "public" found`

| Atribut | Detail |
|---|---|
| **Tanggal ditemukan** | 2026-07-05 |
| **Status** | ✅ Fixed (2026-07-05) |
| **Severity** | High — deploy API gagal setelah build sukses |
| **Letak** | `apps/api/` (struktur output) |
| **Masalah** | `vercel.json` dengan `buildCommand` custom + `framework: null` membuat Vercel memperlakukan proyek sebagai *static build* dan mencari `outputDirectory` bernama `public` setelah build. Proyek API ini serverless-only (fungsi di `api/index.ts`, tanpa aset statis), jadi folder itu tak ada. |
| **Solusi** | Sediakan folder `apps/api/public/` kosong (via `.gitkeep`) agar cek output Vercel terpenuhi; fungsi di `api/` tetap ter-deploy normal. |
| **Verifikasi** | Deploy berikutnya lolos tahap output; fungsi serverless hidup & menerima request. |

### BUG-006 — `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` (express-rate-limit) di Vercel

| Atribut | Detail |
|---|---|
| **Tanggal ditemukan** | 2026-07-05 |
| **Status** | ✅ Fixed (2026-07-05) |
| **Severity** | Medium — error runtime di setiap request; rate-limit tak bisa identifikasi IP |
| **Letak** | `apps/api/src/app.ts` |
| **Masalah** | Vercel meneruskan request lewat proxy, sehingga header `X-Forwarded-For` selalu ada. Express default `trust proxy = false`, membuat `express-rate-limit` melempar `ValidationError` karena tak bisa menebak IP klien dengan akurat. |
| **Solusi** | `app.set('trust proxy', 1)` — percaya satu hop proxy Vercel. Nilai `1` lebih aman daripada `true` yang mempercayai seluruh rantai proxy (juga memicu peringatan library). |
| **Verifikasi** | `/api/health` via API langsung balas `200` JSON; error validation hilang dari Logs. |

### BUG-007 — Halaman barang "gagal memuat data" — proxy `/api` kena 404 di produksi

| Atribut | Detail |
|---|---|
| **Tanggal ditemukan** | 2026-07-05 |
| **Status** | ✅ Fixed (2026-07-05) |
| **Severity** | High — semua data (lost/found) gagal tampil di web produksi |
| **Letak** | `turbo.json` (task `build` → `env`) |
| **Masalah** | `rewrites()` di `next.config.mjs` mem-proxy `/api/*` ke backend hanya bila `process.env.API_URL` ada, dan dievaluasi **saat build**. `API_URL` sudah di-set di dashboard Vercel, tetapi **Turborepo memfilter env var** — hanya yang dideklarasikan di `turbo.json` yang diteruskan ke proses build. `API_URL` tak terdaftar → `undefined` saat `next build` → `rewrites()` kosong → `/api/*` jatuh ke 404 Next.js (`X-Matched-Path: /404`). Log build memberi peringatan eksplisit: *"variables set on your Vercel project, but missing from turbo.json"*. |
| **Solusi** | Tambahkan `"env": ["API_URL","NEXT_PUBLIC_API_URL","NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY"]` pada task `build` di `turbo.json`. |
| **Verifikasi** | Setelah redeploy, `/api/health` via **domain web** balas `200` JSON (bukan HTML), halaman barang memuat data normal. |
| **Catatan** | `rewrites()` di-*bake* saat build — bila mengubah `API_URL` di dashboard, **redeploy** web (idealnya tanpa build cache) agar nilai baru ter-*bake*. |

### CATATAN-KEAMANAN — Rotasi kredensial admin yang bocor

| Atribut | Detail |
|---|---|
| **Tanggal** | 2026-07-05 |
| **Status** | ✅ Ditangani (2026-07-05) |
| **Masalah** | Password admin demo terekspos di MDs (`README`, `DETAILS`, `MANUAL`) dan di-hardcode sebagai fallback di `seed-admin.ts`. Karena repo publik, password lama harus dianggap bocor (jejak tetap ada di riwayat Git). |
| **Solusi** | (1) Redaksi semua referensi password → `REDACTED`; (2) `seed-admin.ts` kini mewajibkan `ADMIN_PASSWORD` via env (tanpa default) **dan** melakukan `updateUserById` untuk set ulang password user existing; (3) password admin **produksi dirotasi** ke nilai acak kuat lewat `seed:admin`. |
| **Pencegahan** | Jangan pernah menaruh password asli di kode/dokumen yang masuk Git. Kredensial demo selalu lewat env var. |
