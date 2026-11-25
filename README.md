# SPEKTRA — The Grand Art Circus

**SPEKTRA** adalah platform pameran karya seni digital (*Art Showcase Platform*) yang mempertemukan kreator dan penikmat seni dari berbagai negara. Pengunjung dapat menjelajahi karya visual, fotografi, ilustrasi, desain, animasi, film, musik, dan karya tulis. Member dapat membangun portofolio serta berinteraksi dengan kreator lain, Curator dapat mengadakan challenge, dan Admin mengelola pengguna, kategori, serta moderasi konten.

SPEKTRA menggunakan konsep **The Grand Art Circus** dengan latar warm white, aksen sage green, soft coral, dan champagne gold. Elemen sirkus—tirai, panggung carousel, kartu karya bergerak, suara, dan permainan petualangan—dibuat untuk memperkaya pengalaman menjelajahi galeri. Game juga terhubung dengan karya dan akun pengguna melalui database PostgreSQL.

> **Teknologi utama:** Next.js App Router, React JSX, Tailwind CSS, dan PostgreSQL (Raw SQL).

---

## 1. Tujuan dan gambaran project

SPEKTRA dibuat sebagai ruang digital untuk:

- Menampilkan karya seni dari berbagai medium dan negara.
- Memberi ruang bagi Member/Kreator untuk menerbitkan serta mengelola portofolio.
- Menghubungkan audiens dan kreator melalui Like, Favorites, komentar, Follow, dan Collections.
- Menyediakan challenge yang dapat dibuat Curator dan diikuti Member.
- Menjaga kualitas konten melalui pelaporan serta moderasi oleh Admin.
- Mengajak pengunjung mengenal karya seni melalui permainan edukatif **Petualangan Harta Karun Seni**.

## 2. Fitur utama

### 2.1 Galeri publik

- Homepage berisi karya populer, karya terbaru, kreator pilihan, negara asal karya, kategori, dan challenge aktif.
- Katalog dengan **10 kategori utama**.
- Pencarian karya berdasarkan judul, kreator, seniman asli, dan tag.
- Filter berdasarkan kategori, negara, dan jenis media.
- Pengurutan karya berdasarkan popularitas, terbaru, terlama, atau judul.
- Halaman detail yang menampilkan media, deskripsi, kreator, negara, tahun, medium, sumber, dan keterangan lisensi jika tersedia.
- Profil kreator yang dapat dibuka oleh Guest.

### 2.2 Sepuluh kategori seni

1. Digital Illustration & Drawing
2. Photography
3. Painting & Traditional Art
4. Graphic Design & Typography
5. UI/UX & Product Design
6. 3D Art & Sculpture
7. Animation & Motion Graphics
8. Film & Video
9. Music & Sound
10. Writing & Mixed Media

Admin dapat menambah, mengubah, dan menghapus kategori melalui dashboard. Kategori yang sedang dipakai karya tidak dapat dihapus sebelum karya-karya tersebut dipindahkan ke kategori lain.

### 2.3 Galeri gambar, video, dan audio

- Carousel panggung utama mengambil karya gambar dari tabel `artworks` di PostgreSQL dan hanya memilih file lokal yang tersedia.
- Carousel berpindah otomatis setiap **2 detik**. Kartu di posisi tengah mendapat efek cahaya dan gerakan, sedangkan kartu lain tampil lebih tenang.
- Tombol panah dapat digunakan untuk berpindah manual. Tombol Pause/Play menghentikan atau melanjutkan perpindahan otomatis.
- Bagian **Cinema in Motion** menampilkan video yang tersimpan di database dengan kontrol pemutar.
- Bagian **The Sound Tent** menampilkan musik/audio yang tersimpan di database dengan kontrol pemutar.
- Gambar, video, dan audio juga dapat dibuka melalui halaman detail karya.
- Aset contoh mencakup karya arsip dari paket aset yang disediakan serta beberapa karya orisinal SPEKTRA. Sumber dan catatan lisensi dicantumkan di `docs/ARTWORK_CREDITS.md`.

### 2.4 Fitur interaksi komunitas

- Like / Unlike karya.
- Save / Remove Favorites.
- Menambah komentar dan menghapus komentar milik sendiri.
- Melaporkan karya atau komentar milik pengguna lain.
- Mengikuti / berhenti mengikuti kreator.
- Membuat Collections / Moodboards dari karya favorit.

