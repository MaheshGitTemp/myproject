-- 006_chat.sql — one-to-one chat (conversations + messages). Raw SQL,
-- PostgreSQL. Applied by db/migrate.js inside a transaction. Builds on
-- 001_init.sql (users). Do NOT edit applied migrations; this is a NEW
-- numbered file.
--
-- Chat rules (user message 5 "Blocking and messaging" — enforced in the
-- service layer, see src/modules/chat): a conversation is a single thread
-- between two members. The pair is UNORDERED: a conversation between A and B
-- is the same thread regardless of who opened it. To make the unordered pair
-- unique with a plain UNIQUE constraint we store it CANONICALLY with
-- a_id < b_id (CHECK + UNIQUE), so (A,B) and (B,A) collide on one row. The
-- repo normalizes to least()/greatest() before insert.
--
-- Both FKs reference users(id) ON DELETE CASCADE so account closure / admin
-- delete (business rule 8) wipes conversations and their messages
-- automatically (messages cascade from conversations too).

CREATE TABLE IF NOT EXISTS conversations (
  id         BIGSERIAL PRIMARY KEY,
  a_id       BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  b_id       BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (a_id < b_id),
  UNIQUE (a_id, b_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  sender_id       BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  read            BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast message fetch ordered within a conversation, and participant lookups.
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_a ON conversations (a_id);
CREATE INDEX IF NOT EXISTS idx_conversations_b ON conversations (b_id);
