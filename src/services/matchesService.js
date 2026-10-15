// Matches + interactions service. Talks to the real backend matches/shortlist/
// interests/blocks/reports endpoints, always with credentials:'include' so the
// session cookie is sent. Every function has a mock-fallback branch gated on
// config.USE_MOCK_FALLBACK so the app still works offline while the backend is
// down; otherwise a failure returns an empty/ok:false result and never throws.
//
// Follows the authService.js / profileLookupService.js pattern.
import { config } from '../config/index.js';
import { MUTUALS, SHORTLISTED } from '../pages/app/Matches/matchesData.js';

// The mock rows only have a numeric uid; the live cards carry both uid (React
// key) and the MAT id string used by every WRITE endpoint. Augment the mock
// rows so fallback cards expose id/matId just like real rows do.
const withMatId = (p) => ({ ...p, id: `MAT${p.uid}`, matId: `MAT${p.uid}` });

/** GET/POST/DELETE JSON against a matches endpoint with the session cookie.
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

// --- Lists -----------------------------------------------------------------

/** GET /matches -> { ok, shortlisted:[card], mutual:[card] }. */
export async function getMatches() {
  try {
    const { httpOk, data } = await request('/matches');
    if (!httpOk) throw new Error('matches request failed');
    return { ok: true, shortlisted: data.shortlisted || [], mutual: data.mutual || [] };
  } catch (e) {
    console.error('getMatches failed', e);
    if (config.USE_MOCK_FALLBACK) {
      return { ok: true, shortlisted: SHORTLISTED.map(withMatId), mutual: MUTUALS.map(withMatId) };
    }
    return { ok: false, shortlisted: [], mutual: [] };
  }
}

/** GET /shortlist -> { ok, results:[card] }. */
export async function getShortlist() {
  try {
    const { httpOk, data } = await request('/shortlist');
    if (!httpOk) throw new Error('shortlist request failed');
    return { ok: true, results: data.results || data.data || [] };
  } catch (e) {
    console.error('getShortlist failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true, results: SHORTLISTED.map(withMatId) };
    return { ok: false, results: [] };
  }
}

/** GET /interests?box=incoming|outgoing -> { ok, results:[{...card, interestStatus}] }. */
export async function getInterests(box = 'incoming') {
  try {
    const { httpOk, data } = await request(`/interests?box=${encodeURIComponent(box)}`);
    if (!httpOk) throw new Error('interests request failed');
    return { ok: true, results: data.results || data.data || [] };
  } catch (e) {
    console.error('getInterests failed', e);
    if (config.USE_MOCK_FALLBACK) {
      const src = box === 'outgoing' ? SHORTLISTED : MUTUALS;
      const results = src.map((p) => ({ ...withMatId(p), interestStatus: 'pending' }));
      return { ok: true, results };
    }
    return { ok: false, results: [] };
  }
}

// --- Writes ----------------------------------------------------------------

/** POST /shortlist/:matId -> { ok, status }. */
export async function shortlist(matId) {
  try {
    const { httpOk, data } = await request(`/shortlist/${encodeURIComponent(matId)}`, { method: 'POST' });
    if (!httpOk) throw new Error('shortlist failed');
    return { ok: true, status: data.status };
  } catch (e) {
    console.error('shortlist failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true };
    return { ok: false };
  }
}

/** DELETE /shortlist/:matId -> { ok, status }. */
export async function unshortlist(matId) {
  try {
    const { httpOk, data } = await request(`/shortlist/${encodeURIComponent(matId)}`, { method: 'DELETE' });
    if (!httpOk) throw new Error('unshortlist failed');
    return { ok: true, status: data.status };
  } catch (e) {
    console.error('unshortlist failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true };
    return { ok: false };
  }
}

/** POST /interests/:matId -> { ok, status:'pending' }. */
export async function sendInterest(matId) {
  try {
    const { httpOk, data } = await request(`/interests/${encodeURIComponent(matId)}`, { method: 'POST' });
    if (!httpOk) throw new Error('sendInterest failed');
    return { ok: true, status: data.status };
  } catch (e) {
    console.error('sendInterest failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true };
    return { ok: false };
  }
}

/** POST /interests/:matId/accept -> { ok, status:'accepted' }. */
export async function acceptInterest(matId) {
  try {
    const { httpOk, data } = await request(`/interests/${encodeURIComponent(matId)}/accept`, { method: 'POST' });
    if (!httpOk) throw new Error('acceptInterest failed');
    return { ok: true, status: data.status };
  } catch (e) {
    console.error('acceptInterest failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true };
    return { ok: false };
  }
}

/** POST /interests/:matId/decline -> { ok, status:'declined' }. */
export async function declineInterest(matId) {
  try {
    const { httpOk, data } = await request(`/interests/${encodeURIComponent(matId)}/decline`, { method: 'POST' });
    if (!httpOk) throw new Error('declineInterest failed');
    return { ok: true, status: data.status };
  } catch (e) {
    console.error('declineInterest failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true };
    return { ok: false };
  }
}

/** POST /blocks/:matId -> { ok, status }. */
export async function block(matId) {
  try {
    const { httpOk, data } = await request(`/blocks/${encodeURIComponent(matId)}`, { method: 'POST' });
    if (!httpOk) throw new Error('block failed');
    return { ok: true, status: data.status };
  } catch (e) {
    console.error('block failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true };
    return { ok: false };
  }
}

/** DELETE /blocks/:matId -> { ok, status }. */
export async function unblock(matId) {
  try {
    const { httpOk, data } = await request(`/blocks/${encodeURIComponent(matId)}`, { method: 'DELETE' });
    if (!httpOk) throw new Error('unblock failed');
    return { ok: true, status: data.status };
  } catch (e) {
    console.error('unblock failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true };
    return { ok: false };
  }
}

/** POST /reports/:matId with { reason } -> { ok, status }. */
export async function report(matId, reason) {
  try {
    const { httpOk, data } = await request(`/reports/${encodeURIComponent(matId)}`, { method: 'POST', body: { reason } });
    if (!httpOk) throw new Error('report failed');
    return { ok: true, status: data.status };
  } catch (e) {
    console.error('report failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true };
    return { ok: false };
  }
}
