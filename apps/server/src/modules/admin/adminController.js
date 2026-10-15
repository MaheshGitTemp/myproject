// Admin controller — the `requireAdmin` guard + minimal (schema-ready) stub
// endpoints for the admin dashboard that is built LATER (user messages 1/3/6).
// There is NO admin UI yet; these endpoints exist so the dashboard has a real
// backend to call. EVERY admin action writes an admin_audit row (007_admin.sql)
// for accountability.
//
// Routes are enforced by requireAdmin (requireAuth + users.is_admin). The
// delete-user action reuses the SAME cascade cleanup as self-service account
// closure (accountRepo.deleteUserFully). block-user is reversible (it writes a
// blocks row with blocked_by_admin=true and bumps users.admin_block_count);
// delete-user is permanent.
import { query } from '../../db.js';
import { normalizeMatId } from '../profiles/matId.js';
import { getUserIdByMatId } from '../profiles/profilesRepo.js';
import { block } from '../interactions/blocksRepo.js';
import { deleteUserFully } from '../account/accountRepo.js';
import * as settings from '../settings/settingsService.js';
import * as photosRepo from '../photos/photosRepo.js';
import * as storage from '../storage/localStorage.js';

/**
 * Guard: requireAuth + the user must be an administrator. `req.user` carries
 * `is_admin` because attachUser selects `u.*` (the column is added in
 * 007_admin.sql).
 */
export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
  if (!req.user.is_admin) return res.status(403).json({ error: 'forbidden' });
  next();
}

/** Append an admin_audit row. Best-effort trail of who did what to whom. */
async function audit(adminId, action, target, detail = {}) {
  await query(
    `INSERT INTO admin_audit (admin_id, action, target, detail)
     VALUES ($1, $2, $3, $4::jsonb)`,
    [adminId, action, target == null ? null : String(target), JSON.stringify(detail || {})],
  );
}

/** Resolve :matId -> user id, writing the 404/400 response if it cannot. */
async function resolveMatIdParam(req, res) {
  const matId = normalizeMatId(req.params.matId);
  if (!matId) {
    res.status(400).json({ error: 'invalid_mat_id' });
    return null;
  }
  const userId = await getUserIdByMatId(matId);
  if (!userId) {
    res.status(404).json({ error: 'not_found' });
    return null;
  }
  return { matId, userId };
}

/** POST /api/admin/profiles/:matId/approve — publish a pending profile. */
export async function approveProfile(req, res, next) {
  try {
    const resolved = await resolveMatIdParam(req, res);
    if (!resolved) return;
    await query(
      `UPDATE users
          SET admin_approved = true, admin_approved_at = now(),
              status = CASE WHEN status = 'pending_approval' THEN 'active' ELSE status END
        WHERE id = $1`,
      [resolved.userId],
    );
    await audit(req.user.id, 'approve_profile', resolved.matId, {});
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/** POST /api/admin/photos/:id/approve — make a pending photo publicly visible. */
export async function approvePhoto(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });
    const row = await photosRepo.get(id);
    if (!row) return res.status(404).json({ error: 'not_found' });
    await photosRepo.setStatus(id, 'approved');
    await audit(req.user.id, 'approve_photo', String(id), { userId: row.user_id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/photos/:id/reject  body { reason }
 * Marks the photo rejected and unlinks its disk files (business rule 2:
 * rejected photos are deleted from disk).
 */
export async function rejectPhoto(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });
    const row = await photosRepo.get(id);
    if (!row) return res.status(404).json({ error: 'not_found' });

    const reason = (req.body && req.body.reason) ? String(req.body.reason) : null;
    // Unlink files first (setStatus nulls the filename columns), then record.
    await storage.remove(row.filename_display);
    await storage.remove(row.filename_thumb);
    await photosRepo.setStatus(id, 'rejected', reason);
    await audit(req.user.id, 'reject_photo', String(id), { userId: row.user_id, reason });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/users/:matId/block  body { type:'full'|'message_only' }
 * Reversible admin block: writes a blocks row (blocked_by_admin=true) from the
 * admin to the target and increments users.admin_block_count (business rule 6
 * "Account Block Count").
 */
export async function blockUser(req, res, next) {
  try {
    const resolved = await resolveMatIdParam(req, res);
    if (!resolved) return;
    const type = (req.body && req.body.type) === 'message_only' ? 'message_only' : 'full';
    await block(req.user.id, resolved.userId, type, true);
    await query(
      'UPDATE users SET admin_block_count = admin_block_count + 1 WHERE id = $1',
      [resolved.userId],
    );
    await audit(req.user.id, 'block_user', resolved.matId, { type });
    res.json({ ok: true, type });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/users/:matId — PERMANENT. Reuses the shared account-close
 * cleanup routine (deleteUserFully): unlink photo files from disk, delete the
 * user row, cascade-remove everything else (business rule 6 + 8).
 */
export async function deleteUser(req, res, next) {
  try {
    const resolved = await resolveMatIdParam(req, res);
    if (!resolved) return;
    if (resolved.userId === req.user.id) {
      return res.status(400).json({ error: 'cannot_delete_self' });
    }
    const result = await deleteUserFully(resolved.userId);
    await audit(req.user.id, 'delete_user', resolved.matId, { filesRemoved: result.filesRemoved });
    res.json({ ok: true, deleted: result.deleted > 0 });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/settings  body { key, value }
 * Updates an admin-editable setting (price, free-window, daily limit, max
 * photos). settingsService.set refreshes the cache immediately.
 */
export async function updateSettings(req, res, next) {
  try {
    const { key, value } = req.body || {};
    if (!key || typeof key !== 'string') return res.status(400).json({ error: 'invalid_key' });
    if (value === undefined || value === null) return res.status(400).json({ error: 'invalid_value' });
    const saved = await settings.set(key, value);
    await audit(req.user.id, 'update_settings', key, { value: String(value) });
    res.json({ ok: true, setting: saved });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/pending — the moderation queue: users awaiting approval and
 * photos awaiting review. Read-only; does not write an audit row.
 */
export async function listPending(req, res, next) {
  try {
    const [users, photos] = await Promise.all([
      query(
        `SELECT u.mat_id, u.email, u.phone, u.status, u.created_at,
                p.first_name, p.last_name, p.full_name
           FROM users u
           LEFT JOIN profiles p ON p.user_id = u.id
          WHERE u.status = 'pending_approval'
          ORDER BY u.created_at ASC`,
      ),
      query(
        `SELECT ph.id, ph.user_id, u.mat_id, ph.created_at
           FROM photos ph
           JOIN users u ON u.id = ph.user_id
          WHERE ph.status = 'pending'
          ORDER BY ph.created_at ASC`,
      ),
    ]);
    res.json({
      ok: true,
      pendingUsers: users.rows,
      pendingPhotos: photos.rows,
    });
  } catch (err) {
    next(err);
  }
}
