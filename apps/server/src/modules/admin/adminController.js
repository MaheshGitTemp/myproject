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
import { query, queryOne } from '../../db.js';
import { normalizeMatId } from '../profiles/matId.js';
import {
  getUserIdByMatId,
  getProfileByMatId,
  getPreferencesByUserId,
  rowToDetail,
} from '../profiles/profilesRepo.js';
import { block, unblock, userBlockCounts } from '../interactions/blocksRepo.js';
import { deleteUserFully } from '../account/accountRepo.js';
import * as settings from '../settings/settingsService.js';
import * as photosRepo from '../photos/photosRepo.js';
import * as storage from '../storage/localStorage.js';

// Allowed users.status values (001_init.sql CHECK) — used to validate the
// optional status filter on the user listing.
const USER_STATUSES = ['pending_otp', 'pending_approval', 'active', 'suspended', 'closed'];

/** Clamp an integer to [min, max], falling back to `def` when unparseable. */
function clampInt(val, def, min, max) {
  const n = parseInt(val, 10);
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(n, min), max);
}

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

/**
 * GET /api/admin/stats — dashboard KPI counts. Read-only, no audit.
 * All counts are parameterless COUNT(*)::int queries; "today" compares the
 * timestamp cast to ::date against current_date (contact_unlocks uses
 * unlocked_at, 004_contact.sql).
 */