### 2.5 Challenge dan event kreatif

- Curator yang sudah disetujui Admin dapat membuat, melihat, mengubah, dan menghapus challenge miliknya.
- Halaman challenge menampilkan deskripsi, aturan, hadiah, tanggal, galeri peserta, dan pemenang.
- Member dapat mengirim satu karya miliknya ke challenge yang sedang aktif.
- Member dapat menarik submisi sebelum challenge berakhir.
- Curator dapat memilih maksimal tiga pemenang setelah challenge berakhir. Setiap peringkat hanya dapat dimiliki satu karya.
- Validasi waktu dan kepemilikan dilakukan di sisi backend.

### 2.6 Dashboard dan moderasi

- Dashboard Member: profil, karya, Favorites, Collections, submisi challenge, dan progres game.
- Dashboard Curator: pengelolaan challenge, peserta, dan pemenang.
- Dashboard Admin: statistik, manajemen pengguna, verifikasi Curator, manajemen kategori, dan antrean moderasi.
- Admin dapat memilih **Dismiss Report** atau **Take Down** untuk laporan karya/komentar.

---

## 3. Peran pengguna dan hak akses

| Peran | Hak akses utama |
|---|---|
| Guest / Pengunjung | Menjelajahi homepage, galeri, kategori, detail karya, profil kreator, challenge, serta mencoba game. Tidak dapat Like, Save, Comment, Report, Follow, atau mengunggah karya. |
| Member / Kreator | Mengelola profil dan akun; CRUD karya milik sendiri; Like, Favorites, komentar, Report, Follow, Collections; mengirim submisi challenge; menyimpan progres game. |
| Curator | Mendaftar dan menunggu persetujuan Admin. Setelah Approved, dapat CRUD challenge miliknya, melihat submisi, dan memilih pemenang setelah challenge berakhir. Curator tidak dapat mengunggah karya atau memakai fitur interaksi Member. |
| Admin | Mengelola kategori, melihat dan menghapus akun Member/Curator, menyetujui/menolak Curator, melihat statistik, serta memproses laporan karya dan komentar. Akun Admin tidak dapat dihapus melalui manajemen pengguna. |

### Status Curator

- **Pending:** pendaftaran sedang ditinjau. Dashboard Curator belum dapat diakses.
- **Approved:** dapat masuk ke dashboard dan mengelola challenge.
- **Rejected:** tidak dapat mengakses dashboard. Halaman Pending menampilkan alasan penolakan dan opsi menghapus akun.

---

## 4. Hubungan game dengan karya seni dan database

Game **Petualangan Harta Karun Seni** bukan halaman permainan yang berdiri sendiri. Misi permainan menggunakan karya yang sama dengan katalog galeri SPEKTRA. Ketika pemain membuka referensi karya dari game, tautannya menuju halaman detail karya tersebut.

### 4.1 Alur permainan

1. **START — Gerbang Keajaiban**: pemain memulai petualangan.
2. **Level 1 — Jejak Tiket Emas**: pemain mencari tiga tiket unik di peta sirkus. Ada dua benda pengecoh yang tidak menambah tiket.
3. **Level 2 — Tenda Seribu Warna**: pemain menjawab pertanyaan tentang karya di database, seperti *Mona Lisa*, *The Great Wave off Kanagawa*, *Girl with a Pearl Earring*, dan karya musik Bach. Referensi gambar/audio dapat dibuka atau diputar dari level ini.
4. **Level 3 — Labirin Kanvas**: pemain menyusun puzzle 3×3 menggunakan gambar *The Great Wave off Kanagawa* yang diambil dari database. Gambar panduan dan tautan detail mengarah ke karya yang sama di galeri.
5. **Level 4 — Brankas Sang Maestro**: pemain menyusun tiga simbol sesuai petunjuk untuk membuka peti harta karun.
6. **FINISH — Mahkota Aurora**: setelah semua misi selesai, pemain memperoleh lencana Mahkota Aurora.

### 4.2 Fungsi Tiket Emas

Tiket Emas adalah **item progres di dalam game**, bukan uang atau hadiah bernilai tunai.

