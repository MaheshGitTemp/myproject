// Profiles data access + mappers. Raw parameterized SQL (no ORM).
// Mapper output uses the EXACT camelCase field names the frontend renders
// (see ProfileTabs / profileDetailsData.js, matchesData.js, mockProfiles.js).
import { query, queryOne } from '../../db.js';

// Columns we accept from an EditProfile / Register payload, keyed by the DB
// column name -> the incoming camelCase field name. caste is forced server-side,
// full_name is computed, so neither appears here.
const PROFILE_FIELD_MAP = {
  profile_for: 'profileFor',
  first_name: 'firstName',
  last_name: 'lastName',
  gender: 'gender',
  dob: 'dob',
  dob_display: 'dobDisplay',
  tob: 'tob',
  pob: 'pob',
  height: 'height',
  weight: 'weight',
  marital_status: 'maritalStatus',
  mother_tongue: 'motherTongue',
  education: 'education',
  field_of_study: 'fieldOfStudy',
  college: 'college',
  occupation: 'occupation',
  employed_in: 'employedIn',
  company: 'company',
  income: 'income',
  work_location: 'workLocation',
  city: 'city',
  state: 'state',
  native_place: 'nativePlace',
  sub_caste: 'subCaste',
  gothram: 'gothram',
  rasi: 'rasi',
  nakshatra: 'nakshatra',
  padam: 'padam',
  manglik: 'manglik',
  diet: 'diet',
  smoking: 'smoking',
  drinking: 'drinking',
  hobbies: 'hobbies',
  headline: 'headline',
  about: 'about',
  family_type: 'familyType',
  family_status: 'familyStatus',
  family_values: 'familyValues',
  father_occupation: 'fatherOccupation',
  mother_occupation: 'motherOccupation',
  siblings: 'siblings',
  physical_status: 'physicalStatus',
  body_type: 'bodyType',
  residency: 'residency',
};

// All profile columns (used to build INSERT/UPDATE column lists). Includes the
// computed/forced ones (full_name, caste) handled explicitly by callers.
const PROFILE_COLUMNS = [
  'profile_for', 'first_name', 'last_name', 'full_name', 'gender', 'dob', 'dob_display',
  'tob', 'pob', 'height', 'weight', 'marital_status', 'mother_tongue', 'education',
  'field_of_study', 'college', 'occupation', 'employed_in', 'company', 'income',
  'work_location', 'city', 'state', 'native_place', 'caste', 'sub_caste', 'gothram',
  'rasi', 'nakshatra', 'padam', 'manglik', 'diet', 'smoking', 'drinking', 'hobbies',
  'headline', 'about', 'family_type', 'family_status', 'family_values',
  'father_occupation', 'mother_occupation', 'siblings', 'physical_status', 'body_type',
  'residency', 'membership', 'premium', 'online', 'image', 'gallery',
];

const PREFERENCE_FIELD_MAP = {
  looking_for: 'lookingFor',
  age_from: 'ageFrom',
  age_to: 'ageTo',
  pref_height_from: 'prefHeightFrom',
  pref_height_to: 'prefHeightTo',
  marital_status: 'prefMaritalStatus',
  education: 'prefEducation',
  occupation: 'prefOccupation',
  diet: 'prefDiet',
  location: 'prefLocation',
};

const PREFERENCE_COLUMNS = Object.keys(PREFERENCE_FIELD_MAP);

const FIXED_CASTE = 'Viswabrahmin';

// Correlated subselects that expose the member's primary APPROVED photo id and
// the ordered list of approved photo ids. Added to every card/detail query so
// rowToCard/rowToDetail can prefer real photos over the seeded URL fallback
// (P5 item 5). `u` must be the users alias in the surrounding query.
const PHOTO_MEDIA_SELECT = `
  (SELECT ph.id FROM photos ph
     WHERE ph.user_id = u.id AND ph.status = 'approved'
     ORDER BY ph.is_primary DESC, ph.sort_order ASC, ph.created_at DESC
     LIMIT 1) AS primary_photo_id,
  (SELECT COALESCE(array_agg(ph.id ORDER BY ph.is_primary DESC, ph.sort_order ASC, ph.created_at DESC), '{}')
     FROM photos ph
     WHERE ph.user_id = u.id AND ph.status = 'approved') AS gallery_photo_ids`;

/**
 * Build the { column: value } object to persist from an incoming payload.
 * Only maps keys present in `body` (so a partial PUT leaves other columns alone
 * on UPDATE). full_name and caste are injected by the caller.
 */