export async function getStats(req, res, next) {
  try {
    const row = await queryOne(
      `SELECT
         (SELECT COUNT(*)::int FROM users) AS total_members,
         (SELECT COUNT(*)::int FROM users WHERE status = 'pending_approval') AS pending_approval,
         (SELECT COUNT(*)::int FROM users WHERE status = 'active') AS active,
         (SELECT COUNT(*)::int FROM users WHERE status = 'suspended') AS suspended,
         (SELECT COUNT(*)::int FROM photos WHERE status = 'pending') AS pending_photos,
         (SELECT COUNT(*)::int FROM users WHERE created_at::date = current_date) AS signups_today,
         (SELECT COUNT(*)::int FROM contact_unlocks WHERE unlocked_at::date = current_date) AS unlocks_today`,
    );
    res.json({
      ok: true,
      stats: {
        totalMembers: row.total_members,
        pendingApproval: row.pending_approval,
        active: row.active,
        suspended: row.suspended,
        pendingPhotos: row.pending_photos,
        signupsToday: row.signups_today,
        unlocksToday: row.unlocks_today,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users?query=&status=&page=&limit= — searchable, filterable,
 * paginated member list. Joins users + profiles. Read-only, no audit.
 */
export async function listUsers(req, res, next) {
  try {
    const where = [];
    const params = [];
    const add = (val) => {
      params.push(val);
      return `$${params.length}`;
    };

    const q = typeof req.query.query === 'string' ? req.query.query.trim() : '';
    if (q) {
      const p = add(`%${q}%`);
      where.push(`(p.full_name ILIKE ${p} OR u.email ILIKE ${p} OR u.mat_id ILIKE ${p})`);
    }

    const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';
    if (status && USER_STATUSES.includes(status)) {
      where.push(`u.status = ${add(status)}`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const totalRow = await queryOne(
      `SELECT COUNT(*)::int AS total
         FROM users u
         LEFT JOIN profiles p ON p.user_id = u.id
         ${whereSql}`,
      params,
    );
    const total = totalRow ? totalRow.total : 0;

    const page = clampInt(req.query.page, 1, 1, 1_000_000);
    const limit = clampInt(req.query.limit, 20, 1, 100);
    const offset = (page - 1) * limit;

    const limitParam = add(limit);
    const offsetParam = add(offset);

    const { rows } = await query(
      `SELECT u.mat_id, u.email, u.phone, u.status, u.is_verified, u.admin_approved,
              u.created_at, p.full_name, p.premium, p.city, p.state
         FROM users u
         LEFT JOIN profiles p ON p.user_id = u.id
         ${whereSql}
        ORDER BY u.created_at DESC
        LIMIT ${limitParam} OFFSET ${offsetParam}`,
      params,
    );

    const results = rows.map((r) => ({
      matId: r.mat_id,
      email: r.email,
      phone: r.phone,
      status: r.status,
      isVerified: r.is_verified,
      adminApproved: r.admin_approved,
      premium: r.premium === true,
      name: r.full_name,
      city: r.city,
      state: r.state,
      createdAt: r.created_at,
    }));

    res.json({ ok: true, results, total, page, limit });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users/:matId — full member detail for the admin UI.
 * Admins are privileged viewers, so the profile is shaped with { self:true }
 * (all contact visible). Adds account fields, preferences, photos (any status)
 * and block counts both directions. Read-only, no audit.
 */
export async function getUserDetail(req, res, next) {
  try {
    const resolved = await resolveMatIdParam(req, res);
    if (!resolved) return;

    const profileRow = await getProfileByMatId(resolved.matId);
    // Admin is a privileged viewer -> show full contact (self shorthand).
    const detail = profileRow ? rowToDetail(profileRow, { contact: { self: true } }) : {};

    const [preferences, account, photosResult, counts] = await Promise.all([
      getPreferencesByUserId(resolved.userId),
      queryOne(
        `SELECT status, email_verified, phone_verified, is_verified, admin_approved,
                admin_block_count, created_at, last_login_at
           FROM users WHERE id = $1`,
        [resolved.userId],
      ),
      query(
        `SELECT id, status, is_primary
           FROM photos
          WHERE user_id = $1
          ORDER BY is_primary DESC, created_at DESC`,
        [resolved.userId],
      ),
      userBlockCounts(resolved.userId),
    ]);

    const photos = photosResult.rows.map((ph) => ({
      id: ph.id,
      status: ph.status,
      isPrimary: ph.is_primary,
    }));

    res.json({
      ok: true,
      user: {
        ...detail,
        preferences: preferences || null,
        status: account ? account.status : null,
        emailVerified: account ? account.email_verified : null,
        phoneVerified: account ? account.phone_verified : null,
        isVerified: account ? account.is_verified : null,
        adminApproved: account ? account.admin_approved : null,
        adminBlockCount: account ? account.admin_block_count : null,
        createdAt: account ? account.created_at : null,
        lastLoginAt: account ? account.last_login_at : null,
        photos,
        counts: { blocksMade: counts.blocked, blockedBy: counts.blockedBy },
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/users/:matId/suspend  body { reason? }
 * Sets users.status='suspended' and audits.
 */
export async function suspendUser(req, res, next) {
  try {
    const resolved = await resolveMatIdParam(req, res);
    if (!resolved) return;
    const reason = (req.body && req.body.reason) ? String(req.body.reason) : null;
    await query(`UPDATE users SET status = 'suspended' WHERE id = $1`, [resolved.userId]);
    await audit(req.user.id, 'suspend_user', resolved.matId, { reason });
    res.json({ ok: true, status: 'suspended' });
  } catch (err) {
    next(err);
  }
}

/** POST /api/admin/users/:matId/unsuspend — sets users.status='active' + audit. */
export async function unsuspendUser(req, res, next) {
  try {
    const resolved = await resolveMatIdParam(req, res);
    if (!resolved) return;
    await query(`UPDATE users SET status = 'active' WHERE id = $1`, [resolved.userId]);
    await audit(req.user.id, 'unsuspend_user', resolved.matId, {});
    res.json({ ok: true, status: 'active' });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/users/:matId/unblock — removes the admin->target block row
 * created by blockUser (does NOT touch the historical admin_block_count). Audit.
 */
export async function unblockUser(req, res, next) {
  try {
    const resolved = await resolveMatIdParam(req, res);
    if (!resolved) return;
    const unblocked = await unblock(req.user.id, resolved.userId);
    await audit(req.user.id, 'unblock_user', resolved.matId, {});
    res.json({ ok: true, unblocked });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/settings — all admin-editable settings as a key:value object
 * (settingsService.getAll merges DB values over defaults). Read-only.
 */
export async function getSettings(req, res, next) {
  try {
    const all = await settings.getAll();
    res.json({ ok: true, settings: all });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/audit?page=&limit= — the admin action trail joined to the
 * acting admin's mat_id (LEFT JOIN handles the SET NULL admin_id case).
 * Read-only, paginated.
 */
export async function listAudit(req, res, next) {
  try {
    const page = clampInt(req.query.page, 1, 1, 1_000_000);
    const limit = clampInt(req.query.limit, 20, 1, 100);
    const offset = (page - 1) * limit;

    const totalRow = await queryOne('SELECT COUNT(*)::int AS total FROM admin_audit');
    const total = totalRow ? totalRow.total : 0;

    const { rows } = await query(
      `SELECT a.id, a.admin_id, u.mat_id AS admin_mat_id, a.action, a.target,
              a.detail, a.created_at
         FROM admin_audit a
         LEFT JOIN users u ON u.id = a.admin_id
        ORDER BY a.created_at DESC
        LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const results = rows.map((r) => ({
      id: r.id,
      adminId: r.admin_id,
      adminMatId: r.admin_mat_id,
      action: r.action,
      target: r.target,
      detail: r.detail,
      createdAt: r.created_at,
    }));

    res.json({ ok: true, results, total });
  } catch (err) {
    next(err);
  }
}