- Ada tiga tiket unik: **Panggung Velvet**, **Bintang Kelana**, dan **Komidi Musik**.
- Setiap tiket hanya dapat diklaim satu kali untuk satu akun.
- Setelah tiga tiket terkumpul, sistem membuka **Golden Gallery Pass**.
- Golden Gallery Pass membuka **Ruang Koleksi Rahasia** pada tahap akhir petualangan.
- Ruang Koleksi Rahasia menampilkan karya pilihan yang dibaca dari tabel `artworks`; setiap kartu menuju halaman detail karya yang sama dengan galeri utama.
- Setelah seluruh misi diselesaikan, Member memperoleh lencana **Mahkota Aurora** yang ditampilkan kembali di Member Dashboard.

### 4.3 Data game yang disimpan

Progres Member tersimpan pada tabel `game_progress`, dengan relasi langsung ke `users.id`.

| Kolom | Fungsi |
|---|---|
| `user_id` | Pemilik progres; terhubung ke akun Member. |
| `found_tickets` | Daftar tiket unik yang sudah ditemukan. |
| `gold_tickets` | Jumlah tiket terkumpul, maksimal tiga. |
| `completed_levels` | Daftar checkpoint yang telah diselesaikan. |
| `unlocked_level` | Level tertinggi yang sudah terbuka. |
| `golden_gallery_pass` | Status akses ke Ruang Koleksi Rahasia. |
| `aurora_badge_earned` | Status lencana Mahkota Aurora. |

API game memeriksa sesi Member, tiket yang diizinkan, urutan level, dan syarat Golden Gallery Pass di server. Guest tetap dapat mencoba game, tetapi progres Guest hanya bersifat sementara selama halaman masih terbuka. Login sebagai Member diperlukan agar progres tersimpan ke PostgreSQL.

---

## 5. Teknologi yang digunakan

| Bagian | Teknologi |
|---|---|
| Frontend | Next.js App Router, React, JSX |
| Styling | Tailwind CSS v4 dan CSS responsif |
| Backend | Next.js Route Handlers dan Server Actions |
| Database | PostgreSQL dengan Raw SQL melalui `pg` |
| Autentikasi | `bcryptjs`, session token acak, hash token, cookie HttpOnly |
| Media | JPG, PNG, WebP, SVG, GIF, OGG, WAV, MP4, PDF |
| Ikon | Lucide React |

## 6. Struktur folder project

```text
spektra-art-showcase/
├── database/
│   └── spektra.sql             # Struktur tabel, relasi, indeks, kategori awal
├── docs/
│   ├── ARTWORK_CREDITS.md      # Sumber dan catatan lisensi aset
│   └── TESTING_CHECKLIST.md    # Daftar pengujian manual
├── public/
│   ├── audio/                  # Musik dan efek suara game
│   ├── images/                 # Karya, kategori, poster, maskot, dekorasi circus
│   ├── videos/                 # Video contoh
│   └── uploads/                # File yang diunggah Member/Curator
├── scripts/
│   ├── setup-db.mjs            # Menjalankan file SQL
│   ├── seed.mjs                # Mengisi data demo
│   ├── verify-db.mjs           # Memeriksa tabel dan data inti
│   └── check-*.mjs             # Pemeriksaan aset, game, dan konfigurasi
├── src/
│   ├── actions/                # Server Actions
│   ├── app/
│   │   ├── admin/              # Dashboard Admin
│   │   ├── api/                # Route Handlers / API
│   │   ├── art-games/          # Halaman game
│   │   ├── artwork/            # Detail karya
│   │   ├── challenges/         # Daftar dan detail challenge
│   │   ├── creators/           # Profil kreator
│   │   ├── curator/             # Dashboard Curator
│   │   ├── explore/             # Galeri dan filter
│   │   ├── member/              # Dashboard Member
│   │   ├── login/               # Login
│   │   ├── register/            # Registrasi
│   │   ├── search/              # Pencarian
│   │   ├── globals.css          # Gaya global
│   │   ├── layout.jsx           # Layout utama
│   │   └── page.jsx             # Homepage
│   ├── components/              # Komponen UI
│   └── lib/                     # Database, autentikasi, validasi, data, upload
├── .env.local                   # Konfigurasi koneksi PostgreSQL lokal
├── .gitignore                   # Mengabaikan env, node_modules, build, dan upload lokal
├── package.json                 # Dependency dan perintah project
└── README.md                    # Panduan project
```

