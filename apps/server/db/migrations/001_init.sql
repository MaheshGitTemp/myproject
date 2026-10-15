-- 001_init.sql — foundational schema: users, sessions, OTP, settings, email blocklist.
-- Raw SQL, PostgreSQL. Applied by db/migrate.js inside a transaction.

-- =============================================================
-- users
--   status flow: pending_otp -> pending_approval -> active
--   dual verification: email_verified + phone_verified -> is_verified (both true)
--   admin_approved is SEPARATE: controls public visibility, set by an admin later.
-- =============================================================
CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  mat_id          TEXT UNIQUE NOT NULL,                 -- "MAT2087", auto-generated sequentially
  email           TEXT UNIQUE,
  phone           TEXT UNIQUE,
  password_hash   TEXT NOT NULL,

  -- account lifecycle
  status          TEXT NOT NULL DEFAULT 'pending_otp'
                    CHECK (status IN ('pending_otp','pending_approval','active','suspended','closed')),

  -- verification (independent flags; is_verified computed on write when both true)
  email_verified  BOOLEAN NOT NULL DEFAULT false,
  phone_verified  BOOLEAN NOT NULL DEFAULT false,
  is_verified     BOOLEAN NOT NULL DEFAULT false,

  -- admin gate for public visibility (kept separate from OTP verification)
  admin_approved     BOOLEAN NOT NULL DEFAULT false,
  admin_approved_at  TIMESTAMPTZ,

  -- reciprocal privacy toggles (enforced server-side)
  hide_phone      BOOLEAN NOT NULL DEFAULT false,
  hide_email      BOOLEAN NOT NULL DEFAULT false,

  -- how many times admins have blocked this account (section 6 "account block count")
  admin_block_count INT NOT NULL DEFAULT 0,

  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email  ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_phone  ON users (phone);
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);

-- Sequence powering mat_id generation (starts at 2001 -> "MAT2001").
CREATE SEQUENCE IF NOT EXISTS mat_id_seq START WITH 2001 INCREMENT BY 1;

-- =============================================================
-- sessions — cookie-based sessions stored in Postgres
-- =============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id          TEXT PRIMARY KEY,                 -- random session id stored in the signed cookie
  user_id     BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  user_agent  TEXT,
  ip          TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions (expires_at);

-- =============================================================
-- otp_codes — email (and later phone) one-time codes
--   purpose: register | login | reset
--   channel: email | phone
-- =============================================================
CREATE TABLE IF NOT EXISTS otp_codes (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT REFERENCES users (id) ON DELETE CASCADE,  -- may be null during pre-user registration
  destination TEXT NOT NULL,                                   -- the email/phone the code was sent to
  channel     TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email','phone')),
  purpose     TEXT NOT NULL CHECK (purpose IN ('register','login','reset')),
  code_hash   TEXT NOT NULL,                                   -- hashed code, never stored in cleartext
  attempts    INT NOT NULL DEFAULT 0,
  consumed_at TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_destination ON otp_codes (destination, purpose);
CREATE INDEX IF NOT EXISTS idx_otp_user        ON otp_codes (user_id);

-- =============================================================
-- settings — admin-editable key/value runtime config (source of truth)
--   e.g. contact_unlock_price, contact_unlock_free_until, phone_view_daily_limit, max_photos_per_user
-- =============================================================
CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- blocked_email_domains — disposable / temp-mail blocklist (admin-editable).
--   Policy: allow all domains EXCEPT those listed here; OTP proves reachability.
-- =============================================================
CREATE TABLE IF NOT EXISTS blocked_email_domains (
  domain      TEXT PRIMARY KEY,                 -- lowercased, e.g. "tempmail.com"
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
