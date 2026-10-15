// Chat data access — conversations + messages. Raw parameterized SQL (no ORM).
//
// Pair storage is CANONICAL: a_id < b_id (see 006_chat.sql), so an unordered
// (A,B) pair maps to exactly one row. getOrCreateConversation normalizes the
// two ids with least()/greatest() before insert so either participant resolves
// to the same conversation.
//
// Block enforcement does NOT live here — it is applied in the service/
// controller layer (chatController) via blocksRepo.isMessageBlocked, per the
// cross-cutting rule "enforce business rules in the service layer".
import { query, queryOne } from '../../db.js';
import { PHOTO_MEDIA_SELECT } from '../profiles/profilesRepo.js';

/**
 * Get the existing conversation for the unordered pair (uId, vId) or create
 * one. Runs inside the caller's transaction `client`. Returns the full row.
 */
export async function getOrCreateConversation(client, uId, vId) {
  const aId = Math.min(uId, vId);
  const bId = Math.max(uId, vId);
  const existing = await client.query(
    'SELECT * FROM conversations WHERE a_id = $1 AND b_id = $2',
    [aId, bId],
  );
  if (existing.rows[0]) return existing.rows[0];
  const inserted = await client.query(
    `INSERT INTO conversations (a_id, b_id)
     VALUES ($1, $2)
     ON CONFLICT (a_id, b_id) DO UPDATE SET a_id = EXCLUDED.a_id
     RETURNING *`,
    [aId, bId],
  );
  return inserted.rows[0];
}

/** Load a conversation row by id, or null. */
export async function getConversationById(id) {
  return queryOne('SELECT * FROM conversations WHERE id = $1', [id]);
}

/** True when `userId` is one of the two participants of the conversation. */
export function isParticipant(conversation, userId) {
  if (!conversation) return false;
  return conversation.a_id === userId || conversation.b_id === userId;
}

/** The OTHER participant's id for a conversation, from `userId`'s perspective. */
export function otherParticipantId(conversation, userId) {
  if (!conversation) return null;
  return conversation.a_id === userId ? conversation.b_id : conversation.a_id;
}

/**
 * List conversations for `userId`, newest activity first. Each row carries the
 * OTHER party's identity (mat_id, name, online), their resolved primary photo
 * (via PHOTO_MEDIA_SELECT — same fallback logic as profile cards), the unread
 * count (messages the other party sent that this user hasn't read), and the
 * last message text + time. The controller maps these to the chatData shape.
 */
export async function listConversations(userId) {
  const { rows } = await query(
    `SELECT
        c.id,
        c.updated_at,
        u.id         AS other_id,
        u.mat_id     AS other_mat_id,
        p.first_name AS other_name,
        p.online     AS other_online,
        p.image      AS image,
        p.gallery    AS gallery,
        ${PHOTO_MEDIA_SELECT},
        (SELECT COUNT(*)::int
           FROM messages m
          WHERE m.conversation_id = c.id
            AND m.sender_id = u.id
            AND m.read = false) AS unread,
        lm.body       AS last_message,
        lm.created_at AS last_message_at
       FROM conversations c
       JOIN users u
         ON u.id = CASE WHEN c.a_id = $1 THEN c.b_id ELSE c.a_id END
       LEFT JOIN profiles p ON p.user_id = u.id
       LEFT JOIN LATERAL (
         SELECT body, created_at
           FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
       ) lm ON true
      WHERE c.a_id = $1 OR c.b_id = $1
      ORDER BY COALESCE(lm.created_at, c.updated_at) DESC`,
    [userId],
  );
  return rows;
}

/** Messages for a conversation, oldest first (chat scroll order). */
export async function listMessages(conversationId) {
  const { rows } = await query(
    `SELECT id, conversation_id, sender_id, body, read, created_at
       FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC, id ASC`,
    [conversationId],
  );
  return rows;
}

/**
 * Insert a message and bump the conversation's updated_at. Runs inside the
 * caller's transaction `client`. Returns the created message row.
 */
export async function sendMessage(client, conversationId, senderId, body) {
  const inserted = await client.query(
    `INSERT INTO messages (conversation_id, sender_id, body)
     VALUES ($1, $2, $3)
     RETURNING id, conversation_id, sender_id, body, read, created_at`,
    [conversationId, senderId, body],
  );
  await client.query(
    'UPDATE conversations SET updated_at = now() WHERE id = $1',
    [conversationId],
  );
  return inserted.rows[0];
}

/**
 * Mark as read every message in the conversation that was sent by the OTHER
 * party (i.e. not by `userId`). Returns the number of rows updated.
 */
export async function markRead(conversationId, userId) {
  const { rowCount } = await query(
    `UPDATE messages
        SET read = true
      WHERE conversation_id = $1
        AND sender_id <> $2
        AND read = false`,
    [conversationId, userId],
  );
  return rowCount;
}