File SQL berada di `database/spektra.sql`, yaitu **di luar folder `src/app`**, sesuai ketentuan tugas.

---

## 7. Persiapan sebelum menjalankan project

Pastikan perangkat sudah memiliki:

- **Node.js 22 LTS** (minimal 20.19) dan npm.
- **PostgreSQL** (project dapat digunakan dengan PostgreSQL 18).
- **pgAdmin** untuk membuat dan memeriksa database.
- **Git** jika mengambil project melalui GitHub.
- Visual Studio Code atau editor kode lainnya.

## 8. Mengambil project

### 8.1 Clone repository dari GitHub

Buka Command Prompt atau terminal VS Code, lalu jalankan perintah berikut. Ganti URL dengan alamat repository milikmu.

```bash
git clone https://github.com/hartantoporto/art-showcase.git
cd art-showcase
```

Jika nama repository-mu berbeda, sesuaikan nama folder pada perintah `cd`. Pastikan terminal sudah berada di folder yang berisi `package.json`.

Untuk membuka folder tersebut di VS Code:

```bash
code .
```

### 8.2 Jika menggunakan file ZIP

1. Ekstrak file ZIP project.
2. Buka folder `spektra-art-showcase` di Visual Studio Code.
3. Pastikan `package.json`, `database`, `public`, `scripts`, dan `src` berada pada satu tingkat folder utama.

---

## 9. Menyiapkan PostgreSQL

### 9.1 Membuat database melalui pgAdmin

1. Buka pgAdmin dan hubungkan ke server PostgreSQL lokal.
2. Pada panel Object Explorer, buka **Servers** lalu pilih server PostgreSQL.
3. Klik kanan **Databases** → **Create** → **Database**.
4. Isi nama database: **`spektra_db`**.
5. Klik **Save**.

Jika database `spektra_db` sudah ada di pgAdmin, tidak perlu membuat database baru. Pastikan role PostgreSQL yang digunakan memiliki izin untuk membuat tabel dan indeks di database tersebut.

### 9.2 Mengatur `.env.local`

File `.env.local` sudah disediakan di folder utama project. Buka file tersebut dan isi password PostgreSQL lokal milikmu pada bagian `DATABASE_URL`.

```env
DATABASE_URL=postgresql://postgres:ISI_PASSWORD@localhost:5432/spektra_db
```

Ganti `ISI_PASSWORD` dengan password role PostgreSQL yang kamu gunakan di pgAdmin. Jika username, host, atau port berbeda, sesuaikan juga nilainya.

**Penting:**

- Jangan mengunggah `.env.local` ke GitHub karena file ini berisi informasi koneksi database.
- `.env.local` sudah tercantum di `.gitignore`.
- Jangan menggunakan `git add -f .env.local`.
- Tidak diperlukan `.env.example` untuk menjalankan paket ini.

### 9.3 File SQL dan hubungan database

Struktur database disimpan dalam satu file:

```text
database/spektra.sql
```

File tersebut membuat tabel, relasi foreign key, constraint, indeks, migrasi kolom untuk versi database sebelumnya, dan 10 kategori awal. Script `db:setup` menjalankan file SQL tersebut ke database `spektra_db`.

Data contoh seperti akun demo, karya, interaksi, challenge, dan submisi dimasukkan melalui `scripts/seed.mjs` menggunakan perintah `db:seed`. Jadi struktur database tetap berada dalam satu file SQL, sedangkan pengisian data contoh dilakukan melalui script seed agar dapat dijalankan ulang.

---

## 10. Instalasi dan menjalankan project di Windows

Jalankan semua perintah dari folder utama project, yaitu folder yang berisi `package.json`. Karena terminal yang digunakan adalah Windows Command Prompt atau PowerShell, gunakan **`npm.cmd`**.

### 10.1 Instal dependency

```bash
npm.cmd install
```

Perintah ini mengunduh dependency yang diperlukan dan membuat `node_modules` di komputer lokal.

### 10.2 Periksa dan siapkan database

Jalankan secara berurutan:

```bash
npm.cmd run db:check
npm.cmd run db:setup
npm.cmd run db:seed
npm.cmd run db:verify
```

