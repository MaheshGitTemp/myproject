-- 004_contact.sql — paid contact unlocks + daily phone-view logging. Raw SQL,
-- PostgreSQL. Applied by db/migrate.js inside a transaction. Builds on
-- 001_init.sql (users, settings) + 002/003. Do NOT edit applied migrations;
-- this is a NEW numbered file.
--
-- Contact Access Model (business rules + user messages 4 & 7):
--   * Searching/viewing profiles is free; contact details (phone/email/
--     whatsapp) stay locked until the viewer unlocks that specific profile.
--   * One-time per-profile unlock — NO subscription. During the launch free
--     window the price recorded is 0 (₹25 struck through, shown as free).
--   * A per-day limit caps how many NEW contacts a viewer can unlock
--     (settings.phone_view_daily_limit). Re-viewing an already-unlocked
--     contact is free, unlimited, and does NOT count toward the daily limit.
--
-- Every FK references users(id) ON DELETE CASCADE so account closure / admin
-- delete (business rule 8) wipes all contact rows automatically.

-- =============================================================
-- contact_unlocks — one durable row per (viewer, target) pair. Once present,
--   the viewer keeps access to that target's contact forever (re-views free).
--   price_paid records what was charged at unlock time (0 in the free window).
-- =============================================================
CREATE TABLE IF NOT EXISTS contact_unlocks (
  id          BIGSERIAL PRIMARY KEY,
  viewer_id   BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  target_id   BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  price_paid  NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (viewer_id, target_id)
);

CREATE INDEX IF NOT EXISTS idx_contact_unlocks_viewer ON contact_unlocks (viewer_id);
CREATE INDEX IF NOT EXISTS idx_contact_unlocks_target ON contact_unlocks (target_id);

-- =============================================================
-- phone_views — one row per (viewer, viewed, day). Used to enforce and audit
--   the daily NEW-unlock limit. The UNIQUE triple means viewing the same
--   number again on the same day cannot be counted twice (business rule 7).
--   Count toward the limit = number of phone_views rows for current_date.
-- =============================================================
CREATE TABLE IF NOT EXISTS phone_views (
  id          BIGSERIAL PRIMARY KEY,
  viewer_id   BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  viewed_id   BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  view_date   DATE NOT NULL DEFAULT current_date,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (viewer_id, viewed_id, view_date)
);

CREATE INDEX IF NOT EXISTS idx_phone_views_viewer_date ON phone_views (viewer_id, view_date);
