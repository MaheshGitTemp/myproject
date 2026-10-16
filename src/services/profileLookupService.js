// Single place for profile lookup, ID handling, and the demo-data fallback
// (port of assets/js/core/profile-service.js). Pages never touch the API or mock data directly.
import { config } from '../config/index.js';
import { notifySessionExpired } from './apiError.js';
import { MOCK_PROFILES } from '../data/mockProfiles.js';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** "mat-2087", " 2087 ", "MAT2087" -> "MAT2087" */
export function normalizeId(raw) {
  const s = String(raw == null ? '' : raw).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!s) return '';
  return /^\d+$/.test(s) ? `MAT${s}` : s;
}

export const isValidId = (id) => /^MAT\d{1,8}$/.test(id);

/** Works for API results (uid / matId / id) and demo profiles. */
export function idOf(profile) {
  if (!profile) return '';
  return normalizeId(profile.id || profile.matId || profile.matID || profile.uid || '');
}

export const profileUrl = (id) => `/profile-details?id=${encodeURIComponent(normalizeId(id))}`;

/** -> { status: 'found', profile } | { status: 'not_found' } | { status: 'error' } */
export async function getProfileById(rawId) {
  const id = normalizeId(rawId);
  if (!isValidId(id)) return { status: 'not_found' };

  if (config.PROFILE_ENDPOINT) {
    try {
      const res = await fetch(`${config.PROFILE_ENDPOINT}?id=${encodeURIComponent(id)}`, { headers: { Accept: 'application/json' }, credentials: 'include' });
      if (res.status === 401) notifySessionExpired();
      if (res.status === 404) return { status: 'not_found' };
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const profile = data.profile || data.data || data;
      if (!profile || !Object.keys(profile).length) return { status: 'not_found' };
      return { status: 'found', profile: { id, ...profile } };
    } catch (e) {
      console.error('Profile lookup failed', e);
      if (!config.USE_MOCK_FALLBACK) return { status: 'error' };
    }
  } else if (!config.USE_MOCK_FALLBACK) {
    return { status: 'error' };
  }

  await wait(250); // lets the loading state show; remove with the mock
  const found = MOCK_PROFILES.find((p) => p.id === id);
  return found ? { status: 'found', profile: found } : { status: 'not_found' };
}

const has = (v) => v !== undefined && v !== null && String(v).trim() !== '';
const like = (field, q) => String(field || '').toLowerCase().includes(String(q).toLowerCase());

/** Local filtering of the demo profiles (fallback only). */
function searchMock(f) {
  return MOCK_PROFILES.filter((p) => {
    if (has(f.gender) && p.gender !== f.gender) return false;
    if (has(f.ageFrom) && p.age < Number(f.ageFrom)) return false;
    if (has(f.ageTo) && p.age > Number(f.ageTo)) return false;
    if (has(f.maritalStatus) && !like(p.maritalStatus, f.maritalStatus)) return false;
    if (has(f.caste) && !(like(p.caste, f.caste) || like(p.subCaste, f.caste))) return false;
    if (has(f.education) && !like(p.education, f.education)) return false;
    if (has(f.occupation) && !like(p.occupation, f.occupation)) return false;
    if (has(f.state) && !like(p.state, f.state)) return false;
    if (has(f.city) && !like(p.city, f.city)) return false;
    return true;
  });
}

const OPTIONAL_FIELDS = ['ageFrom', 'ageTo', 'maritalStatus', 'heightFrom', 'caste', 'rasi', 'nakshatra', 'education', 'occupation', 'country', 'state', 'city', 'annualIncome'];

/** Calls the search API; when it cannot be reached falls back to demo profiles (if enabled).
 *  -> { results, total, demo } */
export async function searchProfiles(form) {
  try {
    const payload = { gender: form.gender, page: form.page, limit: form.limit };
    OPTIONAL_FIELDS.forEach((f) => { if (form[f]) payload[f] = form[f]; });
    const res = await fetch(`${config.API_BASE}/Fetchlistdata`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    if (res.status === 401) notifySessionExpired();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const results = data.results || data.data || data.profiles || [];
    return { results, total: data.total || data.count || results.length, demo: false };
  } catch (e) {
    console.error(e);
    if (config.USE_MOCK_FALLBACK) {
      const results = searchMock(form);
      return { results, total: results.length, demo: true };
    }
    return { results: [], total: 0, demo: false, error: true };
  }
}