Keterangan:

| Perintah | Fungsi |
|---|---|
| `db:check` | Memeriksa format `.env.local` dan memastikan database yang dituju bernama `spektra_db`. |
| `db:setup` | Menghubungkan ke PostgreSQL dan menjalankan `database/spektra.sql`. |
| `db:seed` | Mengisi akun demo, kategori, karya contoh, like, Favorites, komentar, challenge, submisi, dan data moderasi. |
| `db:verify` | Memeriksa tabel inti, jumlah kategori, koleksi arsip, gambar, audio, video, dan tabel progres game. |

Script seed dirancang agar dapat dijalankan ulang untuk memperbarui data demo. Data karya milik pengguna lain tidak dihapus oleh proses seed.

### 10.3 Pemeriksaan kode dan aset

```bash
npm.cmd run check:static
npm.cmd run lint
npm.cmd run build
```

- `check:static` memeriksa aset kategori, game, dan konfigurasi database.
- `lint` memeriksa aturan penulisan kode.
- `build` membuat build produksi Next.js.

### 10.4 Jalankan website

```bash
npm.cmd run dev
```

Jika terminal menampilkan pesan `Ready`, buka browser dan akses:

- `http://localhost:3000` — Homepage.
- `http://localhost:3000/explore` — Galeri karya.
- `http://localhost:3000/search` — Pencarian.
- `http://localhost:3000/art-games` — Petualangan Harta Karun Seni.
- `http://localhost:3000/challenges` — Daftar challenge.
- `http://localhost:3000/member` — Dashboard Member setelah login.
- `http://localhost:3000/curator` — Dashboard Curator yang sudah Approved.
- `http://localhost:3000/admin` — Dashboard Admin.

Jika port 3000 sedang digunakan, hentikan server sebelumnya dengan `Ctrl + C`, lalu jalankan kembali `npm.cmd run dev`. Jangan menjalankan dua server untuk folder project yang sama secara bersamaan.

---

## 11. Akun demo untuk pengujian

Semua akun demo yang dibuat oleh `npm.cmd run db:seed` menggunakan password awal:

```text
Demo12345!
```

| Peran | Email | Status |
|---|---|---|
| Admin | `admin@spektra.test` | Admin aktif |
| Member | `maya@spektra.test` | Member |
| Member | `akari@spektra.test` | Member |
| Member | `luca@spektra.test` | Member |
| Member | `noor@spektra.test` | Member |
| Curator | `solstice@spektra.test` | Approved |
| Curator | `museum@spektra.test` | Pending |
| Curator | `society@spektra.test` | Rejected |

Akun demo hanya untuk pengujian lokal. Jangan gunakan password demo untuk akun produksi atau layanan publik.

---

## 12. Panduan penggunaan berdasarkan peran

### 12.1 Guest / Pengunjung

1. Buka homepage SPEKTRA.
2. Pilih **Explore** untuk melihat galeri.
3. Gunakan pencarian dan filter kategori, negara, atau jenis media.
4. Klik karya untuk membuka detail, membaca informasi seniman, dan melihat sumber karya.
5. Putar video atau audio melalui kontrol pemutar yang tersedia.
6. Buka profil kreator atau halaman challenge untuk melihat informasi komunitas.
7. Pilih **Art Games** untuk mencoba Petualangan Harta Karun Seni. Untuk menyimpan progres, masuk sebagai Member.

Guest dapat melihat konten, tetapi fitur interaksi Member tidak dapat digunakan sebelum login.

### 12.2 Member / Kreator

1. Pilih **Register**, isi nama, username, email, password, lalu pilih role Member.
2. Setelah mendaftar atau login, buka **Member Dashboard**.
3. Buka **My Profile & Account** untuk mengubah nama tampilan, negara, bio, foto profil, tautan portofolio, email, atau password.
4. Buka **My Artworks** → **Upload Artwork** untuk membuat karya baru. Isi judul, deskripsi, kategori, negara, tag, dan file media.
5. Buka daftar karya sendiri untuk melihat, mengedit metadata, atau menghapus karya.
6. Pada karya kreator lain, gunakan Like, Save to Favorites, Comment, Report, atau Follow.
7. Buka **Saved Favorites** untuk melihat karya yang disimpan.
8. Buka **My Moodboards** untuk membuat koleksi dan mengelompokkan karya favorit.
9. Buka challenge yang sedang aktif, pilih satu karya dari portofolio, lalu kirim melalui **Submit Your Work**.
10. Buka **My Submissions** untuk melihat riwayat submisi. Tombol Withdraw tersedia selama challenge belum berakhir.
11. Buka **Art Games** untuk mengumpulkan Tiket Emas, membuka Golden Gallery Pass, dan menyelesaikan misi. Progres dan lencana akan tersimpan ke akun.

