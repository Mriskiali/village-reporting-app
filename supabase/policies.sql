-- ============================================================
-- RLS Policies - SPKPPSU (Supabase)
-- Jalankan SETELAH schema.sql
-- Model keamanan:
--   - Semua user terautentikasi bisa baca users (profil publik terbatas)
--   - PETUGAS: hanya bisa CRUD laporan miliknya sendiri
--   - ADMIN: full akses laporan & manajemen user
--   - Notifikasi: hanya milik sendiri
-- ============================================================

-- ===== USERS =====
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Semua user login bisa lihat daftar petugas (untuk leaderboard, verifikasi, dst)
CREATE POLICY "users_select_authenticated"
  ON users FOR SELECT
  TO authenticated
  USING (TRUE);

-- User bisa update profil sendiri saja (nama, phone, avatar)
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- Hanya ADMIN yang bisa insert/hapus user
-- (asumsi: role disimpan di JWT app_metadata, fallback: cek tabel)
CREATE POLICY "users_admin_insert"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
    )
  );

CREATE POLICY "users_admin_delete"
  ON users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
    )
  );

-- ===== REPORTS =====
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Semua user login bisa baca laporan (petugas perlu liat riwayat sendiri; admin butuh semua)
CREATE POLICY "reports_select_authenticated"
  ON reports FOR SELECT
  TO authenticated
  USING (TRUE);

-- Petugas: insert laporan miliknya sendiri
CREATE POLICY "reports_insert_own"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Petugas: update laporan miliknya sendiri (resubmit setelah ditolak)
-- Admin: update semua (verifikasi/tolak)
CREATE POLICY "reports_update_own_or_admin"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    auth.uid()::text = user_id
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
    )
  )
  WITH CHECK (
    auth.uid()::text = user_id
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
    )
  );

-- Admin: hapus laporan (hard delete user beserta riwayat)
CREATE POLICY "reports_admin_delete"
  ON reports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
    )
  );

-- ===== NOTIFICATIONS =====
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User hanya bisa lihat notifikasi miliknya
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

-- User bisa tandai sudah dibaca (update miliknya)
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Sistem/admin bisa insert notifikasi
CREATE POLICY "notifications_insert_admin_or_self"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = user_id
    OR EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
    )
  );

-- ===== STORAGE (Supabase Storage untuk foto laporan) =====
-- Jalankan sekali: bikin bucket + policy
INSERT INTO storage.buckets (id, name, public) VALUES ('report-photos', 'report-photos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Public read untuk foto (biar bisa ditampilin di dashboard)
CREATE POLICY "report_photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'report-photos');

-- Upload hanya user login
CREATE POLICY "report_photos_authenticated_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'report-photos');

-- User boleh hapus foto miliknya (resubmit), admin bebas
CREATE POLICY "report_photos_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'report-photos'
    AND (auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()::text AND u.role = 'ADMIN'
      ))
  );