function pickProfileFields(body) {
  const out = {};
  for (const [col, field] of Object.entries(PROFILE_FIELD_MAP)) {
    if (body[field] !== undefined) out[col] = body[field] === '' ? null : body[field];
  }
  return out;
}

function pickPreferenceFields(body) {
  const out = {};
  for (const [col, field] of Object.entries(PREFERENCE_FIELD_MAP)) {
    if (body[field] === undefined) continue;
    let val = body[field];
    if (col === 'age_from' || col === 'age_to') {
      const n = parseInt(val, 10);
      val = Number.isFinite(n) ? n : null;
    } else if (val === '') {
      val = null;
    }
    out[col] = val;
  }
  return out;
}

// ---- Reads -----------------------------------------------------------------

/** Full profile row joined with the user (status/verification/privacy/mat_id). */
export async function getProfileByUserId(userId) {
  return queryOne(
    `SELECT p.*, u.id AS user_id, u.mat_id, u.email, u.phone, u.status, u.is_verified,
            u.admin_approved, u.hide_phone, u.hide_email,
            ${PHOTO_MEDIA_SELECT}
       FROM profiles p
       JOIN users u ON u.id = p.user_id
      WHERE p.user_id = $1`,
    [userId],
  );
}

/** Full profile row looked up by the public MAT id (e.g. "MAT2087"). */
export async function getProfileByMatId(matId) {
  return queryOne(
    `SELECT p.*, u.id AS user_id, u.mat_id, u.email, u.phone, u.status, u.is_verified,
            u.admin_approved, u.hide_phone, u.hide_email,
            ${PHOTO_MEDIA_SELECT}
       FROM users u
       JOIN profiles p ON p.user_id = u.id
      WHERE u.mat_id = $1`,
    [matId],
  );
}

/** Resolve a public MAT id (e.g. "MAT2087") to the numeric users.id, or null. */
export async function getUserIdByMatId(matId) {
  const row = await queryOne('SELECT id FROM users WHERE mat_id = $1', [matId]);
  return row ? row.id : null;
}

/** Minimal public identity (mat_id + name) for a user id — used in notifications. */
export async function getPublicIdentity(userId) {
  return queryOne(
    `SELECT u.id AS user_id, u.mat_id, p.first_name, p.full_name
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = $1`,
    [userId],
  );
}

/** Preferences row for a user (or null). */
export async function getPreferencesByUserId(userId) {
  return queryOne('SELECT * FROM preferences WHERE user_id = $1', [userId]);
}

// ---- Search ----------------------------------------------------------------

// Fields the search accepts and how each is matched. `ilike` does a
// case-insensitive partial match; `eq` an exact (case-insensitive) match.
// age is handled specially (computed from dob). All values parameterized.
function clampInt(val, def, min, max) {
  const n = parseInt(val, 10);
  if (!Number.isFinite(n)) return def;
  return Math.min(Math.max(n, min), max);
}

/**
 * Parameterized search over profiles JOIN users. Returns only publicly
 * visible members (status='active' AND admin_approved=true). When `viewerId`
 * is set, excludes the viewer and (P3) blocked pairs.
 *
 * @param {object} opts
 * @param {object} opts.filters  raw filter payload from the frontend
 * @param {number} opts.page     1-based page number
 * @param {number} opts.limit    page size
 * @param {number|null} opts.viewerId  logged-in user's id (or null)
 * @returns {Promise<{ results: object[], total: number }>}
 */