Catatan pengelolaan karya: fitur Edit mengubah metadata karya. File media yang sudah diunggah tidak diganti melalui halaman Edit. Jika file ingin diganti, hapus karya lama lalu unggah ulang file yang benar.

### 12.3 Curator

1. Pilih **Register**, isi data akun, lalu pilih role Curator.
2. Setelah mendaftar, akun akan berstatus **Pending** dan diarahkan ke Pending Curator Page.
3. Admin harus menyetujui pendaftaran sebelum dashboard dapat diakses.
4. Setelah Approved, login dan buka **Curator Dashboard**.
5. Pilih **Create Challenge** untuk mengisi judul, deskripsi, aturan, hadiah, tanggal mulai, tanggal selesai, dan banner.
6. Buka daftar challenge milik sendiri untuk mengedit atau menghapus challenge.
7. Buka halaman submissions untuk meninjau karya peserta.
8. Setelah challenge berakhir, pilih maksimal tiga karya pemenang dengan peringkat 1, 2, dan 3.

Curator Pending atau Rejected tidak dapat mengakses dashboard. Curator Rejected dapat menghapus akunnya dari halaman Pending.

### 12.4 Admin

1. Login menggunakan akun Admin demo.
2. Buka **Admin Dashboard** untuk melihat statistik pengguna, karya, laporan, dan challenge aktif.
3. Buka **User Management** untuk melihat pengguna dan menghapus akun Member/Curator. Akun Admin dilindungi.
4. Buka **Curator Verification** untuk menyetujui atau menolak pendaftaran Curator yang Pending.
5. Buka **Category Management** untuk menambah, mengubah, atau menghapus kategori.
6. Buka **Moderation Queue** untuk meninjau laporan karya dan komentar.
7. Pilih **Dismiss Report** jika laporan tidak terbukti atau **Take Down** jika konten perlu dihapus dari tampilan publik.

---

## 13. Jenis media dan batas unggahan

Member dapat mengunggah:

- Gambar: JPG, JPEG, PNG, WebP, GIF.
- Audio: OGG, WAV, MP3.
- Video: MP4, WebM.
- Dokumen: PDF.

Batas ukuran unggahan karya adalah **15 MB**. Banner challenge memiliki batas **8 MB**, sedangkan foto profil memiliki batas **5 MB**. File unggahan disimpan pada subfolder `public/uploads/` sesuai jenis medianya. Folder upload lokal diabaikan oleh Git agar file pribadi pengguna tidak ikut masuk repository.

---

## 14. Tabel database dan relasi utama

| Tabel | Kegunaan |
|---|---|
| `users` | Data akun, role, profil, dan status Curator. |
| `sessions` | Sesi login yang terhubung ke pengguna. |
| `categories` | Daftar kategori karya. |
| `artworks` | Data karya, metadata, jenis media, dan pemilik karya. |
| `likes` | Relasi Member dengan karya yang disukai. |
| `favorites` | Relasi Member dengan karya yang disimpan. |
| `comments` | Komentar pada karya. |
| `artwork_reports` | Laporan terhadap karya. |
| `comment_reports` | Laporan terhadap komentar. |
| `challenges` | Challenge yang dibuat Curator. |
| `submissions` | Relasi challenge, Member, karya, dan peringkat pemenang. |
| `follows` | Relasi antar kreator yang saling mengikuti. |
| `collections` | Koleksi atau moodboard milik Member. |
| `collection_items` | Relasi karya yang dimasukkan ke koleksi. |
| `game_progress` | Tiket, level, Golden Gallery Pass, dan lencana per Member. |

Relasi utama menggunakan foreign key. Operasi penting seperti penyimpanan progres game dan moderasi dilakukan melalui transaksi database. Query memakai parameter (`$1`, `$2`, dan seterusnya), bukan menggabungkan input pengguna langsung ke string SQL.

