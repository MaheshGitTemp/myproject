-- 005_photos.sql — member photos pipeline. Raw SQL, PostgreSQL. Applied by
-- db/migrate.js inside a transaction. Builds on 001_init.sql (users) +
-- 002_profiles.sql. Do NOT edit applied migrations; this is a NEW numbered file.
--
-- Photo rules (user message 3 §2 "Photo approval" + §9 "Image handling"):
--   * New photos default to status='pending' and are NOT publicly visible.
--   * A photo becomes visible only after admin approval (status='approved'),
--     and still follows the member's visibility setting.
--   * Rejected photos: the file on disk is removed, but a minimal row is kept
--     (status='rejected' + reject_reason) for audit.
--   * Max 3 photos per user (settings.max_photos_per_user) — enforced in code.
--   * Only the processed WebP display + thumbnail filenames are stored; the
--     original upload is never persisted.
--
-- The FK references users(id) ON DELETE CASCADE so account closure / admin
-- delete (business rule 8) wipes all photo rows automatically; the controller
-- unlinks the disk files BEFORE deleting the owning user (see P7 account close).

CREATE TABLE IF NOT EXISTS photos (
  id               BIGSERIAL PRIMARY KEY,
  user_id          BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  filename_display TEXT,
  filename_thumb   TEXT,
  is_primary       BOOLEAN NOT NULL DEFAULT false,
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected')),
  reject_reason    TEXT,
  visibility       TEXT NOT NULL DEFAULT 'all'
                     CHECK (visibility IN ('all', 'connections', 'premium')),
  sort_order       INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photos_user ON photos (user_id, status);
