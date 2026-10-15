// Notifications data access. Raw parameterized SQL (no ORM).
// A notification is created on a RECEIVED interest and on an ACCEPTED interest
// (see interactionsController). `payload` is arbitrary JSONB context.
import { query, queryOne } from '../../db.js';

/** Create a notification for `userId`. `payload` is stored as JSONB. */
export async function notify(userId, type, payload = {}) {
  const { rows } = await query(
    `INSERT INTO notifications (user_id, type, payload)
     VALUES ($1, $2, $3::jsonb)
     RETURNING *`,
    [userId, type, JSON.stringify(payload || {})],
  );
  return rows[0];
}

/** List a user's notifications, newest first. */
export async function listNotifications(userId) {
  const { rows } = await query(
    `SELECT id, type, payload, read, created_at
       FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 100`,
    [userId],
  );
  return rows;
}

/** Count unread notifications for the badge. */
export async function unreadCount(userId) {
  const row = await queryOne(
    'SELECT COUNT(*)::int AS n FROM notifications WHERE user_id = $1 AND read = false',
    [userId],
  );
  return row ? row.n : 0;
}

/**
 * Mark notifications read. Pass `{ all: true }` to mark every unread one, or
 * `{ id }` to mark a single notification (scoped to the owner). Returns the
 * number of rows updated.
 */
export async function markRead(userId, { id = null, all = false } = {}) {
  if (all) {
    const { rowCount } = await query(
      'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
      [userId],
    );
    return rowCount;
  }
  if (id != null) {
    const { rowCount } = await query(
      'UPDATE notifications SET read = true WHERE user_id = $1 AND id = $2',
      [userId, id],
    );
    return rowCount;
  }
  return 0;
}