---

## 15. API utama

| Endpoint | Metode | Fungsi |
|---|---|---|
| `/api/auth` | POST | Register, login, logout, dan pemeriksaan sesi. |
| `/api/artworks` | POST | Membuat karya baru dengan unggahan media. |
| `/api/artworks/[id]` | PATCH, DELETE | Mengubah metadata atau menghapus karya milik Member. |
| `/api/interactions` | POST | Like, Favorites, komentar, report, dan Follow. |
| `/api/collections` | POST, PATCH, DELETE | Mengelola Collections / Moodboards. |
| `/api/challenges` | POST | Membuat challenge oleh Curator Approved. |
| `/api/challenges/[id]` | PATCH, DELETE | Mengubah atau menghapus challenge milik Curator. |
| `/api/submissions` | POST | Submit, Withdraw, dan memilih pemenang sesuai role serta waktu challenge. |
| `/api/admin` | POST | Verifikasi Curator, manajemen kategori/pengguna, dan moderasi. |
| `/api/game-progress` | GET, POST | Membaca dan menyimpan progres Petualangan Harta Karun Seni. |

Akses endpoint diperiksa di sisi server berdasarkan sesi dan role pengguna.

---

## 16. Pemeriksaan dan pengujian

Sebelum presentasi, jalankan:

```bash
npm.cmd run db:verify
npm.cmd run check:static
npm.cmd run lint
npm.cmd run build
```

Lalu lakukan pengujian manual berikut:

- Guest dapat membuka homepage, Explore, detail karya, profil kreator, challenge, dan game.
- Member dapat Register/Login, mengubah profil, membuat/mengedit/menghapus karya, Like, Favorites, Comment, Report, Follow, Collections, dan Submit/Withdraw challenge.
- Curator Pending/Rejected tidak dapat membuka dashboard; Curator Approved dapat CRUD challenge dan memilih pemenang setelah challenge selesai.
- Admin dapat memverifikasi Curator, mengelola kategori dan pengguna, serta memproses laporan.
- Gambar, video, audio, dan efek suara game dapat diputar/dilihat dari tempat yang sesuai.
- Tiket Emas, Golden Gallery Pass, progres level, dan lencana tersimpan setelah Member logout lalu login kembali.

Daftar pemeriksaan manual lebih rinci tersedia pada `docs/TESTING_CHECKLIST.md`.

---

## 17. Kendala umum

### `DATABASE_URL belum diatur` atau format koneksi tidak valid

Periksa file `.env.local`. Pastikan format URL benar, password sudah diisi, dan nama database adalah `spektra_db`.

### `password authentication failed`

Password atau username PostgreSQL tidak sesuai. Periksa role yang digunakan untuk masuk ke pgAdmin, lalu perbarui `.env.local`.

### `database "spektra_db" does not exist`

Buat database `spektra_db` terlebih dahulu melalui pgAdmin, lalu jalankan `npm.cmd run db:setup`.

### Tabel atau karya contoh belum muncul

Jalankan perintah berikut secara berurutan:

```bash
npm.cmd run db:setup
npm.cmd run db:seed
npm.cmd run db:verify
```

### Gambar/video/audio tidak muncul

Pastikan file ada di folder `public` sesuai alamat `media_url` yang tersimpan di database. Untuk karya contoh bawaan, jalankan kembali `npm.cmd run db:seed` lalu `npm.cmd run db:verify`.

### Port 3000 sudah digunakan

Hentikan server sebelumnya dengan `Ctrl + C`, lalu jalankan kembali `npm.cmd run dev`. Jika Next.js memilih port lain, gunakan alamat localhost yang tertulis di terminal.

---


## 18. Catatan aset dan lisensi

Keterangan sumber, pencipta, dan lisensi untuk karya arsip yang digunakan dicatat pada `docs/ARTWORK_CREDITS.md`. Karya vektor yang dibuat khusus untuk project ditandai sebagai karya orisinal SPEKTRA. Jika project dikembangkan atau dipublikasikan lebih lanjut, pertahankan atribusi dan ketentuan lisensi dari masing-masing sumber.

---

**SPEKTRA — Create, Connect, Inspire.**