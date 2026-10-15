// Account service. Hydrates the REAL logged-in member from the backend
// identity (GET /api/auth/me) + own profile (GET /api/profiles/me), merges
// them into the `member` shape the header, menus and /me render, and keeps a
// USE_MOCK_FALLBACK fallback to CURRENT_MEMBER so the app still works while the
// backend is unreachable.
//
// Follows the matchesService.js / authService.js pattern (request() helper,
// credentials:'include', res.json() in try/catch, mock-fallback branch that
// never throws).
import { config } from '../config/index.js';

// Neutral avatar used whenever the member has no profile photo. A remote URL so
// no asset import is required and it works in every build.
export const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

// Minimal, crash-proof member used before hydration completes and when logged
// out. EVERY field the header/menus/Me read is present with a safe default so
// member.firstName[0], member.unread.chat, member.photoSmall, member.stats.*
// and member.unread.dashboard never throw.
export const FALLBACK_MEMBER = {
  firstName: '',
  lastName: '',
  fullName: '',
  memberId: '',
  tier: '',
  membership: '',
  premium: false,
  age: null,
  location: '',
  photo: DEFAULT_AVATAR,
  photoSmall: DEFAULT_AVATAR,
  stats: { views: 0, shortlisted: 0, mutual: 0 },
  unread: { notifications: 0, chat: 0, dashboard: 0 },
};

/** GET/PUT JSON against an account endpoint with the session cookie.
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

/**
 * Merge the auth user (identity) + own profile (photo/age/city/membership) into
 * the `member` shape every header/menu/Me consumer renders. Pure function: no
 * fetch, no throw. EVERY field has a safe default so no read ever crashes.
 */
export function buildMember(user, profile) {
  const u = user || {};
  const p = profile || {};
  const firstName = u.firstName || p.firstName || '';
  const lastName = u.lastName || p.lastName || '';
  const fullName = p.fullName || [firstName, lastName].filter(Boolean).join(' ').trim();
  const location = [p.city, p.state].filter(Boolean).join(', ');
  const photo = p.image || DEFAULT_AVATAR;
  return {
    firstName,
    lastName,
    fullName,
    memberId: u.matId || p.matId || '',
    tier: p.membership || 'Free',
    membership: p.membership || 'Free',
    premium: !!p.premium,
    age: p.age ?? null,
    location,
    photo,
    photoSmall: photo,
    stats: { views: 0, shortlisted: 0, mutual: 0 },
    unread: { notifications: 0, chat: 0, dashboard: 0 },
  };
}

/** GET /auth/me -> the authenticated user object, or null (incl. 401). */
export async function getMe() {
  try {
    const { httpOk, data } = await request('/auth/me');
    if (!httpOk) return null;
    return data.user || null;
  } catch (e) {
    console.error('getMe failed', e);
    throw e; // let the caller distinguish a network error (fallback) from a 401
  }
}

/** GET /profiles/me -> { profile, preferences } or null (incl. 401). */
export async function getMyProfile() {
  try {
    const { httpOk, data } = await request('/profiles/me');
    if (!httpOk) return null;
    return { profile: data.profile || null, preferences: data.preferences || null };
  } catch (e) {
    console.error('getMyProfile failed', e);
    throw e;
  }
}

/**
 * GET privacy flags (hidePhone/hideEmail). Reads them off GET /profiles/me for
 * now; FEAT-002 wires a dedicated endpoint. Never throws.
 */
export async function getPrivacy() {
  try {
    const { httpOk, data } = await request('/profiles/me');
    if (!httpOk) throw new Error('privacy request failed');
    const p = data.profile || {};
    return { ok: true, hidePhone: !!p.hidePhone, hideEmail: !!p.hideEmail };
  } catch (e) {
    console.error('getPrivacy failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true, hidePhone: false, hideEmail: false };
    return { ok: false, hidePhone: false, hideEmail: false };
  }
}

/**
 * PUT /profiles/me/privacy with { hidePhone, hideEmail }. The backend route
 * lands in FEAT-002; until then the USE_MOCK_FALLBACK branch keeps the frontend
 * safe. Never throws.
 */
export async function updatePrivacy({ hidePhone, hideEmail } = {}) {
  try {
    const { httpOk, data } = await request('/profiles/me/privacy', {
      method: 'PUT',
      body: { hidePhone, hideEmail },
    });
    if (!httpOk) throw new Error('privacy update failed');
    return { ok: true, hidePhone: !!data.hidePhone, hideEmail: !!data.hideEmail };
  } catch (e) {
    console.error('updatePrivacy failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true, hidePhone: !!hidePhone, hideEmail: !!hideEmail };
    return { ok: false };
  }
}
