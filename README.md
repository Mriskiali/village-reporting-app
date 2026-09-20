# SPKPPSU — Sistem Pelaporan Kinerja Petugas PPSU

PWA untuk digitalisasi pelaporan kinerja petugas **PPSU (Penanganan Prasarana dan Sarana Umum)** di tingkat kelurahan: petugas melaporkan pekerjaan dari lapangan (foto + GPS), admin memverifikasi dan memantau kinerja real-time.

## Fitur

**Modul Petugas (mobile-first)**

- Absensi & pelaporan berbasis lokasi — GPS + Leaflet Maps, reverse geocoding koordinat ke nama jalan
- Laporan visual — foto dari kamera atau galeri
- Perbaikan laporan yang ditolak tanpa mengetik ulang (resubmit)
- Manajemen profil: foto, ganti kata sandi
- Riwayat dengan timeline harian + filter status/kategori

**Modul Admin (dashboard)**

- Statistik kinerja, grafik, leaderboard petugas
- Verifikasi laporan: filter multi-kriteria, detail foto & peta, tolak dengan alasan
- Manajemen petugas: CRUD, nonaktifkan, hapus permanen dengan konfirmasi
- Ekspor rekap ke CSV & PDF

## Teknologi

- React 18 + TypeScript + Vite (PWA-ready)
- Supabase (auth + database + storage)
- Leaflet (peta & geolocation)
- Tailwind CSS

## Arsitektur

```
pages/
├── admin/        # Dashboard, verifikasi laporan, manajemen user
└── petugas/      # Buat laporan, riwayat, profil
components/       # Reusable: map picker, searchable select, virtual scroll, skeletons
context/          # Auth & app state
lib/              # Supabase client, geolocation, export CSV/PDF
```

## Menjalankan

```bash
git clone https://github.com/Mriskiali/village-reporting-app.git
cd village-reporting-app
npm install
cp .env.example .env   # isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
npm run dev
```

### Setup database (Supabase)

1. Buat project di [supabase.com](https://supabase.com) (free tier cukup)
2. Jalankan `supabase/schema.sql` di SQL Editor
3. Jalankan `supabase/policies.sql` (Row Level Security per role)
4. (Opsional) Jalankan `supabase/seed.sql` untuk data contoh
5. Copy Project URL & anon key ke `.env`

## Peran

**Mu'afa Riski Ali** — Full-stack Developer ([GitHub](https://github.com/Mriskiali) · [LinkedIn](https://www.linkedin.com/in/muafa-riski-ali-3114b536b/))
  