# 📚 Bimbel Grade Manager

Sistem manajemen nilai dan kehadiran siswa bimbingan belajar (bimbel). Dibangun untuk memudahkan guru dalam mencatat, memantau, dan mengelola performa akademik siswa secara real-time.

## ✨ Fitur Utama

- **🔐 Autentikasi Guru** — Login & register dengan email verification via Supabase Auth
- **👤 Manajemen Siswa** — Tambah, cari, dan hapus siswa dengan pengelompokan kelas (7A–9C)
- **📝 Input Nilai** — Catat nilai Latihan, Quiz, dan Bonus Point (0–100)
- **📋 Catat Kehadiran** — Rekam status Hadir, Sakit, atau Absen per sesi
- **📊 Leaderboard** — Ranking siswa berdasarkan total skor (rata-rata + bonus), dengan podium visual dan filter per kelas
- **🔍 Filter & Riwayat** — Lihat riwayat nilai/kehadiran dengan filter berdasarkan jenis (Latihan, Quiz, Bonus, Kehadiran)
- **🔒 Row-Level Security** — Setiap guru hanya bisa melihat dan mengelola siswa miliknya sendiri
- **📱 Responsive Design** — Tampilan optimal di desktop maupun mobile

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router + Turbopack) |
| **Language** | TypeScript |
| **Backend/Auth** | [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS) |
| **Styling** | Vanilla CSS (custom design system with dark mode) |
| **Font** | Inter + Outfit (Google Fonts) |

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── layout.tsx          # Root layout dengan metadata & font
│   ├── page.tsx            # Root redirect (auth check)
│   ├── login/page.tsx      # Halaman login/register
│   └── dashboard/page.tsx  # Dashboard utama (server component)
├── components/
│   ├── DashboardClient.tsx  # Client component utama dashboard
│   ├── Header.tsx           # Header dengan info user & logout
│   ├── StudentSidebar.tsx   # Sidebar daftar siswa & tambah siswa
│   ├── StudentDetail.tsx    # Detail siswa, input nilai & kehadiran
│   ├── Leaderboard.tsx      # Modal leaderboard dengan podium
│   └── WelcomeScreen.tsx    # Tampilan awal sebelum pilih siswa
├── lib/
│   ├── types.ts             # TypeScript interfaces (Student, Record)
│   └── supabase/
│       ├── client.ts        # Supabase browser client
│       └── server.ts        # Supabase server client
└── proxy.ts                 # Auth proxy (middleware) untuk route protection
```

## 🚀 Getting Started

### Prasyarat

- [Node.js](https://nodejs.org/) v18+
- Akun [Supabase](https://supabase.com/) (gratis)

### 1. Clone & Install

```bash
git clone https://github.com/archiesinaga/alc-classroom.git
cd alc-classroom
npm install
```

### 2. Setup Supabase

1. Buat project baru di [Supabase Dashboard](https://app.supabase.com/)
2. Buka **SQL Editor** dan jalankan isi file `supabase_schema.sql` untuk membuat tabel dan policy
3. _(Opsional)_ Jalankan `supabase_schema_update.sql` jika perlu migrasi tambahan

### 3. Konfigurasi Environment

Buat file `.env.local` di root proyek:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

> Dapatkan kedua nilai ini dari **Supabase Dashboard → Settings → API**

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🗃️ Database Schema

### Tabel `students`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | UUID (PK) | Auto-generated |
| `teacher_id` | UUID (FK → auth.users) | Pemilik data |
| `name` | TEXT | Nama siswa |
| `class_name` | TEXT (nullable) | Kelas (cth: Kelas 7A) |
| `created_at` | TIMESTAMPTZ | Waktu dibuat |

### Tabel `records`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | UUID (PK) | Auto-generated |
| `student_id` | UUID (FK → students) | Relasi ke siswa |
| `category` | TEXT | `'nilai'` atau `'kehadiran'` |
| `type` | TEXT | `'latihan'` / `'quiz'` / `'bonus'` / `'hadir'` / `'sakit'` / `'absen'` |
| `value` | NUMERIC (0–100) | Nilai (null untuk kehadiran) |
| `note` | TEXT (nullable) | Keterangan opsional |
| `date` | TIMESTAMPTZ | Waktu pencatatan |

## 🔒 Keamanan

- **Row-Level Security (RLS)** aktif di semua tabel — guru hanya akses data miliknya
- **Proxy/Middleware** melindungi route `/dashboard` dari akses tanpa login
- **Email verification** wajib sebelum login pertama kali
- Environment variables tidak di-commit ke repository (`.env*` di `.gitignore`)

## 📄 Lisensi

Proyek ini dibuat untuk keperluan internal bimbingan belajar. Silakan gunakan dan modifikasi sesuai kebutuhan.
