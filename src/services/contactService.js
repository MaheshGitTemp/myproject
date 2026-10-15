// Contact-unlock service. Talks to the backend contact endpoints, always with
// credentials:'include'. Normalizes the { contact:{...} } wrapper into a flat
// shape the UI consumes, maps the 403/429 guard responses to friendly reasons,
// and has a mock-fallback branch gated on config.USE_MOCK_FALLBACK.
//
// Follows the authService.js / profileLookupService.js pattern.
import { config } from '../config/index.js';

// Flatten { ok, price, free, alreadyUnlocked, contact:{phone,email,whatsapp,
// contactUnlocked,contactLockedReason} } into the fields the UI renders.
function normalize(data) {
  const contact = data.contact || {};
  return {
    ok: true,
    status: 200,
    price: data.price,
    free: data.free,
    alreadyUnlocked: data.alreadyUnlocked,
    phone: contact.phone,
    email: contact.email,
    whatsapp: contact.whatsapp,
    locked: !contact.contactUnlocked,
    reason: contact.contactLockedReason,
  };
}

async function request(path, { method = 'GET' } = {}) {
  const res = await fetch(`${config.API_BASE}${path}`, {
    method,
    headers: { Accept: 'application/json' },
    credentials: 'include',
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { res, data };
}

const MOCK_CONTACT = {
  ok: true,
  phone: '+91 98765 43210',
  email: 'member@email.com',
  whatsapp: '+91 98765 43210',
  locked: false,
};

/** POST /contact/unlock/:matId. 403 -> blocked, 429 -> daily_limit_reached. */
export async function unlockContact(matId) {
  try {
    const { res, data } = await request(`/contact/unlock/${encodeURIComponent(matId)}`, { method: 'POST' });
    if (res.status === 403) return { ok: false, status: 403, reason: 'blocked' };
    if (res.status === 429) return { ok: false, status: 429, reason: 'daily_limit_reached', limit: data.limit };
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return normalize(data);
  } catch (e) {
    console.error('unlockContact failed', e);
    if (config.USE_MOCK_FALLBACK) return { ...MOCK_CONTACT };
    return { ok: false };
  }
}

/** GET /contact/:matId. Locked fields come back null / sentinel. */
export async function getContact(matId) {
  try {
    const { res, data } = await request(`/contact/${encodeURIComponent(matId)}`);
    if (res.status === 403) return { ok: false, status: 403, reason: 'blocked' };
    if (res.status === 429) return { ok: false, status: 429, reason: 'daily_limit_reached', limit: data.limit };
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return normalize(data);
  } catch (e) {
    console.error('getContact failed', e);
    if (config.USE_MOCK_FALLBACK) return { ...MOCK_CONTACT };
    return { ok: false };
  }
}
