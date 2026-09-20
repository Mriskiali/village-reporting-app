-- ============================================================
-- SPKPPSU - Schema Database
-- Supabase (PostgreSQL) / kompatibel dengan Turso-LibSQL
-- Jalankan di SQL Editor Supabase atau turso db shell
-- ============================================================

-- Tabel: users (petugas & admin)
CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    pjlp_number   TEXT UNIQUE NOT NULL,
    name          TEXT NOT NULL,
    role          TEXT NOT NULL CHECK (role IN ('PETUGAS', 'ADMIN')),
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    phone         TEXT,
    avatar_url    TEXT,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel: reports (laporan pekerjaan)
CREATE TABLE IF NOT EXISTS reports (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name   TEXT NOT NULL,
    category    TEXT NOT NULL CHECK (category IN ('KEBERSIHAN','KERUSAKAN','TAMAN','SALURAN','LAINNYA')),
    description TEXT NOT NULL,
    image_url   TEXT NOT NULL,
    location    TEXT NOT NULL,
    lat         REAL,
    lng         REAL,
    status      TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','ACCEPTED','REJECTED')),
    feedback    TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message    TEXT NOT NULL,
    type       TEXT NOT NULL DEFAULT 'INFO' CHECK (type IN ('INFO','SUCCESS','WARNING','ERROR')),
    is_read    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_id    ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status     ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- Row Level Security (Supabase spesifik; skip bila pakai Turso)
-- ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
-- Policy contoh: petugas hanya bisa lihat/mutir laporan miliknya sendiri
-- CREATE POLICY "petugas_own_reports" ON reports
--   FOR ALL USING (auth.uid()::text = user_id);
