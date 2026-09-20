-- Data contoh (opsional) - password default: ganti segera di aplikasi
-- Untuk Supabase Auth, buat user lewat dashboard; tabel ini untuk profil.

INSERT INTO users (id, pjlp_number, name, role, is_active, password_hash) VALUES
  ('u-admin-01', 'ADM001', 'Admin Kelurahan', 'ADMIN', TRUE, 'REPLACE_WITH_BCRYPT_HASH'),
  ('u-petugas-01', 'PJLP001', 'Budi Santoso', 'PETUGAS', TRUE, 'REPLACE_WITH_BCRYPT_HASH'),
  ('u-petugas-02', 'PJLP002', 'Siti Aminah', 'PETUGAS', TRUE, 'REPLACE_WITH_BCRYPT_HASH')
ON CONFLICT (id) DO NOTHING;

INSERT INTO reports (id, user_id, user_name, category, description, image_url, location, lat, lng, status) VALUES
  ('r-01', 'u-petugas-01', 'Budi Santoso', 'KEBERSIHAN', 'Penyapuan Jl. Rawamangun Muka selesai', 'https://example.com/foto1.jpg', 'Jl. Rawamangun Muka, Pulogadung', -6.1944, 106.8840, 'ACCEPTED'),
  ('r-02', 'u-petugas-02', 'Siti Aminah', 'TAMAN', 'Penyiraman & rapikan Taman Kelurahan', 'https://example.com/foto2.jpg', 'Taman Kelurahan Pulogadung', -6.1950, 106.8850, 'PENDING')
ON CONFLICT (id) DO NOTHING;
