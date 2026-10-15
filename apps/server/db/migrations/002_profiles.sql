-- 002_profiles.sql — profiles (1:1 with users) + partner preferences.
-- Raw SQL, PostgreSQL. Applied by db/migrate.js inside a transaction.
-- Builds on 001_init.sql (users, mat_id_seq). Do NOT edit 001.

-- =============================================================
-- profiles — one row per user (user_id is PK and FK to users).
--   Names live here (not on users). full_name is computed on write
--   (first_name + ' ' + last_name). caste is fixed 'Viswabrahmin'.
--   image/gallery hold display URLs so seeded data renders before real
--   photo rows exist (P5 overrides image with the approved primary photo).
-- =============================================================
CREATE TABLE IF NOT EXISTS profiles (
  user_id          BIGINT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,

  profile_for      TEXT,
  first_name       TEXT,
  last_name        TEXT,
  full_name        TEXT,
  gender           TEXT,
  dob              DATE,
  dob_display      TEXT,
  tob              TEXT,
  pob              TEXT,
  height           TEXT,
  weight           TEXT,
  marital_status   TEXT,
  mother_tongue    TEXT DEFAULT 'Telugu',

  education        TEXT,
  field_of_study   TEXT,
  college          TEXT,
  occupation       TEXT,
  employed_in      TEXT,
  company          TEXT,
  income           TEXT,
  work_location    TEXT,

  city             TEXT,
  state            TEXT,
  native_place     TEXT,

  caste            TEXT DEFAULT 'Viswabrahmin',
  sub_caste        TEXT,
  gothram          TEXT,
  rasi             TEXT,
  nakshatra        TEXT,
  padam            TEXT,
  manglik          TEXT,

  diet             TEXT,
  smoking          TEXT,
  drinking         TEXT,
  hobbies          TEXT,

  headline         TEXT,
  about            TEXT,

  family_type      TEXT,
  family_status    TEXT,
  family_values    TEXT,
  father_occupation TEXT,
  mother_occupation TEXT,
  siblings         TEXT,

  physical_status  TEXT,
  body_type        TEXT,
  residency        TEXT,

  membership       TEXT NOT NULL DEFAULT 'Free Member',
  premium          BOOLEAN NOT NULL DEFAULT false,
  online           BOOLEAN NOT NULL DEFAULT false,

  image            TEXT,
  gallery          JSONB NOT NULL DEFAULT '[]'::jsonb,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_gender    ON profiles (gender);
CREATE INDEX IF NOT EXISTS idx_profiles_city      ON profiles (city);
CREATE INDEX IF NOT EXISTS idx_profiles_state     ON profiles (state);
CREATE INDEX IF NOT EXISTS idx_profiles_marital   ON profiles (marital_status);
CREATE INDEX IF NOT EXISTS idx_profiles_sub_caste ON profiles (sub_caste);

-- =============================================================
-- preferences — partner preferences (one row per user).
--   Separate from profiles so search/matching reads it independently.
-- =============================================================
CREATE TABLE IF NOT EXISTS preferences (
  user_id          BIGINT PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,

  looking_for      TEXT,
  age_from         INT,
  age_to           INT,
  pref_height_from TEXT,
  pref_height_to   TEXT,
  marital_status   TEXT,
  education        TEXT,
  occupation       TEXT,
  diet             TEXT,
  location         TEXT,

  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
