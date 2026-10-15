// Shortlist + interest data access and the matches query. Raw parameterized
// SQL (no ORM). Rows are shaped into frontend cards by profilesRepo.rowToCard
// in the controllers, so the SELECTs here return the same joined columns that
// rowToCard reads (p.*, u.id AS user_id, u.mat_id, u.is_verified, ...).
import { query, queryOne } from '../../db.js';
import { PHOTO_MEDIA_SELECT } from '../profiles/profilesRepo.js';

// The joined column list rowToCard() expects. Shared by every card-producing
// query so the mapper reads a consistent shape. PHOTO_MEDIA_SELECT exposes the
// primary approved photo id + approved gallery ids so cards show real photos
// (P5 item 5) with the seeded URL as a fallback.
const CARD_COLUMNS = `
  p.*, u.id AS user_id, u.mat_id, u.email, u.phone, u.status,
  u.is_verified, u.admin_approved, u.hide_phone, u.hide_email,
  ${PHOTO_MEDIA_SELECT}`;

// Only publicly visible members surface in lists/matches.
const PUBLIC_FILTER = `u.status = 'active' AND u.admin_approved = true`;

// Exclude pairs with a FULL block in either direction (business rule 5).
const NOT_BLOCKED = (viewerParam) => `
  NOT EXISTS (
    SELECT 1 FROM blocks b
     WHERE b.type = 'full'
       AND ((b.blocker_id = ${viewerParam} AND b.blocked_id = u.id)
         OR (b.blocker_id = u.id AND b.blocked_id = ${viewerParam}))
  )`;

// ---- Shortlists ------------------------------------------------------------

/** Add a shortlist (idempotent). Returns the row. */
export async function addShortlist(userId, targetId) {
  const { rows } = await query(
    `INSERT INTO shortlists (user_id, target_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, target_id) DO NOTHING
     RETURNING *`,
    [userId, targetId],
  );
  return rows[0] || null;
}

/** Remove a shortlist. Returns true when a row existed. */
export async function removeShortlist(userId, targetId) {
  const { rowCount } = await query(
    'DELETE FROM shortlists WHERE user_id = $1 AND target_id = $2',
    [userId, targetId],
  );
  return rowCount > 0;
}

/** The viewer's shortlisted members as joined rows (public + not blocked). */
export async function listShortlist(userId) {
  const { rows } = await query(
    `SELECT ${CARD_COLUMNS}
       FROM shortlists s
       JOIN users u ON u.id = s.target_id
       JOIN profiles p ON p.user_id = u.id
      WHERE s.user_id = $1
        AND ${PUBLIC_FILTER}
        AND ${NOT_BLOCKED('$1')}
      ORDER BY s.created_at DESC`,
    [userId],
  );
  return rows;
}

// ---- Interests -------------------------------------------------------------

/** Send interest sender -> receiver (pending). Idempotent on the pair. */
export async function sendInterest(senderId, receiverId) {
  const { rows } = await query(
    `INSERT INTO interests (sender_id, receiver_id, status)
     VALUES ($1, $2, 'pending')
     ON CONFLICT (sender_id, receiver_id) DO NOTHING
     RETURNING *`,
    [senderId, receiverId],
  );
  return rows[0] || null;
}

/**
 * Set the status of the interest that `receiverId` received from `senderId`.
 * Only the receiver can accept/decline. Returns the updated row or null when
 * no such pending/!matching interest exists.
 */
export async function setInterestStatus(receiverId, senderId, status) {
  const { rows } = await query(
    `UPDATE interests
        SET status = $3, updated_at = now()
      WHERE receiver_id = $1 AND sender_id = $2
      RETURNING *`,
    [receiverId, senderId, status],
  );
  return rows[0] || null;
}

/** Fetch a single interest row by its (sender, receiver) pair. */
export async function getInterest(senderId, receiverId) {
  return queryOne(
    'SELECT * FROM interests WHERE sender_id = $1 AND receiver_id = $2',
    [senderId, receiverId],
  );
}

/**
 * List interests for a user.
 *   box='incoming' -> interests this user RECEIVED (other = sender).
 *   box='outgoing' -> interests this user SENT (other = receiver).
 * Each row carries the OTHER member's profile columns + interest_status.
 * Publicly-visible, not-blocked members only.
 */
export async function listInterests(userId, box = 'incoming') {
  const incoming = box !== 'outgoing';
  const otherJoin = incoming ? 'i.sender_id' : 'i.receiver_id';
  const selfCol = incoming ? 'i.receiver_id' : 'i.sender_id';
  const { rows } = await query(
    `SELECT ${CARD_COLUMNS}, i.status AS interest_status, i.created_at AS interest_at
       FROM interests i
       JOIN users u ON u.id = ${otherJoin}
       JOIN profiles p ON p.user_id = u.id
      WHERE ${selfCol} = $1
        AND ${PUBLIC_FILTER}
        AND ${NOT_BLOCKED('$1')}
      ORDER BY i.created_at DESC`,
    [userId],
  );
  return rows;
}

// ---- Matches ---------------------------------------------------------------

/**
 * Shortlisted members for the matches screen (same set as listShortlist, kept
 * as its own name so the controller reads clearly).
 */
export async function getShortlistedMatches(userId) {
  return listShortlist(userId);
}

/**
 * Mutual matches: both users accepted each other's interest. There must be an
 * accepted interest in EACH direction between the viewer and the other member.
 * Returns the other member's joined profile rows (public + not blocked).
 */
export async function getMutualMatches(userId) {
  const { rows } = await query(
    `SELECT ${CARD_COLUMNS}
       FROM interests i1
       JOIN interests i2
         ON i2.sender_id = i1.receiver_id
        AND i2.receiver_id = i1.sender_id
       JOIN users u ON u.id = i1.receiver_id
       JOIN profiles p ON p.user_id = u.id
      WHERE i1.sender_id = $1
        AND i1.status = 'accepted'
        AND i2.status = 'accepted'
        AND ${PUBLIC_FILTER}
        AND ${NOT_BLOCKED('$1')}
      ORDER BY i1.updated_at DESC`,
    [userId],
  );
  return rows;
}

/**
 * True when two users are "connected" — a mutual ACCEPTED interest exists in
 * both directions. Used by photo visibility='connections' gating (P5): a
 * connections-only photo is served to the owner and to connected members only.
 */
export async function areConnected(aId, bId) {
  if (aId == null || bId == null) return false;
  const row = await queryOne(
    `SELECT 1
       FROM interests i1
       JOIN interests i2
         ON i2.sender_id = i1.receiver_id
        AND i2.receiver_id = i1.sender_id
      WHERE i1.sender_id = $1 AND i1.receiver_id = $2
        AND i1.status = 'accepted' AND i2.status = 'accepted'
      LIMIT 1`,
    [aId, bId],
  );
  return !!row;
}
