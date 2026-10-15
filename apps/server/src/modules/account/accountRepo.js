// Account cleanup data access. Houses the ONE reusable cascade-delete routine
// used by BOTH self-service account closure (POST /api/account/close) and
// admin delete (DELETE /api/admin/users/:matId). Raw parameterized SQL.
//
// Business rule 8 (user message 3): closing an account — or an admin deleting
// it — must remove EVERYTHING: the profile, photo rows AND the image files on
// disk, chat messages/conversations, notifications, shortlists, interests,
// blocks, sessions, OTP records, phone-view logs and contact unlocks.
//
// Almost all of those child tables declare `ON DELETE CASCADE` against
// users(id) (see 002–006), so deleting the users row removes them in one shot.
// The ONLY thing the database cannot clean up is the image FILES on disk, so
// we unlink those FIRST (while the photo rows still name them), then delete the
// user row and let the cascade do the rest.
import { query } from '../../db.js';
import * as storage from '../storage/localStorage.js';

/**
 * Fully delete a user and all of their data.
 *   1. Collect every photo filename (display + thumb) the user owns.
 *   2. Unlink those files from disk (idempotent; missing files ignored).
 *   3. DELETE the users row — ON DELETE CASCADE wipes profiles, preferences,
 *      sessions, otp_codes, shortlists, interests, blocks, notifications,
 *      reports, contact_unlocks, phone_views, photo rows, conversations and
 *      messages.
 *
 * Returns the number of user rows deleted (0 when the user did not exist).
 * Safe to call for self-close and admin-delete alike.
 *
 * @param {number} userId
 * @returns {Promise<{ deleted: number, filesRemoved: number }>}
 */
export async function deleteUserFully(userId) {
  if (userId == null) return { deleted: 0, filesRemoved: 0 };

  // 1. Gather disk filenames BEFORE the rows are cascaded away.
  const { rows: photos } = await query(
    'SELECT filename_display, filename_thumb FROM photos WHERE user_id = $1',
    [userId],
  );

  // 2. Unlink files first — the DB cannot do this. Ignore already-missing files.
  let filesRemoved = 0;
  for (const p of photos) {
    if (await storage.remove(p.filename_display)) filesRemoved += 1;
    if (await storage.remove(p.filename_thumb)) filesRemoved += 1;
  }

  // 3. Delete the user; every child table cascades from users(id).
  const { rowCount } = await query('DELETE FROM users WHERE id = $1', [userId]);
  return { deleted: rowCount, filesRemoved };
}
