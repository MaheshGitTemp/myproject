// Notifications service. Talks to the real backend generic-notifications feed
// (GET /api/notifications, POST /api/notifications/read), always with
// credentials:'include' so the session cookie is sent. Every function has a
// mock-fallback branch gated on config.USE_MOCK_FALLBACK so the header dropdown
// still populates offline while the backend is down; otherwise a failure
// returns an empty/ok:false result and never throws.
//
// Follows the authService.js / matchesService.js pattern. NOTE: the Proposals
// page (src/pages/app/Notifications/Notifications.jsx) is wired to the INTERESTS
// feed via matchesService — THIS service backs the header NotificationsMenu
// dropdown + unread badge only.
import { config } from '../config/index.js';
import { NOTIFICATION_PREVIEW } from '../services/profileService.js';

/** GET/POST JSON against a notifications endpoint with the session cookie.
 *  Returns { httpOk, status, data }; throws on network failure (caller handles). */
async function request(path, { method = 'GET', body } = {}) {
  const opts = {
    method,
    headers: { Accept: 'application/json' },
    credentials: 'include',
  };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${config.API_BASE}${path}`, opts);
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { httpOk: res.ok, status: res.status, data };
}

/** GET /notifications -> { ok, results:[{id,type,payload,read,createdAt}], unread }. */
export async function getNotifications() {
  try {
    const { httpOk, data } = await request('/notifications');
    if (!httpOk) throw new Error('notifications request failed');
    return { ok: true, results: data.results || [], unread: data.unread || 0 };
  } catch (e) {
    console.error('getNotifications failed', e);
    if (config.USE_MOCK_FALLBACK) {
      const results = NOTIFICATION_PREVIEW;
      const unread = results.filter((n) => n.unread).length;
      return { ok: true, results, unread };
    }
    return { ok: false, results: [], unread: 0 };
  }
}

/** POST /notifications/read with { all:true } -> { ok, updated }. */
export async function markAllRead() {
  try {
    const { httpOk, data } = await request('/notifications/read', { method: 'POST', body: { all: true } });
    if (!httpOk) throw new Error('markAllRead failed');
    return { ok: true, updated: data.updated };
  } catch (e) {
    console.error('markAllRead failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true };
    return { ok: false };
  }
}
