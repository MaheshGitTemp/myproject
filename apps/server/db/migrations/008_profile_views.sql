-- 008_profile_views.sql — records each time a logged-in member views another
-- member's public profile. Raw SQL, PostgreSQL. Applied by db/migrate.js inside
-- a transaction. Builds on 001_init.sql (users). Do NOT edit applied migrations;
-- this is a NEW numbered file, strictly additive to the applied schema.
--
-- Used by GET /api/me/stats + GET /api/dashboard to report "profile views"
-- (COUNT(DISTINCT viewer_id)). Rows are inserted best-effort by
-- profilesController.resolvePublicProfile when a non-owner views a visible
-- profile; insert failures never break the profile fetch.
--
-- Both FKs reference users(id) ON DELETE CASCADE so account closure / admin
-- delete (business rule 8) wipes all view rows automatically.

CREATE TABLE IF NOT EXISTS profile_views (
  id         BIGSERIAL PRIMARY KEY,
  viewer_id  BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  viewed_id  BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profile_views_viewed ON profile_views (viewed_id);
