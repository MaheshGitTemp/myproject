// Account self-service: closing (permanently deleting) your own account.
// Thin controller — the heavy lifting (disk cleanup + cascade delete) lives in
// accountRepo.deleteUserFully, which admin delete reuses (see
// src/modules/admin). Business rule 8 (user message 3).
import { deleteUserFully } from './accountRepo.js';
import { destroySession } from '../auth/session.js';

/**
 * POST /api/account/close  (requireAuth)
 * Runs the full cascade cleanup for the authenticated user: unlink their photo
 * files from disk, delete the user row (ON DELETE CASCADE removes profile,
 * photos rows, chat, notifications, shortlists, interests, blocks, sessions,
 * OTP, phone_views, contact_unlocks), then destroy the current session so the
 * cookie is cleared. Irreversible.
 */
export async function closeAccount(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await deleteUserFully(userId);
    // Clear the session cookie + any lingering session row for this cookie.
    await destroySession(req, res);
    res.json({ ok: true, deleted: result.deleted > 0 });
  } catch (err) {
    next(err);
  }
}
