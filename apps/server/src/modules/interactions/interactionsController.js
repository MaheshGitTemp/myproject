// Request handlers for shortlists, interests and matches. Thin: resolve the
// target MAT id -> user id, enforce blocking, call the repo, shape the response
// with profilesRepo.rowToCard so the frontend (Matches.jsx / search cards) can
// render the result directly.
import {
  rowToCard, getUserIdByMatId, getPublicIdentity,
} from '../profiles/profilesRepo.js';
import { normalizeMatId } from '../profiles/matId.js';
import { isBlockedPair } from './blocksRepo.js';
import {
  addShortlist, removeShortlist, listShortlist,
  sendInterest, setInterestStatus, getInterest, listInterests,
  getShortlistedMatches, getMutualMatches,
} from './interactionsRepo.js';
import { notify } from './notificationsRepo.js';

/**
 * Resolve the :matId route param to a target user id, rejecting self-targeting
 * and blocked pairs. Returns { targetId } on success, or sends the error
 * response and returns null (caller should `return` when null).
 */
async function resolveTarget(req, res) {
  const matId = normalizeMatId(req.params.matId);
  if (!matId) {
    res.status(400).json({ error: 'invalid_mat_id' });
    return null;
  }
  const targetId = await getUserIdByMatId(matId);
  if (!targetId) {
    res.status(404).json({ error: 'not_found' });
    return null;
  }
  if (targetId === req.user.id) {
    res.status(400).json({ error: 'self_action' });
    return null;
  }
  if (await isBlockedPair(req.user.id, targetId)) {
    res.status(403).json({ error: 'blocked' });
    return null;
  }
  return { targetId };
}

// ---- Shortlists ------------------------------------------------------------

/** POST /api/shortlist/:matId */
export async function addToShortlist(req, res, next) {
  try {
    const t = await resolveTarget(req, res);
    if (!t) return;
    await addShortlist(req.user.id, t.targetId);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/shortlist/:matId */
export async function removeFromShortlist(req, res, next) {
  try {
    const t = await resolveTarget(req, res);
    if (!t) return;
    const removed = await removeShortlist(req.user.id, t.targetId);
    res.json({ ok: true, removed });
  } catch (err) {
    next(err);
  }
}

/** GET /api/shortlist -> { results:[card] } */
export async function getShortlist(req, res, next) {
  try {
    const rows = await listShortlist(req.user.id);
    res.json({ results: rows.map(rowToCard) });
  } catch (err) {
    next(err);
  }
}

// ---- Interests -------------------------------------------------------------

/** POST /api/interests/:matId — send interest + notify the receiver. */
export async function expressInterest(req, res, next) {
  try {
    const t = await resolveTarget(req, res);
    if (!t) return;

    const created = await sendInterest(req.user.id, t.targetId);
    if (created) {
      // Notify the receiver that they got a new interest (business rule: notify
      // on received interest).
      const sender = await getPublicIdentity(req.user.id);
      await notify(t.targetId, 'interest_received', {
        fromUserId: req.user.id,
        fromMatId: sender ? sender.mat_id : null,
        fromName: sender ? sender.first_name : null,
      });
    }
    res.json({ ok: true, status: 'pending' });
  } catch (err) {
    next(err);
  }
}

/**
 * Accept or decline an interest the current user RECEIVED. `action` is
 * 'accepted' or 'declined'. On accept, notify the original sender.
 */
async function respondToInterest(req, res, next, action) {
  try {
    const t = await resolveTarget(req, res);
    if (!t) return;

    // The current user is the receiver; the :matId user is the sender.
    const existing = await getInterest(t.targetId, req.user.id);
    if (!existing) return res.status(404).json({ error: 'no_interest' });

    const updated = await setInterestStatus(req.user.id, t.targetId, action);
    if (!updated) return res.status(404).json({ error: 'no_interest' });

    if (action === 'accepted') {
      // Notify the original sender that their interest was accepted.
      const receiver = await getPublicIdentity(req.user.id);
      await notify(t.targetId, 'interest_accepted', {
        fromUserId: req.user.id,
        fromMatId: receiver ? receiver.mat_id : null,
        fromName: receiver ? receiver.first_name : null,
      });
    }
    res.json({ ok: true, status: action });
  } catch (err) {
    next(err);
  }
}

/** POST /api/interests/:matId/accept */
export function acceptInterest(req, res, next) {
  return respondToInterest(req, res, next, 'accepted');
}

/** POST /api/interests/:matId/decline */
export function declineInterest(req, res, next) {
  return respondToInterest(req, res, next, 'declined');
}

/** GET /api/interests?box=incoming|outgoing -> { results:[{...card, interestStatus}] } */
export async function getInterests(req, res, next) {
  try {
    const box = req.query.box === 'outgoing' ? 'outgoing' : 'incoming';
    const rows = await listInterests(req.user.id, box);
    const results = rows.map((row) => ({
      ...rowToCard(row),
      interestStatus: row.interest_status,
    }));
    res.json({ box, results });
  } catch (err) {
    next(err);
  }
}

// ---- Matches ---------------------------------------------------------------

// Decorate a card with the extra display fields Matches.jsx expects but that
// aren't stored (isNew / lastActive). `online` already comes from the profile.
function toMatchCard(row) {
  const card = rowToCard(row);
  return {
    ...card,
    isNew: false,
    lastActive: card.online ? 'Active now' : 'Recently active',
  };
}

/** GET /api/matches -> { shortlisted:[card], mutual:[card] } */
export async function getMatches(req, res, next) {
  try {
    const [shortlistedRows, mutualRows] = await Promise.all([
      getShortlistedMatches(req.user.id),
      getMutualMatches(req.user.id),
    ]);
    res.json({
      shortlisted: shortlistedRows.map(toMatchCard),
      mutual: mutualRows.map(toMatchCard),
    });
  } catch (err) {
    next(err);
  }
}
