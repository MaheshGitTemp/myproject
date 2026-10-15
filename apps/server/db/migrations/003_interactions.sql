-- 003_interactions.sql — member interactions: shortlists, interests, blocks,
-- notifications, reports. Raw SQL, PostgreSQL. Applied by db/migrate.js inside
-- a transaction. Builds on 001_init.sql (users) + 002_profiles.sql. Do NOT edit
-- applied migrations; this is a NEW numbered file.
--
-- Every FK references users(id) ON DELETE CASCADE so account closure / admin
-- delete (business rule 8) wipes all interaction rows automatically.

-- =============================================================
-- shortlists — a user shortlists (saves) another user's profile.
--   One row per (user_id, target_id) pair.
-- =============================================================
CREATE TABLE IF NOT EXISTS shortlists (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  target_id   BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_id)
);

CREATE INDEX IF NOT EXISTS idx_shortlists_user   ON shortlists (user_id);
CREATE INDEX IF NOT EXISTS idx_shortlists_target ON shortlists (target_id);

-- =============================================================
-- interests — one user expresses interest in another; the receiver accepts or
--   declines. A mutual match = both directions accepted (see getMatches).
-- =============================================================
CREATE TABLE IF NOT EXISTS interests (
  id           BIGSERIAL PRIMARY KEY,
  sender_id    BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  receiver_id  BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sender_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_interests_sender   ON interests (sender_id);
CREATE INDEX IF NOT EXISTS idx_interests_receiver ON interests (receiver_id);

-- =============================================================
-- blocks — directional block records. `type`:
--   'full'         -> cannot view profile/search/matches/message (both ways).
--   'message_only' -> messaging restricted but profiles still visible.
--   blocked_by_admin flags admin-issued blocks (business rule 6).
--   Blocks apply in BOTH directions in the helpers (if A blocks B, neither
--   can see the other) — enforced in code, not the schema.
-- =============================================================
CREATE TABLE IF NOT EXISTS blocks (
  id                BIGSERIAL PRIMARY KEY,
  blocker_id        BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  blocked_id        BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type              TEXT NOT NULL DEFAULT 'full'
                      CHECK (type IN ('full', 'message_only')),
  blocked_by_admin  BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks (blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks (blocked_id);

-- =============================================================
-- notifications — per-user feed. `payload` carries arbitrary context (e.g. the
--   other user's mat_id / name) as JSONB. `read` toggles when marked read.
-- =============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type        TEXT,
  payload     JSONB NOT NULL DEFAULT '{}'::jsonb,
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user      ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, read);

-- =============================================================
-- reports — a user reports another user. Admin triages via `status`.
-- =============================================================
CREATE TABLE IF NOT EXISTS reports (
  id                BIGSERIAL PRIMARY KEY,
  reporter_id       BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  reported_user_id  BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  reason            TEXT,
  status            TEXT NOT NULL DEFAULT 'open'
                      CHECK (status IN ('open', 'reviewed', 'actioned', 'dismissed')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports (reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON reports (reported_user_id);
