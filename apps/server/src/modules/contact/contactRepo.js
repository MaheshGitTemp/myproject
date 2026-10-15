// Contact-unlock data access. Raw parameterized SQL (no ORM). Backs the
// per-profile one-time unlock model + daily NEW-unlock limit (004_contact.sql).
import { query, queryOne } from '../../db.js';

/** True when `viewerId` has previously unlocked `targetId`'s contact. */
export async function isUnlocked(viewerId, targetId) {
  if (viewerId == null || targetId == null) return false;
  const row = await queryOne(
    'SELECT 1 FROM contact_unlocks WHERE viewer_id = $1 AND target_id = $2 LIMIT 1',
    [viewerId, targetId],
  );
  return !!row;
}

/**
 * How many NEW unlocks `viewerId` has recorded today (one phone_views row per
 * (viewer, viewed, day); re-views of an already-unlocked contact don't add a
 * row for a new day's limit because the unlock is reused — see recordUnlock).
 */
export async function countTodayUnlocks(viewerId) {
  const row = await queryOne(
    `SELECT COUNT(*)::int AS n
       FROM phone_views
      WHERE viewer_id = $1 AND view_date = current_date`,
    [viewerId],
  );
  return row ? row.n : 0;
}

/**
 * Record a brand-new unlock inside a transaction: a durable contact_unlocks
 * row (price_paid) + today's phone_views row. ON CONFLICT DO NOTHING keeps the
 * call idempotent/safe. Returns the contact_unlocks row (new or existing).
 *
 * @param {import('pg').PoolClient} client transaction client
 */
export async function recordUnlock(client, viewerId, targetId, price) {
  const { rows } = await client.query(
    `INSERT INTO contact_unlocks (viewer_id, target_id, price_paid)
     VALUES ($1, $2, $3)
     ON CONFLICT (viewer_id, target_id) DO NOTHING
     RETURNING *`,
    [viewerId, targetId, price],
  );
  // Log the view for today's limit (unique triple -> at most one row per day).
  await client.query(
    `INSERT INTO phone_views (viewer_id, viewed_id, view_date)
     VALUES ($1, $2, current_date)
     ON CONFLICT (viewer_id, viewed_id, view_date) DO NOTHING`,
    [viewerId, targetId],
  );
  if (rows[0]) return rows[0];
  // Already unlocked earlier (race / re-call) — return the existing row.
  return queryOne(
    'SELECT * FROM contact_unlocks WHERE viewer_id = $1 AND target_id = $2',
    [viewerId, targetId],
  );
}

/**
 * Bulk helper for the detail mapper: the set of target user ids the viewer has
 * unlocked (used so a single-profile detail can mark contactUnlocked without a
 * per-field round-trip). Returns a Set of numeric ids.
 */
export async function unlockedTargetIds(viewerId, targetIds = []) {
  if (viewerId == null || targetIds.length === 0) return new Set();
  const { rows } = await query(
    `SELECT target_id FROM contact_unlocks
      WHERE viewer_id = $1 AND target_id = ANY($2::bigint[])`,
    [viewerId, targetIds],
  );
  return new Set(rows.map((r) => Number(r.target_id)));
}
