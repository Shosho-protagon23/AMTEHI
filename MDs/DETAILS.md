# DETAILS.md — Dokumentasi Detail Proyek AMTEHI

> **Materi lengkap untuk penyusunan Laporan Akhir.**
> Dokumen ini merangkum spesifikasi teknis, arsitektur, database, fitur, dan
> keamanan proyek AMTEHI secara detail. Seluruh isi diambil langsung dari kode
> sumber proyek (bukan sekadar rencana), sehingga akurat untuk dijadikan bahan
> laporan.
>
> © Faga | echofaga · AMTEHI · *Dokumen dibuat 2026-07-04*

---

## Daftar Isi

1. [Identitas & Gambaran Umum Proyek](#1-identitas--gambaran-umum-proyek)
2. [Latar Belakang & Rumusan Masalah](#2-latar-belakang--rumusan-masalah)
3. [Tujuan & Manfaat](#3-tujuan--manfaat)
4. [Tech Stack Lengkap (beserta versi)](#4-tech-stack-lengkap-beserta-versi)
5. [Arsitektur Sistem](#5-arsitektur-sistem)
6. [Struktur Direktori Proyek](#6-struktur-direktori-proyek)
7. [Perancangan Database](#7-perancangan-database)
8. [Spesifikasi Fitur (Fungsional)](#8-spesifikasi-fitur-fungsional)
9. [Spesifikasi REST API (Endpoint)](#9-spesifikasi-rest-api-endpoint)
10. [Aturan Validasi Data](#10-aturan-validasi-data)
11. [Keamanan Sistem](#11-keamanan-sistem)
12. [Alur Kerja Utama (Flow)](#12-alur-kerja-utama-flow)
13. [Desain Antarmuka & Branding](#13-desain-antarmuka--branding)
14. [Cara Instalasi & Menjalankan](#14-cara-instalasi--menjalankan)
15. [Hasil Pengujian](#15-hasil-pengujian)
16. [Kebutuhan Non-Fungsional](#16-kebutuhan-non-fungsional)
17. [Batasan Sistem & Pengembangan Lanjutan](#17-batasan-sistem--pengembangan-lanjutan)

---

## 1. Identitas & Gambaran Umum Proyek

| Atribut | Detail |
|---|---|
| **Nama Aplikasi** | AMTEHI — *Amikom Temu Hilang* |
| **Kategori** | Web Application (Platform *Lost & Found* Digital) |
| **Studi Kasus** | Pengelolaan barang hilang & temuan di lingkungan kampus |
| **Target Pengguna** | Mahasiswa, dosen, dan staf Universitas Amikom |
| **Tipe** | Solo project — tugas kuliah sekaligus portofolio |
| **Developer** | Faga (`echofaga`) — GitHub: `Shosho-protagon23` |
| **Arsitektur** | Monorepo (frontend + backend + shared package) |
| **Versi** | 0.1.0 |

**Deskripsi singkat:** AMTEHI adalah platform digital yang mempertemukan warga
kampus yang **kehilangan** barang dengan yang **menemukan** barang. Pengguna
dapat membuat laporan, mencari barang, dan mengajukan **klaim** kepemilikan yang
diverifikasi oleh **admin kampus**, sehingga barang dapat kembali ke pemilik yang
sah secara aman dan transparan.

---

## 2. Latar Belakang & Rumusan Masalah

### Latar Belakang
Di lingkungan kampus yang padat aktivitas, kehilangan barang (dompet, KTM,
flashdisk, kunci, HP, dsb.) adalah kejadian yang sangat umum. Namun proses
"temu-hilang" saat ini masih dilakukan secara manual dan tidak terpusat.

### Identifikasi Masalah
1. **Informasi tersebar & mudah hilang** — pengumuman kehilangan hanya lewat
   grup WhatsApp/media sosial, cepat tenggelam oleh pesan lain.
2. **Tidak ada titik penyerahan yang jelas** — penemu barang bingung harus
   menyerahkan ke mana.
3. **Rawan salah pemilik** — tanpa proses verifikasi, barang bisa diambil orang
   yang bukan pemiliknya.
4. **Tidak ada riwayat/rekam jejak** — sulit menelusuri status suatu laporan.

### Rumusan Masalah
- Bagaimana menyediakan satu platform terpusat untuk melaporkan barang hilang
  dan temuan di kampus?
- Bagaimana memastikan barang temuan sampai ke pemilik yang benar melalui
  mekanisme verifikasi?
- Bagaimana menjaga keamanan data dan transparansi setiap tindakan di sistem?

---

## 3. Tujuan & Manfaat

### Tujuan
1. Menyediakan **satu platform terpusat** untuk laporan barang hilang & temuan.
2. Mempermudah **pemilik dan penemu** barang untuk saling terhubung.
3. Menyediakan **sistem klaim dengan verifikasi admin** agar barang sampai ke
   pemilik yang sah.
4. Menjaga **transparansi & akuntabilitas** melalui pencatatan aktivitas
   (*audit trail*).

### Manfaat
- **Bagi mahasiswa/staf:** peluang barang kembali lebih besar, proses lebih cepat.
- **Bagi kampus:** pengelolaan lost & found lebih rapi dan terdokumentasi.
- **Bagi admin:** kontrol penuh atas verifikasi klaim dan moderasi konten.

---

## 4. Tech Stack Lengkap (beserta versi)

Bahasa utama proyek: **TypeScript** (baik frontend maupun backend).

### Frontend (`apps/web`)
| Teknologi | Versi | Fungsi |
|---|---|---|
| Next.js | ^15.5.19 | Framework React (App Router) |
| React / React DOM | ^19.0.0 | Library UI |
| Tailwind CSS | ^3.4.17 | Styling utility-first |
| TanStack React Query | ^5.62.7 | Manajemen *server state* (fetch/cache data API) |
| Zustand | ^5.0.2 | Manajemen *global state* (mis. sesi user) |
| Axios | ^1.7.9 | HTTP client ke backend API |
| @supabase/supabase-js | ^2.47.10 | Klien Supabase (browser) |
| clsx + tailwind-merge | ^2.1.1 / ^2.6.0 | Utility penggabungan className |

### Backend (`apps/api`)
| Teknologi | Versi | Fungsi |
|---|---|---|
| Node.js | ≥ 20 | Runtime JavaScript |
| Express.js | ^4.21.2 | Framework REST API |
| Prisma / @prisma/client | ^6.1.0 (aktual 6.19.3) | ORM ke PostgreSQL |
| Zod | ^3.24.1 | Validasi & skema data |
| @supabase/supabase-js | ^2.47.10 | Auth, Storage (service role) |
| Multer | ^2.0.1 | Middleware upload file (multipart) |
| Helmet | ^8.0.0 | Security HTTP headers |
| express-rate-limit | ^7.5.0 | Pembatasan laju permintaan |
| CORS | ^2.8.5 | Kontrol akses lintas origin |
| cookie-parser | ^1.4.7 | Parsing httpOnly cookie |
| dotenv | ^16.4.7 | Memuat environment variables |
| tsx | ^4.19.2 | Menjalankan TypeScript saat dev |

### Database, Infrastruktur & Tooling
| Komponen | Teknologi |
|---|---|
| Database | PostgreSQL (via **Supabase**) |
| Autentikasi | Supabase Auth (berbasis JWT) |
| Penyimpanan file | Supabase Storage — bucket `item-photos` (public) |
| Monorepo | npm workspaces + **Turborepo** ^2.3.3 |
| Package Manager | npm 11.17.0 |
| Bahasa | TypeScript ^5.7.2 |
| Shared package | `@amtehi/shared` — tipe & skema Zod bersama |

---

## 5. Arsitektur Sistem

### Pola Umum
AMTEHI memakai arsitektur **client–server terpisah** dalam satu **monorepo**:

```
┌──────────────┐   HTTP/JSON    ┌──────────────┐   Prisma ORM   ┌──────────────┐
│  Frontend    │ ─────────────► │  Backend     │ ─────────────► │  PostgreSQL  │
│  Next.js     │  (Axios +      │  Express API │                │  (Supabase)  │
│  (apps/web)  │   cookie JWT)  │  (apps/api)  │ ◄───────────── │              │
└──────────────┘ ◄───────────── └──────────────┘   query result └──────────────┘
        │                              │
        │                              ├──► Supabase Auth   (login, token)
        │                              └──► Supabase Storage (foto barang)
        │
        └── @amtehi/shared (tipe TypeScript & skema Zod dipakai kedua sisi)
```

### Pola Lapisan Backend (Layered Architecture)
Backend menerapkan pemisahan tanggung jawab yang tegas:

```
Route  →  Controller  →  Service  →  Database (Prisma)
```

- **Route** — mendefinisikan endpoint & menempelkan middleware (auth, validasi).
- **Controller** — menangani `req`/`res`, memvalidasi input dengan Zod, memanggil
  service, dan memformat respons. *Tidak* memuat logika bisnis.
- **Service** — logika bisnis murni (tidak mengetahui `req`/`res`).
- **Prisma** — akses database yang aman & *type-safe*.

Contoh service yang ada: `auth.service`, `item.service`, `claim.service`,
`profile.service`, `admin.service`, `stats.service`.

### Middleware Backend
| Middleware | Fungsi |
|---|---|
| `helmet` | Menambahkan security headers |
| `cors` | Membatasi origin ke `FRONTEND_URL`, mendukung cookie |
| `globalLimiter` | Rate limit global 100 req / 15 menit |
| `authLimiter` | Rate limit ketat auth 10 req / 15 menit |
| `requireAuth` | Wajib login — validasi token via Supabase `getUser()` |
| `requireAdmin` | Wajib role admin |
| `validate` | Validasi body/query dengan skema Zod |
| `upload` (Multer) | Terima file foto (memory storage) |
| `errorHandler` | Penanganan error terstandardisasi |

---

## 6. Struktur Direktori Proyek

```
amtehi/
├── apps/
│   ├── web/                          # Frontend Next.js
│   │   ├── app/                      # Routing App Router
│   │   │   ├── (auth)/               # login, register
│   │   │   ├── (dashboard)/          # dashboard, profile, claims
│   │   │   ├── admin/                # panel admin: page, claims, users, logs
│   │   │   ├── items/
│   │   │   │   ├── lost/             # list, new, [id], [id]/claim
│   │   │   │   └── found/            # list, new, [id], [id]/claim
│   │   │   ├── layout.tsx            # layout global + Navbar/Footer
│   │   │   ├── page.tsx              # beranda
│   │   │   ├── providers.tsx         # React Query provider
│   │   │   └── globals.css           # tema & variabel warna
│   │   ├── components/
│   │   │   ├── items/                # ItemCard, ItemForm, ItemGrid, ItemDetail,
│   │   │   │                         #   ImageUpload, StatusBadge, NewItemPage
│   │   │   ├── claims/               # ClaimForm, ClaimPage
│   │   │   ├── admin/                # AdminGuard, ClaimReviewCard, AdminItemActions
│   │   │   └── shared/               # Navbar, Footer
│   │   ├── hooks/                    # use-auth, use-items, use-create-item,
│   │   │                             #   use-upload, use-claims, use-admin
│   │   └── lib/                      # api (axios), supabase, utils
│   │
│   └── api/                          # Backend Express.js
│       ├── src/
│       │   ├── routes/               # auth, item, claim, profile, upload, admin, index
│       │   ├── controllers/          # 6 controller (satu per domain)
│       │   ├── services/             # auth, item, claim, profile, admin, stats, mappers
│       │   ├── middleware/           # auth, validate, rate-limit, upload,
│       │   │                         #   error-handler, async-handler
│       │   ├── lib/                  # prisma, supabase, storage
│       │   ├── config/               # env (validasi environment via Zod)
│       │   ├── utils/                # app-error, response
│       │   ├── app.ts                # konfigurasi Express
│       │   └── index.ts              # entry point
│       └── prisma/
│           ├── schema.prisma         # definisi model database
│           ├── seed-admin.ts         # seed akun admin (idempotent)
│           ├── migrations/           # init + add_admin_logs
│           └── sql/rls-policies.sql  # kebijakan Row Level Security
│
├── packages/
│   └── shared/                       # @amtehi/shared
│       └── src/                      # types.ts, schemas.ts, constants.ts, index.ts
│
├── .env.example
├── turbo.json                        # konfigurasi Turborepo
├── package.json                      # root (npm workspaces)
├── README.md                         # panduan teknis & bug log
├── MANUAL.md                         # panduan penggunaan
└── DETAILS.md                        # ← dokumen ini
```

---

## 7. Perancangan Database

**DBMS:** PostgreSQL (Supabase). **Konvensi:** nama tabel `snake_case` jamak,
kolom `snake_case`, primary key UUID, selalu ada `created_at`/`updated_at`.

### Enum (Tipe Enumerasi)
| Enum | Nilai |
|---|---|
| `UserRole` | `student`, `staff`, `admin` |
| `ItemStatus` | `open`, `claimed`, `closed` |
| `ItemType` | `lost`, `found` |
| `ClaimStatus` | `pending`, `approved`, `rejected` |

### Tabel `profiles`
Data pengguna, terhubung ke `auth.users` milik Supabase Auth.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | Referensi ke `auth.users(id)` |
| full_name | TEXT | Nama lengkap (wajib) |
| nim | TEXT (unik, opsional) | Nomor Induk Mahasiswa |
| faculty | TEXT (opsional) | Fakultas |
| phone | TEXT (opsional) | Nomor telepon |
| avatar_url | TEXT (opsional) | Foto profil |
| role | UserRole | Default `student` |
| created_at / updated_at | TIMESTAMPTZ | Waktu buat/ubah |

### Tabel `lost_items` (Barang Hilang)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| user_id | UUID (FK → profiles) | Pelapor (*cascade* saat user dihapus) |
| title | TEXT | Judul (wajib) |
| description | TEXT (opsional) | Deskripsi/ciri barang |
| category | TEXT | Kategori |
| last_seen_at | TIMESTAMPTZ (opsional) | Terakhir terlihat (waktu) |
| last_seen_loc | TEXT (opsional) | Terakhir terlihat (lokasi) |
| photo_url | TEXT (opsional) | URL foto |
| status | ItemStatus | Default `open` |
| created_at / updated_at | TIMESTAMPTZ | |

Index: `status`, `category`, `created_at`.

### Tabel `found_items` (Barang Temuan)
Mirip `lost_items`, dengan perbedaan kolom lokasi/waktu:

| Kolom khusus | Tipe | Keterangan |
|---|---|---|
| found_at | TIMESTAMPTZ (opsional) | Waktu ditemukan |
| found_loc | TEXT (opsional) | Lokasi ditemukan |
| storage_loc | TEXT (opsional) | Lokasi penyimpanan barang saat ini |

Index: `status`, `category`, `created_at`.

### Tabel `claim_requests` (Klaim)
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| claimant_id | UUID (FK → profiles) | Pengklaim (*cascade*) |
| item_id | UUID | ID barang yang diklaim |
| item_type | ItemType | `lost` atau `found` |
| proof_text | TEXT (opsional*) | Deskripsi bukti kepemilikan |
| proof_photo_url | TEXT (opsional) | Foto bukti |
| status | ClaimStatus | Default `pending` |
| admin_note | TEXT (opsional) | Catatan admin saat review |
| reviewed_by | UUID (FK → profiles, opsional) | Admin peninjau (*set null*) |
| reviewed_at | TIMESTAMPTZ (opsional) | Waktu ditinjau |
| created_at / updated_at | TIMESTAMPTZ | |

Index: `status`, `item_id`.
*Catatan: pada input klaim, `proof_text` divalidasi wajib min. 10 karakter.

### Tabel `admin_logs` (Audit Trail)
Mencatat setiap aksi admin agar dapat ditelusuri.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| admin_id | UUID (FK → profiles) | Admin pelaku |
| action | TEXT | `review_claim`, `delete_item`, `update_role` |
| target_type | TEXT (opsional) | Jenis objek target |
| target_id | UUID (opsional) | ID objek target |
| detail | TEXT (opsional) | Keterangan tambahan |
| created_at | TIMESTAMPTZ | Waktu aksi |

Index: `admin_id`, `action`, `created_at`.

### Relasi Antar Tabel (ERD Ringkas)
```
profiles 1───N lost_items          (owner)
profiles 1───N found_items         (owner)
profiles 1───N claim_requests      (claimant)
profiles 1───N claim_requests      (reviewer, opsional)
profiles 1───N admin_logs          (admin)
```

### Migration yang Ada
1. `20260627084320_init` — skema awal (profiles, lost/found items, claims).
2. `20260703090000_add_admin_logs` — penambahan tabel audit `admin_logs`.

---

## 8. Spesifikasi Fitur (Fungsional)

### A. Fitur Pengguna (student/staff)
| Kode | Fitur | Deskripsi |
|---|---|---|
| F-01 | Registrasi | Daftar akun baru (otomatis login, role default `student`) |
| F-02 | Login / Logout | Masuk & keluar sistem |
| F-03 | Kelola Profil | Ubah nama/NIM/fakultas/telepon; field opsional bisa dikosongkan |
| F-04 | Lapor Barang Hilang | Buat laporan + upload foto |
| F-05 | Lapor Barang Temuan | Buat laporan + lokasi penyimpanan + foto |
| F-06 | Cari & Filter | Cari judul/deskripsi, filter kategori & status |
| F-07 | Lihat Detail Barang | Halaman detail lengkap (publik) |
| F-08 | Ajukan Klaim | Klaim barang + bukti kepemilikan + foto opsional |
| F-09 | Pantau Status Klaim | Lihat status klaim sendiri (pending/approved/rejected) |
| F-10 | Upload Foto | Unggah foto barang/bukti (JPG/PNG/WEBP, maks 5 MB) |

**Aturan bisnis klaim:**
- Tidak bisa mengklaim barang laporan sendiri.
- Tidak bisa klaim ganda pada barang yang sama (jika sudah ada pending/approved).
- Tombol klaim hanya muncul untuk barang berstatus `open`.

### B. Fitur Admin
| Kode | Fitur | Deskripsi |
|---|---|---|
| A-01 | Dashboard Statistik | Ringkasan item open/claimed/closed, total user, klaim pending |
| A-02 | Review Klaim | Approve/reject klaim + catatan; approve → item jadi `claimed` |
| A-03 | Kelola User & Role | Ubah role `student` ↔ `staff` (bukan admin) |
| A-04 | Moderasi / Hapus Item | Hapus laporan melanggar (wajib alasan min. 5 karakter) |
| A-05 | Audit Log | Lihat riwayat aksi admin, filter per jenis aksi |

**Kategori barang** (7): Elektronik, Dokumen, Pakaian, Dompet, Kunci,
Buku & Alat Tulis, Lainnya.

---

## 9. Spesifikasi REST API (Endpoint)

**Base URL:** `http://localhost:3001/api`
**Format respons sukses:** `{ "success": true, "data": {...}, "meta": {...} }`
**Format respons error:** `{ "success": false, "error": { "code", "message" } }`

| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| GET | `/health` | publik | Health check |
| POST | `/auth/register` | publik | Registrasi *(rate-limited)* |
| POST | `/auth/login` | publik | Login *(rate-limited)* |
| POST | `/auth/refresh` | publik | Refresh token (rotation) |
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
| POST | `/upload/item-photo` | auth | Upload foto (multipart, field `photo`) |
| GET | `/admin/stats` | admin | Statistik item |
| GET | `/admin/users` | admin | Daftar semua user |
| PATCH | `/admin/users/:id/role` | admin | Ubah role user (student↔staff) |
| GET | `/admin/claims` | admin | Semua klaim |
| DELETE | `/admin/items/:id` | admin | Hapus/moderasi item (wajib alasan) |
| GET | `/admin/logs` | admin | Audit log (filter `?action=`) |

---

## 10. Aturan Validasi Data

Semua input divalidasi dengan **Zod** di backend (dan dipakai ulang di frontend
lewat `@amtehi/shared`). Ringkasan aturan:

### Autentikasi
- **Email** — format email valid.
- **Password** — minimal **8 karakter** (registrasi).
- **Nama lengkap** — minimal 3 karakter.

### Profil (opsional, boleh dikosongkan → `null`)
- **NIM** — 5–20 karakter.
- **Fakultas** — maksimal 100 karakter.
- **Telepon** — pola `[0-9 + - spasi]`, 8–20 karakter.
- **Avatar URL** — harus URL valid.

### Barang (Lost/Found)
- **Judul** — 3–120 karakter.
- **Deskripsi** — maksimal 2000 karakter.
- **Kategori** — salah satu dari 7 kategori terdaftar.
- **Lokasi** (last_seen/found/storage) — maksimal 200 karakter.
- **photoUrl** — URL valid (dihasilkan setelah upload).

### Klaim
- **proofText** — **minimal 10 karakter**, maksimal 2000.
- **status review** — hanya `approved` atau `rejected`.

### Upload File
- Ukuran maksimal **5 MB** (`MAX_FILE_SIZE_BYTES`).
- Format diizinkan: **JPG, PNG, WEBP** (divalidasi via MIME di server).

### Admin
- **Ubah role** — hanya `student`/`staff` (admin diblokir demi keamanan).
- **Hapus item** — alasan wajib, 5–500 karakter.

### Pagination
- `page` default 1; `pageSize` default 12, maksimal 50.

---

## 11. Keamanan Sistem

Keamanan adalah prioritas utama proyek ini. Mekanisme yang diterapkan:

### Autentikasi & Otorisasi
- **JWT via Supabase Auth.** Token akses disimpan di **httpOnly cookie**
  (`sb-access-token`), bukan `localStorage`, untuk mencegah pencurian token
  lewat XSS.
- **Validasi token di server** memakai `supabaseAdmin.auth.getUser(token)` —
  bukan *decode* manual — sehingga token benar-benar diverifikasi ke Supabase.
- **Sumber otoritatif role** ada di tabel `profiles` (dibaca ulang server-side),
  bukan dari klaim token yang bisa dimanipulasi klien.
- **Refresh token rotation** melalui endpoint `/auth/refresh`.
- **Role check di server** lewat middleware `requireAdmin`.

### Anti Eskalasi Hak Akses
- Role `admin` **tidak dapat** diperoleh via registrasi maupun panel. Endpoint
  ubah-role hanya menerima `student`/`staff`. Promosi admin hanya lewat **seed
  script** atau SQL langsung.
- Admin tidak dapat mengubah role akunnya sendiri (baris terkunci di UI).

### Perlindungan Data
- **Row Level Security (RLS)** aktif di semua tabel Supabase
  (`prisma/sql/rls-policies.sql`), termasuk `admin_logs` (baca admin-only).
- **Service role key** Supabase hanya ada di backend (`apps/api`), tidak pernah
  di frontend.
- **Prisma ORM** menggunakan *parameterized query* — mencegah SQL injection.

### Perlindungan API
- **Helmet** untuk security HTTP headers.
- **CORS** dibatasi hanya ke origin `FRONTEND_URL`, dengan `credentials: true`.
- **Rate limiting:** global **100 req/15 menit**, endpoint auth lebih ketat
  **10 req/15 menit**.
- **Batas body** request 1 MB; batas file upload 5 MB.

### Audit & Akuntabilitas
- Semua aksi admin (`review_claim`, `delete_item`, `update_role`) dicatat ke
  tabel `admin_logs` beserta pelaku, target, dan waktu.

---

## 12. Alur Kerja Utama (Flow)

### Alur Registrasi & Login
```
User isi form → POST /auth/register → Supabase createUser →
buat row profiles → auto login → token disimpan di httpOnly cookie → Dashboard
```

### Alur Lapor Barang + Foto
```
User isi form → (jika ada foto) POST /upload/item-photo → dapat URL foto →
POST /items/lost | /items/found (dengan photoUrl) → item tersimpan status "open"
```

### Alur Klaim & Verifikasi
```
User buka detail barang (status open) → Ajukan Klaim (bukti min. 10 karakter) →
POST /claims → klaim status "pending" →
Admin buka /admin/claims → Approve/Reject (+ catatan) →
  • Approve → item menjadi "claimed" + catat ke admin_logs
  • Reject  → klaim ditolak + catat ke admin_logs
```

### Alur Moderasi Admin
```
Admin buka detail item → Hapus Laporan (alasan min. 5 karakter) →
DELETE /admin/items/:id → item & klaim terkait terhapus → catat ke admin_logs
```

---

## 13. Desain Antarmuka & Branding

### Tema: *Terminal Linux / Hacker*
Palet warna gelap keunguan dengan aksen ungu–biru–kuning.

| Variabel | Warna | Penggunaan |
|---|---|---|
| `--color-primary` | `#7C3AED` (ungu) | Aksi utama / CTA |
| `--color-secondary` | `#2563EB` (biru) | Link, info, badge |
| `--color-accent` | `#CA8A04` (amber) | Warning, highlight, menu admin |
| `--color-bg` | `#0F0F14` | Latar utama |
| `--color-surface` | `#1A1A24` | Permukaan kartu |
| `--color-border` | `#2D2D3D` | Border halus |
| `--color-text` | `#E2E8F0` | Teks utama |
| `--color-success` | `#16A34A` | Status sukses |
| `--color-danger` | `#DC2626` | Error |

**Status barang berwarna:** open (biru), claimed (ungu), closed (abu).

### Tipografi
- **JetBrains Mono** — heading & elemen bernuansa terminal.
- **Inter** — body text & form (keterbacaan).

### Ketentuan UI
- Bahasa antarmuka: **Bahasa Indonesia** (label, placeholder, pesan error).
- Status badge memakai **border berwarna** (bukan fill).
- Kartu item: *dark surface* dengan border kiri sesuai status.
- **Footer wajib**: `© {tahun} Faga | echofaga · AMTEHI` di setiap halaman.

---

## 14. Cara Instalasi & Menjalankan

### Prasyarat
- Node.js ≥ 20, npm, dan akun/proyek Supabase.

### Langkah
```bash
# 1. Install dependencies (dari root)
npm install

# 2. Build shared package (WAJIB sebelum api/web jalan)
npm run build --workspace=@amtehi/shared

# 3. Konfigurasi environment
#    Salin .env.example → apps/api/.env dan apps/web/.env.local
#    (Koneksi Supabase memakai pooler, bukan direct connection.
#     Dev lokal: DATABASE_URL & DIRECT_URL sama-sama Session Pooler :5432.
#     Produksi serverless: DATABASE_URL Transaction Pooler :6543 — lihat STEPS.md)

# 4. Generate Prisma client & migrasi
npm run prisma:generate
npm run prisma:migrate

# 5. Terapkan RLS policy di Supabase (jalankan isi prisma/sql/rls-policies.sql)

# 6. (Opsional) Seed akun admin
npm run seed:admin --workspace=@amtehi/api

# 7. Jalankan (web + api bersamaan)
npm run dev
```

- Frontend: **http://localhost:3000**
- Backend API: **http://localhost:3001**

> **Deploy produksi (Vercel):** backend dijalankan sebagai *serverless function*;
> web + api tampil di satu domain via Next.js rewrites. Langkah lengkap di **`STEPS.md`**.

### Akun Admin Demo
| Field | Nilai |
|---|---|
| Email | `admin@amikom.ac.id` |
| Password | `REDACTED` |

### Environment Variables Utama
**`apps/api/.env`:** `NODE_ENV`, `PORT`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY` (rahasia, backend saja), `DATABASE_URL` (runtime),
`DIRECT_URL` (khusus `prisma migrate`), `FRONTEND_URL`, `MAX_FILE_SIZE_MB`.
**`apps/web/.env.local`:** `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_API_URL` (dev; kosong di prod).
Di produksi Vercel, proyek web juga memakai `API_URL` (server-side) untuk rewrites.

---

## 15. Hasil Pengujian

Pengujian dilakukan secara **fungsional (black-box)** — mencoba tiap fitur dan
memverifikasi hasil sesuai harapan.

### Ringkasan Uji Fitur
| # | Skenario | Hasil |
|---|---|---|
| 1 | Registrasi (auto login → dashboard) | ✅ Berhasil |
| 2 | Login / Logout | ✅ Berhasil |
| 3 | Edit profil | ✅ Berhasil |
| 4 | Hapus field opsional profil | ✅ Berhasil |
| 5 | Lapor barang hilang + foto | ✅ Berhasil |
| 6 | Lapor barang temuan + foto | ✅ Berhasil |
| 7 | Cari & filter barang | ✅ Berhasil |
| 8 | Ajukan klaim | ✅ Berhasil |
| 9 | Review klaim (admin) | ✅ Berhasil |
| 10 | Statistik admin | ✅ Berhasil |
| 11 | Ubah role user (admin) | ✅ Berhasil |
| 12 | Hapus item (admin) | ✅ Berhasil |
| 13 | Audit log (admin) | ✅ Berhasil |

### Uji Validasi (Negative Testing)
- Password < 8 karakter → ditolak.
- Foto > 5 MB atau format selain JPG/PNG/WEBP → ditolak.
- Bukti klaim < 10 karakter → ditolak.
- Field opsional dikosongkan → diterima (menjadi `null`), bukan error.

### Bug yang Ditemukan & Diperbaiki
| ID | Ringkasan | Status |
|---|---|---|
| BUG-001 | Upload foto error 404 (endpoint hook salah `/upload` → `/upload/item-photo`) | ✅ Fixed |
| BUG-002 | UI polos tanpa CSS (proses Node zombie + cache `.next` korup) | ✅ Fixed |
| BUG-003 | `prisma generate` gagal `EPERM` saat dev server jalan (Windows file lock) | ✅ Resolved |

*Detail lengkap tiap bug tersedia di `README.md` bagian Bug Log.*

---

## 16. Kebutuhan Non-Fungsional

| Aspek | Penerapan |
|---|---|
| **Keamanan** | httpOnly cookie, RLS, rate limiting, validasi Zod, Helmet, audit log |
| **Maintainability** | Arsitektur berlapis (route/controller/service), TypeScript ketat (tanpa `any`), shared types |
| **Skalabilitas** | Monorepo Turborepo; backend & frontend terpisah dapat di-deploy mandiri |
| **Usability** | UI Bahasa Indonesia, form dengan validasi & pesan error jelas |
| **Konsistensi** | Format respons API terstandardisasi (success/error) |
| **Portabilitas** | Berbasis web, dapat diakses lintas browser modern |
| **Reliabilitas** | Validasi environment saat startup; error handler terpusat |

---

## 17. Batasan Sistem & Pengembangan Lanjutan

### Batasan Saat Ini
- Belum ada fitur **reset password** mandiri (harus lewat pengelola).
- Notifikasi masih terbatas (belum realtime/email penuh).
- Role admin hanya via seed/DB (disengaja demi keamanan).
- Upload dibatasi ~4MB di produksi Vercel (batas body serverless); rencana lanjutan:
  upload langsung browser→Supabase Storage.

### Rencana Pengembangan Lanjutan
1. **Notifikasi realtime & email** saat klaim disetujui/ditolak
   (memanfaatkan Supabase Realtime).
2. **Reset password mandiri.**
3. **Integrasi login email kampus** resmi (`@students.amikom.ac.id`).
4. **Aplikasi mobile** (React Native / PWA).
5. **Fitur chat langsung** antara penemu & pemilik.
6. **Full-text search** lebih canggih (tsvector PostgreSQL).

---

*Dokumen ini disusun sebagai bahan penyusunan Laporan Akhir proyek AMTEHI.*
*Untuk panduan penggunaan lihat `MANUAL.md`; untuk detail teknis & bug log lihat `README.md`.*
*© Faga | echofaga · AMTEHI*
