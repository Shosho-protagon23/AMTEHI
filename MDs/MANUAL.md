# Manual Penggunaan AMTEHI

**AMTEHI — Amikom Temu Hilang**
Platform lost & found digital untuk lingkungan kampus Universitas Amikom.

> © Faga | echofaga · AMTEHI

---

## Daftar Isi

1. [Tentang Aplikasi](#1-tentang-aplikasi)
2. [Peran Pengguna (Role)](#2-peran-pengguna-role)
3. [Memulai — Akses Aplikasi](#3-memulai--akses-aplikasi)
4. [Panduan untuk User (Mahasiswa/Staf)](#4-panduan-untuk-user-mahasiswastaf)
   - 4.1 Registrasi Akun
   - 4.2 Login & Logout
   - 4.3 Melengkapi Profil
   - 4.4 Melaporkan Barang Hilang
   - 4.5 Melaporkan Barang Temuan
   - 4.6 Mencari & Memfilter Barang
   - 4.7 Mengajukan Klaim
   - 4.8 Memantau Status Klaim
5. [Panduan untuk Admin](#5-panduan-untuk-admin)
   - 5.1 Masuk sebagai Admin
   - 5.2 Dashboard Statistik
   - 5.3 Review Klaim
   - 5.4 Kelola User & Ubah Role
   - 5.5 Moderasi / Hapus Item
   - 5.6 Log Aktivitas (Audit Trail)
6. [Status Barang & Klaim](#6-status-barang--klaim)
7. [Pertanyaan Umum (FAQ)](#7-pertanyaan-umum-faq)

---

## 1. Tentang Aplikasi

AMTEHI membantu warga kampus Amikom yang **kehilangan** atau **menemukan** barang untuk saling terhubung secara aman. Alur besarnya:

- **Pelapor** membuat laporan barang hilang atau barang temuan.
- **Pengklaim** yang merasa barang tersebut miliknya mengajukan klaim disertai bukti.
- **Admin kampus** memverifikasi klaim (menyetujui/menolak) agar barang sampai ke pemilik yang benar.

Setiap aksi penting dicatat sehingga proses transparan dan dapat dipertanggungjawabkan.

---

## 2. Peran Pengguna (Role)

Terdapat tiga peran di dalam sistem:

| Role | Keterangan | Cara diperoleh |
|---|---|---|
| **Mahasiswa** (`student`) | Peran default semua akun baru. Bisa lapor, cari, dan klaim barang. | Otomatis saat registrasi |
| **Staf** (`staff`) | Sama seperti mahasiswa; penanda status kepegawaian kampus. | Diubah oleh admin |
| **Admin** | Mengelola platform: verifikasi klaim, kelola user, moderasi item. | Ditetapkan oleh pengelola sistem (tidak bisa lewat pendaftaran) |

> **Catatan keamanan:** Role admin **tidak dapat** diberikan melalui halaman pendaftaran maupun panel — hanya dapat ditetapkan oleh pengelola sistem melalui prosedur khusus. Ini mencegah penyalahgunaan hak akses.

---

## 3. Memulai — Akses Aplikasi

- **Alamat aplikasi (frontend):** `http://localhost:3000`
- **Alamat API (backend):** `http://localhost:3001`

Buka alamat frontend melalui browser (Chrome/Edge/Firefox). Halaman beranda menampilkan pengantar singkat serta tombol **Masuk** dan **Daftar** di kanan atas.

**Bilah navigasi (navbar)** selalu tersedia di bagian atas:

- **Barang Hilang** — daftar semua laporan barang hilang
- **Barang Temuan** — daftar semua laporan barang temuan
- **Dashboard**, **Profil** — muncul setelah login
- **Admin** — hanya muncul bila akun berrole admin
- **Keluar** — tombol logout

---

## 4. Panduan untuk User (Mahasiswa/Staf)

### 4.1 Registrasi Akun

1. Klik **Daftar** di navbar (atau buka `/register`).
2. Isi formulir:
   - **Nama Lengkap** (wajib)
   - **Email** (wajib) — disarankan email kampus, mis. `nama@students.amikom.ac.id`
   - **Password** (wajib) — **minimal 8 karakter**
   - **NIM** (opsional) — 5–20 karakter
   - **No. HP** (opsional) — hanya angka, `+`, `-`, atau spasi (8–20 karakter)
   - **Fakultas** (opsional)
3. Klik **Daftar**.
4. Jika berhasil, Anda **otomatis login** dan diarahkan ke halaman **Dashboard**.

> Akun baru selalu berperan **Mahasiswa (student)**.

### 4.2 Login & Logout

**Login:**
1. Klik **Masuk** (atau buka `/login`).
2. Masukkan **email** dan **password**, lalu klik masuk.
3. Berhasil → diarahkan ke Dashboard, navbar berubah menampilkan menu pengguna.

**Logout:**
- Klik tombol **Keluar** di navbar. Sesi berakhir dan Anda kembali ke beranda.

> Jika email/password salah, muncul pesan **"Email atau password salah"**.

### 4.3 Melengkapi Profil

1. Buka menu **Profil** (`/profile`).
2. Ubah **Nama, NIM, Fakultas, atau No. HP**, lalu klik **Simpan**.
3. Muncul notifikasi **"Profil berhasil diperbarui"**.

**Mengosongkan field opsional:** kosongkan isian NIM/Fakultas/No. HP (atau gunakan tombol hapus di sampingnya) lalu **Simpan** — field akan menjadi kosong, bukan ditolak.

### 4.4 Melaporkan Barang Hilang

Gunakan ini bila Anda **kehilangan** barang.

1. Login terlebih dahulu.
2. Buka **Barang Hilang** → tombol lapor, atau langsung ke `/items/lost/new`.
3. Isi formulir:
   - **Judul \*** (wajib) — mis. *"Dompet kulit cokelat"*
   - **Kategori \*** (wajib) — Elektronik, Dokumen, Pakaian, Dompet, Kunci, Buku & Alat Tulis, atau Lainnya
   - **Deskripsi** — ciri-ciri, merk, warna, isi, dll.
   - **Terakhir terlihat** — tanggal & waktu
   - **Lokasi terakhir terlihat** — mis. *"Lab Komputer Lt. 3"*
   - **Foto barang** (opsional) — JPG/PNG/WEBP, maksimal 5 MB
4. Klik **Kirim Laporan**.
5. Anda diarahkan ke halaman detail barang. Status awal: **Terbuka (open)**.

### 4.5 Melaporkan Barang Temuan

Gunakan ini bila Anda **menemukan** barang milik orang lain.

1. Login terlebih dahulu.
2. Buka **Barang Temuan** → tombol lapor, atau langsung ke `/items/found/new`.
3. Isi formulir (mirip barang hilang), dengan tambahan:
   - **Waktu ditemukan** dan **Lokasi ditemukan** — mis. *"Parkiran Gedung Unit 1"*
   - **Lokasi penyimpanan barang** — di mana barang disimpan sekarang, mis. *"Pos Satpam / Ruang BAAK"*
   - **Foto barang** (opsional)
4. Klik **Kirim Laporan**.

> **Tips:** Isi sedetail mungkin. Semakin lengkap deskripsi & foto, semakin mudah pemilik menemukannya.

### 4.6 Mencari & Memfilter Barang

1. Buka **Barang Hilang** atau **Barang Temuan**.
2. Gunakan kolom pencarian untuk mencari berdasarkan **judul/deskripsi**.
3. Gunakan filter **kategori** dan **status** untuk mempersempit daftar.
4. Klik salah satu kartu barang untuk melihat **detail** lengkap.

### 4.7 Mengajukan Klaim

Ajukan klaim bila Anda yakin sebuah barang (hilang maupun temuan) adalah milik Anda.

1. Buka **halaman detail** barang yang ingin diklaim.
2. Klik tombol **Ajukan Klaim** (hanya tersedia untuk barang berstatus **Terbuka**).
3. Isi formulir klaim:
   - **Bukti kepemilikan \*** (wajib, **minimal 10 karakter**) — jelaskan sedetail mungkin, mis. *"Ada goresan di sudut kiri, di dalam dompet ada KTM atas nama saya, disertai struk pembelian."*
   - **Foto bukti** (opsional)
4. Klik **Kirim Klaim**.
5. Anda diarahkan ke halaman **Klaim Saya** (`/claims`). Status awal klaim: **Menunggu (pending)**.

**Aturan klaim:**
- Anda **tidak bisa** mengklaim barang yang Anda laporkan sendiri.
- Anda **tidak bisa** mengajukan klaim ganda untuk barang yang sama (jika sudah ada klaim pending/disetujui).

### 4.8 Memantau Status Klaim

1. Buka **Klaim Saya** (`/claims`).
2. Setiap klaim menampilkan statusnya:
   - **Menunggu** — belum direview admin
   - **Disetujui** — admin menyetujui; barang menjadi milik Anda
   - **Ditolak** — admin menolak; biasanya disertai catatan alasan
3. Bila admin memberi **catatan**, catatan tersebut tampil pada klaim Anda.

---

## 5. Panduan untuk Admin

Bagian ini hanya berlaku untuk akun berrole **admin**.

### 5.1 Masuk sebagai Admin

Akun admin demo sudah disiapkan untuk keperluan pengujian:

| Field | Nilai |
|---|---|
| **Email** | `admin@amikom.ac.id` |
| **Password** | `AdminAmtehi123!` |

Langkah masuk:

1. Buka halaman **Masuk** (`/login`) dan login dengan kredensial di atas.
2. Setelah login, menu **Admin** (warna kuning/amber) muncul di navbar.
3. Klik **Admin** untuk membuka panel (`/admin`).

> Jika akun bukan admin dan mencoba membuka `/admin/*`, akan muncul halaman **403 — Akses Khusus Admin**.

> **Catatan:** Kredensial di atas adalah akun demo bawaan. Untuk penggunaan nyata, sebaiknya ganti password setelah login pertama. Bila akun admin belum tersedia di database, pengelola dapat membuatnya dengan perintah `npm run seed:admin` (lihat `README.md`).

### 5.2 Dashboard Statistik

Halaman `/admin` menampilkan ringkasan platform:

- **Klaim menunggu review** — jumlah klaim yang perlu ditindak
- **Total user** terdaftar
- **Total barang hilang** & **total barang temuan**
- Rincian per status (Terbuka / Diklaim / Ditutup) untuk masing-masing jenis barang

Tersedia pula kartu navigasi cepat menuju **Review Klaim**, **Kelola User**, dan **Log Aktivitas**.

### 5.3 Review Klaim

1. Buka **Admin → Review Klaim** (`/admin/claims`).
2. Gunakan filter status: **Menunggu**, **Disetujui**, **Ditolak**, atau **Semua**.
3. Tiap kartu klaim menampilkan: jenis barang, nama pengklaim, teks bukti, dan foto bukti (bila ada).
4. Untuk klaim **Menunggu**, tersedia:
   - Kolom **catatan** untuk pengklaim (opsional)
   - Tombol **Setujui** atau **Tolak**
5. Bila **Disetujui**, status barang terkait otomatis berubah menjadi **Diklaim (claimed)**.
6. Setiap tindakan review otomatis tercatat di **Log Aktivitas**.

> Satu klaim hanya dapat direview sekali. Klaim yang sudah diproses tidak bisa diubah lagi.

### 5.4 Kelola User & Ubah Role

1. Buka **Admin → Kelola User** (`/admin/users`).
2. Tabel menampilkan seluruh user: **Nama, NIM, Fakultas, Role, Tanggal bergabung**.
3. Pada kolom **Ubah Role**, gunakan dropdown untuk mengubah peran antara **Mahasiswa** dan **Staf**.
4. Perubahan langsung tersimpan dan tercatat di Log Aktivitas.

**Batasan (demi keamanan):**
- Role **admin tidak dapat** diberikan atau diubah lewat panel (dropdown hanya student↔staff).
- Admin **tidak dapat** mengubah role akun miliknya sendiri (baris tersebut "terkunci").

### 5.5 Moderasi / Hapus Item

Digunakan untuk menghapus laporan yang melanggar aturan (spam, tidak pantas, dll.).

1. Buka **halaman detail** barang yang bermasalah.
2. Pada kotak **moderasi** (hanya terlihat oleh admin), klik **Hapus Laporan Ini**.
3. Isi **alasan penghapusan** (**wajib, minimal 5 karakter**).
4. Klik **Konfirmasi Hapus**.
5. Barang terhapus (beserta klaim yang terkait dengannya) dan Anda diarahkan kembali ke daftar barang.
6. Penghapusan beserta alasannya tercatat di **Log Aktivitas**.

### 5.6 Log Aktivitas (Audit Trail)

1. Buka **Admin → Log Aktivitas** (`/admin/logs`).
2. Menampilkan daftar aksi admin (terbaru dulu), dengan filter jenis aksi:
   - **Review Klaim** — persetujuan/penolakan klaim
   - **Hapus Barang** — moderasi item beserta alasannya
   - **Ubah Role** — perubahan peran user
3. Tiap entri mencatat: jenis aksi, nama admin pelaku, detail/keterangan, dan waktu.

> Audit trail ini memastikan seluruh tindakan admin transparan dan dapat ditelusuri.

---

## 6. Status Barang & Klaim

**Status Barang:**

| Status | Arti |
|---|---|
| **Terbuka** (open) | Laporan aktif, bisa diklaim |
| **Diklaim** (claimed) | Klaim atas barang ini telah disetujui admin |
| **Ditutup** (closed) | Laporan tidak lagi aktif |

**Status Klaim:**

| Status | Arti |
|---|---|
| **Menunggu** (pending) | Menunggu verifikasi admin |
| **Disetujui** (approved) | Klaim diterima; barang menjadi "Diklaim" |
| **Ditolak** (rejected) | Klaim ditolak admin |

---

## 7. Pertanyaan Umum (FAQ)

**T: Apakah saya harus login untuk melihat daftar barang?**
J: Tidak. Daftar dan detail barang bisa dilihat publik. Namun untuk **melapor** dan **mengajukan klaim**, Anda harus login.

**T: Kenapa tombol "Ajukan Klaim" tidak muncul?**
J: Tombol hanya muncul untuk barang berstatus **Terbuka**. Barang yang sudah **Diklaim** atau **Ditutup** tidak bisa diklaim lagi.

**T: Saya tidak bisa mengklaim barang yang saya laporkan sendiri.**
J: Benar. Sistem melarang pengguna mengklaim barang laporannya sendiri.

**T: Foto gagal terunggah.**
J: Pastikan format **JPG/PNG/WEBP** dan ukuran **maksimal 5 MB**.

**T: Bagaimana cara menjadi admin?**
J: Role admin ditetapkan oleh pengelola sistem, bukan melalui pendaftaran. Hubungi pengelola aplikasi.

**T: Password lupa / ingin ganti.**
J: Hubungi pengelola sistem. (Fitur reset password mandiri belum tersedia pada versi ini.)

---

*Manual ini disusun untuk aplikasi AMTEHI. Untuk detail teknis instalasi & pengembangan, lihat `README.md`.*
*© Faga | echofaga · AMTEHI*
