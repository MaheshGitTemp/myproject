// Profiles request handlers. Thin: validate, call repo, shape the response.
// Endpoints are mounted at /api/profiles (see profilesRoutes.js + app.js).
import { query, withTransaction } from '../../db.js';
import {
  getProfileByUserId, getPreferencesByUserId, getProfileByMatId,
  upsertProfile, upsertPreferences,
  buildProfileFields, buildPreferenceFields,
  rowToDetail, prefsToForm, updatePrivacy,
} from './profilesRepo.js';
import { normalizeMatId } from './matId.js';
import { isBlockedPair } from '../interactions/blocksRepo.js';
import { isUnlocked } from '../contact/contactRepo.js';
import { gateContact } from '../contact/contactGate.js';

const VALID_GENDERS = new Set(['Male', 'Female']);

/**
 * GET /api/profiles/me (requireAuth)
 * Returns the authenticated user's own profile + preferences. Own contact is
 * always visible (contact.self = true).
 */
export async function getMyProfile(req, res, next) {
  try {
    const row = await getProfileByUserId(req.user.id);
    if (!row) {
      return res.json({ ok: true, profile: null, preferences: null });
    }
    const pref = await getPreferencesByUserId(req.user.id);
    res.json({
      ok: true,
      profile: rowToDetail(row, { contact: { self: true } }),
      preferences: prefsToForm(pref),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/profiles/me (requireAuth)
 * Upsert the authenticated user's profile + preferences from an EditProfile
 * payload. Computes full_name, forces caste='Viswabrahmin'.
 */
export async function updateMyProfile(req, res, next) {
  try {
    const body = req.body || {};
    if (body.gender !== undefined && body.gender !== '' && !VALID_GENDERS.has(body.gender)) {
      return res.status(400).json({ error: 'invalid_gender' });
    }

    const profileFields = buildProfileFields(body);
    const prefFields = buildPreferenceFields(body);

    const row = await withTransaction(async (client) => {
      const saved = await upsertProfile(client, req.user.id, profileFields);
      await upsertPreferences(client, req.user.id, prefFields);
      return saved;
    });

    const full = await getProfileByUserId(req.user.id);
    const pref = await getPreferencesByUserId(req.user.id);
    res.json({
      ok: true,
      profile: rowToDetail(full || row, { contact: { self: true } }),
      preferences: prefsToForm(pref),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/profiles (requireAuth)
 * Same upsert as PUT /me, kept for completeness (Register wires through
 * /api/auth/register instead).
 */
export async function createProfile(req, res, next) {
  return updateMyProfile(req, res, next);
}

// Coerce an incoming privacy flag to boolean when a boolean / 'true' / 'false'
// is present, else null (undefined -> null so COALESCE leaves it unchanged).
function coercePrivacyFlag(val) {
  if (val === true || val === 'true') return true;
  if (val === false || val === 'false') return false;
  return null;
}

/**
 * PUT /api/profiles/me/privacy (requireAuth)
 * Update ONLY the authenticated user's contact-visibility flags
 * (users.hide_phone / users.hide_email). The member app maps a single
 * "Hide Contact Information" toggle to both. Returns { ok, hidePhone, hideEmail }.
 */
export async function updateMyPrivacy(req, res, next) {
  try {
    const body = req.body || {};
    const hidePhone = coercePrivacyFlag(body.hidePhone);
    const hideEmail = coercePrivacyFlag(body.hideEmail);
    if (hidePhone === null && hideEmail === null) {
      return res.status(400).json({ error: 'no_fields' });
    }
    const saved = await updatePrivacy(req.user.id, { hidePhone, hideEmail });
    res.json({ ok: true, hidePhone: saved.hidePhone, hideEmail: saved.hideEmail });
  } catch (err) {
    next(err);
  }
}

/**
 * Resolve + shape a single public profile by MAT id for the given viewer.
 * Returns the rowToDetail object, or null when not found / not visible to this
 * viewer (owner always sees their own regardless of approval status).
 */
async function resolvePublicProfile(rawId, viewer) {
  const matId = normalizeMatId(rawId);
  if (!matId) return null;

  const row = await getProfileByMatId(matId);
  if (!row) return null;

  const isSelf = viewer && viewer.mat_id === row.mat_id;
  if (isSelf) {
    return rowToDetail(row, { contact: { self: true } });
  }

  // only publicly visible members are exposed to other/anonymous viewers
  if (row.status !== 'active' || row.admin_approved !== true) return null;
  // Blocking hides profiles both ways (business rule 5): a logged-in viewer
  // who has FULL-blocked this member — or been blocked by them — gets 404.
  const blocked = viewer ? await isBlockedPair(viewer.id, row.user_id) : false;
  if (blocked) return null;

  // Contact gating (business rule 4): reveal phone/email/whatsapp only when the
  // viewer has unlocked this profile AND reciprocal privacy allows. Anonymous
  // viewers are never unlocked. Server-side decision — gateContact().
  const unlocked = viewer ? await isUnlocked(viewer.id, row.user_id) : false;
  const contact = gateContact({ target: row, viewer, unlocked, blocked });

  // Best-effort profile-view record: a logged-in non-owner viewed a visible
  // profile. Swallow any insert error so the profile fetch never breaks.
  if (viewer && viewer.id !== row.user_id) {
    try {
      await query(
        'INSERT INTO profile_views (viewer_id, viewed_id) VALUES ($1, $2)',
        [viewer.id, row.user_id],
      );
    } catch {
      // ignore — recording a view must never fail the profile read
    }
  }

  return rowToDetail(row, { contact });
}

/**
 * GET /api/profiles/:matId  AND  GET /api/profiles?id=MAT2087
 * Both the REST path param and the PROFILE_ENDPOINT ?id= style resolve here.
 * Returns { profile } so profileLookupService's `data.profile` parsing works.
 * 404 { error:'not_found' } when missing or not public for this viewer.
 */
export async function getProfileByMat(req, res, next) {
  try {
    const rawId = req.params.matId || req.query.id;
    if (!rawId) return res.status(400).json({ error: 'missing_id' });

    const profile = await resolvePublicProfile(rawId, req.user);
    if (!profile) return res.status(404).json({ error: 'not_found' });

    res.json({ profile });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/profiles  (base path)
 * When `?id=` is present, resolve a single profile (PROFILE_ENDPOINT style).
 * Without an id there is no public listing here (search is POST /Fetchlistdata).
 */
export async function getProfilesBase(req, res, next) {
  if (req.query.id) return getProfileByMat(req, res, next);
  return res.status(400).json({ error: 'missing_id' });
}
