-- 007_admin.sql — admin flag on users + an admin audit log. Raw SQL,
-- PostgreSQL. Applied by db/migrate.js inside a transaction. Builds on
-- 001_init.sql (users). Do NOT edit applied migrations; this is a NEW
-- numbered file, strictly additive to the applied schema.
--
-- There is no admin UI yet (user message 1/3/6 — "admin dashboard we build
-- later"). This phase only adds the SCHEMA + guarded stub endpoints so the
-- backend is ready for that dashboard:
--   users.is_admin  — marks an account as an administrator (requireAdmin).
--   admin_audit      — append-only trail of every admin action (who did what,
--                      to which target, with free-form detail), for
--                      accountability. admin_id is SET NULL on delete so the
--                      trail survives even if the admin account is later
--                      removed.

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS admin_audit (
  id         BIGSERIAL PRIMARY KEY,
  admin_id   BIGINT REFERENCES users (id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  target     TEXT,
  detail     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin ON admin_audit (admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit (created_at);
