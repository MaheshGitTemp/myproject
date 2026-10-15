// Contact-unlock request handlers. Thin: resolve the target MAT id, enforce
// blocking + the daily NEW-unlock limit + the launch free-window pricing, then
// record the unlock and return the gated contact block.
//
// NO real payment gateway in v1 (user message 4: "No mandatory subscription...
// pay only for contacts you wish to access"; launch window is free). The
// unlock is recorded directly. The Razorpay integration seam is marked below —
// a future phase verifies a payment order before calling recordUnlock().
import { withTransaction } from '../../db.js';
import { getProfileByMatId } from '../profiles/profilesRepo.js';
import { normalizeMatId } from '../profiles/matId.js';
import { isBlockedPair } from '../interactions/blocksRepo.js';
import * as settings from '../settings/settingsService.js';
import { isUnlocked, countTodayUnlocks, recordUnlock } from './contactRepo.js';
import { gateContact } from './contactGate.js';

/** Resolve :matId -> the full target profile+user row (or send an error). */
async function resolveTarget(req, res) {
  const matId = normalizeMatId(req.params.matId);
  if (!matId) {
    res.status(400).json({ error: 'invalid_mat_id' });
    return null;
  }
  const target = await getProfileByMatId(matId);
  if (!target) {
    res.status(404).json({ error: 'not_found' });
    return null;
  }
  if (target.user_id === req.user.id) {
    res.status(400).json({ error: 'self_action' });
    return null;
  }
  return target;
}

/** Is the launch free window still open? price = 0 while now < free_until. */
async function pricingNow() {
  const freeUntil = await settings.getDate('contact_unlock_free_until');
  const free = freeUntil ? Date.now() < freeUntil.getTime() : false;
  const price = free ? 0 : await settings.getNumber('contact_unlock_price', 25);
  return { free, price };
}

/**
 * POST /api/contact/unlock/:matId  (requireAuth)
 * Unlock a specific profile's contact details.
 *   - 403 { error:'blocked' } when the pair is FULL-blocked either way.
 *   - Already unlocked -> success, free, NO new daily count (idempotent).
 *   - Otherwise enforce the daily NEW-unlock limit
 *     (settings.phone_view_daily_limit, default 5): 429 { daily_limit_reached }.
 *   - price = 0 in the launch free window, else settings.contact_unlock_price.
 * Response: { ok, price, free, alreadyUnlocked, contact:{ phone,email,whatsapp,
 *             contactUnlocked, contactLockedReason } }.
 */
export async function unlockContact(req, res, next) {
  try {
    const target = await resolveTarget(req, res);
    if (!target) return;

    if (await isBlockedPair(req.user.id, target.user_id)) {
      return res.status(403).json({ error: 'blocked' });
    }

    const already = await isUnlocked(req.user.id, target.user_id);

    if (!already) {
      // New unlock -> subject to the daily limit (re-views are not).
      const limit = await settings.getNumber('phone_view_daily_limit', 5);
      const usedToday = await countTodayUnlocks(req.user.id);
      if (usedToday >= limit) {
        return res.status(429).json({ error: 'daily_limit_reached', limit });
      }

      const { free, price } = await pricingNow();
      // --- Razorpay payment seam -------------------------------------------
      // v1 launch is free, so no gateway call. When paid plans go live, verify
      // a Razorpay order/payment here (e.g. payments.verifyOrder(req.body))
      // BEFORE recording the unlock; reject on failed verification.
      // ---------------------------------------------------------------------
      await withTransaction((client) =>
        recordUnlock(client, req.user.id, target.user_id, price),
      );

      const contact = gateContact({
        target, viewer: req.user, unlocked: true, blocked: false,
      });
      return res.json({ ok: true, price, free, alreadyUnlocked: false, contact });
    }

    // Re-view of an already-unlocked contact: free, unlimited, no new count.
    const { free, price } = await pricingNow();
    const contact = gateContact({
      target, viewer: req.user, unlocked: true, blocked: false,
    });
    res.json({ ok: true, price: 0, free, basePrice: price, alreadyUnlocked: true, contact });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/contact/:matId  (requireAuth)
 * Return the gated contact block for a target without unlocking it. Reveals
 * real values only when already unlocked AND reciprocal privacy allows AND not
 * blocked; otherwise null / 'Verification Pending' per contactGate.
 * Response: { ok, matId, contact:{ phone, email, whatsapp, contactUnlocked,
 *             contactLockedReason } }.
 */
export async function getContact(req, res, next) {
  try {
    const target = await resolveTarget(req, res);
    if (!target) return;

    const blocked = await isBlockedPair(req.user.id, target.user_id);
    const unlocked = !blocked && (await isUnlocked(req.user.id, target.user_id));
    const contact = gateContact({ target, viewer: req.user, unlocked, blocked });
    res.json({ ok: true, matId: target.mat_id, contact });
  } catch (err) {
    next(err);
  }
}