export async function searchProfiles({ filters = {}, page = 1, limit = 20, viewerId = null } = {}) {
  const where = ["u.status = 'active'", 'u.admin_approved = true'];
  const params = [];
  const add = (val) => {
    params.push(val);
    return `$${params.length}`;
  };

  if (viewerId != null) {
    const vp = add(viewerId);
    where.push(`u.id <> ${vp}`);
    // Exclude profiles the viewer has FULL-blocked or that have FULL-blocked
    // the viewer (business rule 5 — blocking hides profiles in search both
    // ways). Correlated NOT EXISTS over the P3 blocks table.
    where.push(
      `NOT EXISTS (
         SELECT 1 FROM blocks b
          WHERE b.type = 'full'
            AND ((b.blocker_id = ${vp} AND b.blocked_id = u.id)
              OR (b.blocker_id = u.id AND b.blocked_id = ${vp}))
       )`,
    );
  }

  const has = (v) => v !== undefined && v !== null && String(v).trim() !== '';

  if (has(filters.gender)) where.push(`p.gender = ${add(filters.gender)}`);

  // age range -> compare the computed age from dob (parameterized bounds).
  if (has(filters.ageFrom)) {
    where.push(`date_part('year', age(p.dob)) >= ${add(parseInt(filters.ageFrom, 10))}`);
  }
  if (has(filters.ageTo)) {
    where.push(`date_part('year', age(p.dob)) <= ${add(parseInt(filters.ageTo, 10))}`);
  }

  if (has(filters.maritalStatus)) where.push(`p.marital_status ILIKE ${add(`%${filters.maritalStatus}%`)}`);
  if (has(filters.caste)) {
    const p1 = add(`%${filters.caste}%`);
    const p2 = add(`%${filters.caste}%`);
    where.push(`(p.caste ILIKE ${p1} OR p.sub_caste ILIKE ${p2})`);
  }
  if (has(filters.education)) where.push(`p.education ILIKE ${add(`%${filters.education}%`)}`);
  if (has(filters.occupation)) where.push(`p.occupation ILIKE ${add(`%${filters.occupation}%`)}`);
  if (has(filters.state)) where.push(`p.state ILIKE ${add(`%${filters.state}%`)}`);
  if (has(filters.city)) where.push(`p.city ILIKE ${add(`%${filters.city}%`)}`);
  if (has(filters.annualIncome)) where.push(`p.income ILIKE ${add(`%${filters.annualIncome}%`)}`);
  if (has(filters.rasi)) where.push(`p.rasi = ${add(filters.rasi)}`);
  if (has(filters.nakshatra)) where.push(`p.nakshatra = ${add(filters.nakshatra)}`);

  const whereSql = where.join(' AND ');

  // total (for pagination), then the page.
  const totalRow = await queryOne(
    `SELECT COUNT(*)::int AS total
       FROM profiles p
       JOIN users u ON u.id = p.user_id
      WHERE ${whereSql}`,
    params,
  );
  const total = totalRow ? totalRow.total : 0;

  const safeLimit = clampInt(limit, 20, 1, 50);
  const safePage = clampInt(page, 1, 1, 1_000_000);
  const offset = (safePage - 1) * safeLimit;

  const limitParam = add(safeLimit);
  const offsetParam = add(offset);

  const { rows } = await query(
    `SELECT p.*, u.id AS user_id, u.mat_id, u.email, u.phone, u.status,
            u.is_verified, u.admin_approved, u.hide_phone, u.hide_email,
            ${PHOTO_MEDIA_SELECT}
       FROM profiles p
       JOIN users u ON u.id = p.user_id
      WHERE ${whereSql}
      ORDER BY p.premium DESC, p.online DESC, u.created_at DESC
      LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params,
  );

  return { results: rows.map(rowToCard), total };
}

// ---- Writes (transaction-scoped) -------------------------------------------

/**
 * Insert or update a user's profile. `client` is a transaction client.
 * `fields` must already be column-keyed (use pickProfileFields) and include
 * `full_name` + `caste` where the caller wants them set.
 */
export async function upsertProfile(client, userId, fields) {
  const cols = ['user_id', ...Object.keys(fields)];
  const vals = [userId, ...Object.values(fields)];
  const placeholders = cols.map((_, i) => `$${i + 1}`);
  const updates = Object.keys(fields)
    .map((c) => `${c} = EXCLUDED.${c}`)
    .concat('updated_at = now()')
    .join(', ');

  const sql = `
    INSERT INTO profiles (${cols.join(', ')})
    VALUES (${placeholders.join(', ')})
    ON CONFLICT (user_id) DO UPDATE SET ${updates}
    RETURNING *`;
  const { rows } = await client.query(sql, vals);
  return rows[0];
}

/** Insert or update a user's partner preferences. */
export async function upsertPreferences(client, userId, prefs) {
  if (!prefs || Object.keys(prefs).length === 0) {
    // ensure a row exists so reads are consistent
    const { rows } = await client.query(
      `INSERT INTO preferences (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
       RETURNING *`,
      [userId],
    );
    return rows[0];
  }
  const cols = ['user_id', ...Object.keys(prefs)];
  const vals = [userId, ...Object.values(prefs)];
  const placeholders = cols.map((_, i) => `$${i + 1}`);
  const updates = Object.keys(prefs)
    .map((c) => `${c} = EXCLUDED.${c}`)
    .concat('updated_at = now()')
    .join(', ');

  const sql = `
    INSERT INTO preferences (${cols.join(', ')})
    VALUES (${placeholders.join(', ')})
    ON CONFLICT (user_id) DO UPDATE SET ${updates}
    RETURNING *`;
  const { rows } = await client.query(sql, vals);
  return rows[0];
}

/**
 * Update ONLY the contact-visibility privacy flags on the users row. Pass each
 * flag as true/false to set it, or null to leave the column unchanged (COALESCE
 * keeps the existing value). Parameterized: $1 user id, $2 hide_phone,
 * $3 hide_email. Returns { hidePhone, hideEmail } reflecting the stored row.
 */
export async function updatePrivacy(userId, { hidePhone = null, hideEmail = null } = {}) {
  const { rows } = await query(
    `UPDATE users
        SET hide_phone = COALESCE($2, hide_phone),
            hide_email = COALESCE($3, hide_email),
            updated_at = now()
      WHERE id = $1
      RETURNING hide_phone, hide_email`,
    [userId, hidePhone, hideEmail],
  );
  const row = rows[0] || {};
  return { hidePhone: row.hide_phone === true, hideEmail: row.hide_email === true };
}

// ---- Helpers for building persisted field sets -----------------------------

/** Compute full_name from first/last (trimmed). Returns null when both blank. */
export function computeFullName(firstName, lastName) {
  const full = [firstName, lastName].filter((s) => s && String(s).trim()).join(' ').trim();
  return full || null;
}

/**
 * Turn an EditProfile/Register payload into the profile column set to persist,
 * injecting the computed full_name and the fixed caste.
 */
export function buildProfileFields(body) {
  const fields = pickProfileFields(body);
  fields.caste = FIXED_CASTE;
  // Compute full_name from whatever names are supplied in this payload.
  if (body.firstName !== undefined || body.lastName !== undefined) {
    fields.full_name = computeFullName(body.firstName, body.lastName);
  }
  return fields;
}

/** Turn an EditProfile payload into the preference column set to persist. */
export function buildPreferenceFields(body) {
  return pickPreferenceFields(body);
}

// ---- Mappers (row -> frontend shape) ---------------------------------------

/** Compute an integer age from a DATE dob (or null). */
function ageFromDob(dob) {
  if (!dob) return null;
  const d = dob instanceof Date ? dob : new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

function parseGallery(gallery) {
  if (Array.isArray(gallery)) return gallery;
  if (!gallery) return [];
  try {
    const parsed = typeof gallery === 'string' ? JSON.parse(gallery) : gallery;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// URL for an authorized photo-file (P5 serving route). The primary APPROVED
// photo becomes the profile image used in search cards + detail; approved
// photos form the gallery. Falls back to the seeded profiles.image/gallery
// URLs when the member has no approved photos yet (so seed data still renders).
const photoUrl = (id) => `/api/photos/file/${id}`;

/** Parse a Postgres int[] (from array_agg) into a JS array of numbers. */
function toIdArray(val) {
  if (Array.isArray(val)) return val.filter((v) => v != null).map(Number);
  return [];
}

/**
 * Resolve { image, gallery } for a joined row, preferring real approved photos
 * (P5 item 5) and falling back to the seeded URLs. The card/detail queries
 * expose `primary_photo_id` (BIGINT or null) and `gallery_photo_ids` (int[]).
 */
function resolveMedia(row) {
  const galleryIds = toIdArray(row.gallery_photo_ids);
  const primaryId = row.primary_photo_id != null ? Number(row.primary_photo_id) : null;
  if (primaryId != null || galleryIds.length > 0) {
    const image = primaryId != null ? photoUrl(primaryId) : photoUrl(galleryIds[0]);
    return { image, gallery: galleryIds.map(photoUrl) };
  }
  // No approved photos -> seeded fallback URLs.
  return { image: row.image, gallery: parseGallery(row.gallery) };
}

/**
 * Search / matches card. Carries both `id` (MAT id string) and `uid` (numeric
 * users.id) plus `job`/`location` aliases the Matches UI expects.
 */
export function rowToCard(row) {
  if (!row) return null;
  const media = resolveMedia(row);
  return {
    id: row.mat_id,
    uid: row.user_id,
    matId: row.mat_id,
    name: row.first_name,
    fullName: row.full_name,
    gender: row.gender,
    age: ageFromDob(row.dob),
    height: row.height,
    weight: row.weight,
    occupation: row.occupation,
    job: row.occupation,
    education: row.education,
    income: row.income,
    city: row.city,
    state: row.state,
    location: row.city,
    workLocation: row.work_location,
    nativePlace: row.native_place,
    caste: row.caste,
    subCaste: row.sub_caste,
    gothram: row.gothram,
    diet: row.diet,
    motherTongue: row.mother_tongue,
    familyStatus: row.family_status,
    familyValues: row.family_values,
    familyType: row.family_type,
    maritalStatus: row.marital_status,
    rasi: row.rasi,
    nakshatra: row.nakshatra,
    padam: row.padam,
    premium: row.premium,
    online: row.online,
    verified: row.is_verified,
    membership: row.membership,
    image: media.image,
    gallery: media.gallery,
    compatibility: null,
  };
}

/**
 * Full single-profile detail object (ProfileTabs rows + header card).
 * `contact` carries the already-computed gated contact block (see
 * contact/contactGate.js — gateContact()):
 *   { phone, email, whatsapp, contactUnlocked, contactLockedReason }.
 * For own-profile reads the controller passes { self: true } instead, which is
 * a shorthand for "all own contact visible". Any other case MUST pass a gated
 * block so the server, not the client, decides visibility (business rule 4).
 */
export function rowToDetail(row, { contact = {} } = {}) {
  if (!row) return null;
  const media = resolveMedia(row);
  const self = contact.self === true;
  // Resolve the contact fields: own profile -> real values; otherwise use the
  // gated block the caller computed (defaults to fully locked when absent).
  const gated = self
    ? {
        phone: row.phone,
        email: row.email,
        whatsapp: row.phone,
        contactUnlocked: true,
        contactLockedReason: null,
      }
    : {
        phone: contact.phone ?? null,
        email: contact.email ?? null,
        whatsapp: contact.whatsapp ?? null,
        contactUnlocked: contact.contactUnlocked === true,
        contactLockedReason: contact.contactUnlocked ? null : (contact.contactLockedReason || 'locked'),
      };
  return {
    // identity / header
    id: row.mat_id,
    uid: row.user_id,
    matId: row.mat_id,
    name: row.first_name,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: row.full_name,
    image: media.image,
    gallery: media.gallery,
    online: row.online,
    premium: row.premium,
    membership: row.membership,
    headline: row.headline,

    // ABOUT rows
    gender: row.gender,
    maritalStatus: row.marital_status,
    height: row.height,
    weight: row.weight,
    diet: row.diet,
    smoking: row.smoking,
    drinking: row.drinking,
    hobbies: row.hobbies,
    motherTongue: row.mother_tongue,
    education: row.education,
    fieldOfStudy: row.field_of_study,
    college: row.college,
    occupation: row.occupation,
    employedIn: row.employed_in,
    company: row.company,
    income: row.income,
    city: row.city,
    state: row.state,
    workLocation: row.work_location,
    residency: row.residency,
    physicalStatus: row.physical_status,
    bodyType: row.body_type,
    about: row.about,
    age: ageFromDob(row.dob),
    compatibility: null,

    // FAMILY rows
    caste: row.caste,
    subCaste: row.sub_caste,
    gothram: row.gothram,
    familyType: row.family_type,
    nativePlace: row.native_place,
    familyStatus: row.family_status,
    familyValues: row.family_values,
    fatherOccupation: row.father_occupation,
    motherOccupation: row.mother_occupation,
    siblings: row.siblings,

    // ASTRO rows
    rasi: row.rasi,
    nakshatra: row.nakshatra,
    padam: row.padam,
    manglik: row.manglik,
    dob: row.dob_display || (row.dob ? String(row.dob).slice(0, 10) : null),
    tob: row.tob,
    pob: row.pob,

    // contact (server-gated — see contactGate.js; own profile always visible)
    phone: gated.phone,
    email: gated.email,
    whatsapp: gated.whatsapp,
    contactUnlocked: gated.contactUnlocked,
    contactLockedReason: gated.contactLockedReason,

    // privacy flags (sourced from the users row; getProfileByUserId/ByMatId
    // already SELECT u.hide_phone, u.hide_email). Used by the member app's
    // Privacy & Security "Hide Contact Information" toggle.
    hidePhone: row.hide_phone === true,
    hideEmail: row.hide_email === true,
  };
}

/** Shape own-profile preferences for the EditProfile form (camelCase keys). */
export function prefsToForm(pref) {
  if (!pref) return {};
  return {
    lookingFor: pref.looking_for,
    prefAgeFrom: pref.age_from != null ? String(pref.age_from) : '',
    prefAgeTo: pref.age_to != null ? String(pref.age_to) : '',
    prefHeightFrom: pref.pref_height_from,
    prefHeightTo: pref.pref_height_to,
    prefMaritalStatus: pref.marital_status,
    prefEducation: pref.education,
    prefOccupation: pref.occupation,
    prefDiet: pref.diet,
    prefLocation: pref.location,
  };
}

export { PROFILE_COLUMNS, PREFERENCE_COLUMNS, FIXED_CASTE, PHOTO_MEDIA_SELECT };
