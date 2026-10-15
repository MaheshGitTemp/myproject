// Request handlers for the notifications feed. Thin: call the repo, shape the
// response (camelCase payload passthrough).
import {
  listNotifications, unreadCount, markRead,
} from './notificationsRepo.js';

/** GET /api/notifications -> { results:[...], unread } */
export async function getNotifications(req, res, next) {
  try {
    const [rows, unread] = await Promise.all([
      listNotifications(req.user.id),
      unreadCount(req.user.id),
    ]);
    const results = rows.map((r) => ({
      id: r.id,
      type: r.type,
      payload: r.payload,
      read: r.read,
      createdAt: r.created_at,
    }));
    res.json({ results, unread });
  } catch (err) {
    next(err);
  }
}

/** POST /api/notifications/read  body { id } or { all:true } */
export async function markNotificationsRead(req, res, next) {
  try {
    const body = req.body || {};
    const all = body.all === true;
    const id = body.id != null ? parseInt(body.id, 10) : null;
    if (!all && !Number.isFinite(id)) {
      return res.status(400).json({ error: 'missing_id' });
    }
    const updated = await markRead(req.user.id, { id: all ? null : id, all });
    res.json({ ok: true, updated });
  } catch (err) {
    next(err);
  }
}
