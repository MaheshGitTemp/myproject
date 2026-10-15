// Photos data access. Raw parameterized SQL (no ORM). Backs 005_photos.sql.
// Returned filenames (filename_display / filename_thumb) are consumed by the
// storage module to stream or unlink the WebP files on disk.
import { query, queryOne } from '../../db.js';

/**
 * Insert a freshly processed photo. New photos are always status='pending'
 * (admin approval required before they become publicly visible).
 */
export async function insert(userId, { displayName, thumbName, isPrimary = false }) {
  const { rows } = await query(
    `INSERT INTO photos (user_id, filename_display, filename_thumb, is_primary, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [userId, displayName, thumbName, isPrimary],
  );
  return rows[0];
}

/** All of a user's photos, newest first (owner view — includes pending/rejected). */
export async function listByUser(userId) {
  const { rows } = await query(
    `SELECT * FROM photos
      WHERE user_id = $1
      ORDER BY is_primary DESC, sort_order ASC, created_at DESC`,
    [userId],
  );
  return rows;
}

/** A single photo row by id (or null). */
export async function get(id) {
  return queryOne('SELECT * FROM photos WHERE id = $1', [id]);
}

/** How many photos a user currently has (any status) — used to enforce the max. */
export async function countByUser(userId) {
  const row = await queryOne(
    'SELECT COUNT(*)::int AS n FROM photos WHERE user_id = $1',
    [userId],
  );
  return row ? row.n : 0;
}

/**
 * The user's primary APPROVED photo (or null). This is the profile image used
 * in search cards / profile detail (P5 item 5). Falls back to the newest
 * approved photo when none is flagged primary.
 */
export async function getPrimaryApproved(userId) {
  return queryOne(
    `SELECT * FROM photos
      WHERE user_id = $1 AND status = 'approved'
      ORDER BY is_primary DESC, sort_order ASC, created_at DESC
      LIMIT 1`,
    [userId],
  );
}

/** All approved photos for a user (gallery), ordered for display. */
export async function listApproved(userId) {
  const { rows } = await query(
    `SELECT * FROM photos
      WHERE user_id = $1 AND status = 'approved'
      ORDER BY is_primary DESC, sort_order ASC, created_at DESC`,
    [userId],
  );
  return rows;
}

/**
 * Update a photo's moderation status. For 'rejected' the caller passes a
 * reason; the disk files are unlinked by the caller and the row is kept minimal
 * (filenames nulled) so a rejected photo cannot be served.
 */
export async function setStatus(id, status, reason = null) {
  if (status === 'rejected') {
    const { rows } = await query(
      `UPDATE photos
          SET status = 'rejected', reject_reason = $2,
              filename_display = NULL, filename_thumb = NULL, is_primary = false
        WHERE id = $1
        RETURNING *`,
      [id, reason],
    );
    return rows[0];
  }
  const { rows } = await query(
    `UPDATE photos SET status = $2, reject_reason = NULL WHERE id = $1 RETURNING *`,
    [id, status],
  );
  return rows[0];
}

/**
 * Delete a photo row. Returns the deleted row (with filenames) so the caller
 * can unlink the display + thumbnail files from disk.
 */
export async function remove(id) {
  const { rows } = await query('DELETE FROM photos WHERE id = $1 RETURNING *', [id]);
  return rows[0] || null;
}
