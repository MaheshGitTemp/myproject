// Blocks data access + the reusable pair-check helpers used across search,
// single-profile, matches and messaging. Raw parameterized SQL (no ORM).
//
// Blocks are stored directionally (blocker_id -> blocked_id) but enforced in
// BOTH directions: if A blocks B, neither can see the other. `type`:
//   'full'         -> hides profile/search/matches AND blocks messaging.
//   'message_only' -> blocks messaging only; profiles stay visible.
import { query, queryOne } from '../../db.js';

/**
 * True when a FULL block exists in EITHER direction between the two users.
 * Used to hide profiles from search / single-profile / matches and to reject
 * interests between the pair.
 */
export async function isBlockedPair(aId, bId) {
  if (aId == null || bId == null) return false;
  const row = await queryOne(
    `SELECT 1
       FROM blocks
      WHERE type = 'full'
        AND ((blocker_id = $1 AND blocked_id = $2)
          OR (blocker_id = $2 AND blocked_id = $1))
      LIMIT 1`,
    [aId, bId],
  );
  return !!row;
}

/**
 * True when messaging is restricted in EITHER direction — a FULL block or a
 * MESSAGE_ONLY block. (Full blocks also restrict messaging.)
 */
export async function isMessageBlocked(aId, bId) {
  if (aId == null || bId == null) return false;
  const row = await queryOne(
    `SELECT 1
       FROM blocks
      WHERE ((blocker_id = $1 AND blocked_id = $2)
          OR (blocker_id = $2 AND blocked_id = $1))
      LIMIT 1`,
    [aId, bId],
  );
  return !!row;
}

/** True when `blockerId` has an active block row against `blockedId`. */
export async function hasBlock(blockerId, blockedId) {
  const row = await queryOne(
    'SELECT 1 FROM blocks WHERE blocker_id = $1 AND blocked_id = $2 LIMIT 1',
    [blockerId, blockedId],
  );
  return !!row;
}

/** Create/update a block from blockerId -> blockedId. */
export async function block(blockerId, blockedId, type = 'full', byAdmin = false) {
  const safeType = type === 'message_only' ? 'message_only' : 'full';
  const { rows } = await query(
    `INSERT INTO blocks (blocker_id, blocked_id, type, blocked_by_admin)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (blocker_id, blocked_id)
       DO UPDATE SET type = EXCLUDED.type,
                     blocked_by_admin = blocks.blocked_by_admin OR EXCLUDED.blocked_by_admin
     RETURNING *`,
    [blockerId, blockedId, safeType, byAdmin],
  );
  return rows[0];
}

/** Remove a block from blockerId -> blockedId. Returns true when a row existed. */
export async function unblock(blockerId, blockedId) {
  const { rowCount } = await query(
    'DELETE FROM blocks WHERE blocker_id = $1 AND blocked_id = $2',
    [blockerId, blockedId],
  );
  return rowCount > 0;
}

/**
 * Rows this user has blocked, joined with the blocked member's profile so the
 * UI can render a card. Returns raw rows (controller maps to cards).
 */
export async function listBlocks(userId) {
  const { rows } = await query(
    `SELECT b.id AS block_id, b.type, b.blocked_by_admin, b.created_at AS blocked_at,
            p.*, u.id AS user_id, u.mat_id, u.email, u.phone, u.status,
            u.is_verified, u.admin_approved, u.hide_phone, u.hide_email
       FROM blocks b
       JOIN users u ON u.id = b.blocked_id
       LEFT JOIN profiles p ON p.user_id = u.id
      WHERE b.blocker_id = $1
      ORDER BY b.created_at DESC`,
    [userId],
  );
  return rows;
}

/**
 * Counts for the admin dashboard (business rule 6 "User Block Count"):
 *   blocked   -> how many users this person has blocked.
 *   blockedBy -> how many users have blocked this person.
 */
export async function userBlockCounts(userId) {
  const row = await queryOne(
    `SELECT
       (SELECT COUNT(*)::int FROM blocks WHERE blocker_id = $1) AS blocked,
       (SELECT COUNT(*)::int FROM blocks WHERE blocked_id = $1) AS blocked_by`,
    [userId],
  );
  return { blocked: row ? row.blocked : 0, blockedBy: row ? row.blocked_by : 0 };
}
