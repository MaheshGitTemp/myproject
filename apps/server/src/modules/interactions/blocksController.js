// Request handlers for blocking / unblocking and the blocks list. Thin:
// resolve the target MAT id -> user id, call the repo, shape the response.
import { rowToCard, getUserIdByMatId } from '../profiles/profilesRepo.js';
import { normalizeMatId } from '../profiles/matId.js';
import {
  block, unblock, listBlocks, userBlockCounts,
} from './blocksRepo.js';

/** Resolve :matId -> target user id (no block check: you must be able to block). */
async function resolveTargetId(req, res) {
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
  return targetId;
}

/** POST /api/blocks/:matId  body { type:'full'|'message_only' } */
export async function createBlock(req, res, next) {
  try {
    const targetId = await resolveTargetId(req, res);
    if (targetId == null) return;
    const type = (req.body && req.body.type) === 'message_only' ? 'message_only' : 'full';
    await block(req.user.id, targetId, type, false);
    res.json({ ok: true, type });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/blocks/:matId */
export async function removeBlock(req, res, next) {
  try {
    const targetId = await resolveTargetId(req, res);
    if (targetId == null) return;
    const removed = await unblock(req.user.id, targetId);
    res.json({ ok: true, removed });
  } catch (err) {
    next(err);
  }
}

/** GET /api/blocks -> { results:[card...], counts:{blocked,blockedBy} } */
export async function getBlocks(req, res, next) {
  try {
    const [rows, counts] = await Promise.all([
      listBlocks(req.user.id),
      userBlockCounts(req.user.id),
    ]);
    const results = rows.map((row) => ({
      ...rowToCard(row),
      blockType: row.type,
      blockedByAdmin: row.blocked_by_admin,
      blockedAt: row.blocked_at,
    }));
    res.json({ results, counts });
  } catch (err) {
    next(err);
  }
}
