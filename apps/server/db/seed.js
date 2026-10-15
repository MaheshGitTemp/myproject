// Seeds non-schema data: runtime settings defaults + a starter disposable-email
// blocklist. Safe to re-run (upserts). Mock-profile seeding will be added in the
// profiles phase. Run after migrations: `npm run seed`.
import { config } from '../src/config.js';
import { pool } from '../src/db.js';
import { hashPassword } from '../src/modules/auth/authUtils.js';

// A small starter set of known disposable/temp-mail domains. The blocklist is
// admin-editable at runtime; this is just an initial seed. Expand as needed.
const DISPOSABLE_DOMAINS = [
  'tempmail.com', 'temp-mail.org', 'guerrillamail.com', 'mailinator.com',
  '10minutemail.com', 'throwawaymail.com', 'yopmail.com', 'getnada.com',
  'trashmail.com', 'sharklasers.com', 'maildrop.cc', 'fakeinbox.com',
  'dispostable.com', 'mailnesia.com', 'tempinbox.com', 'moakt.com',
  'emailondeck.com', 'spam4.me', 'mohmal.com', 'tempr.email',
];

async function seedSettings() {
  const entries = Object.entries(config.settingsDefaults);
  for (const [key, value] of entries) {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO NOTHING`, // don't clobber admin-edited values on re-seed
      [key, String(value)],
    );
  }
  console.log(`[seed] settings: ensured ${entries.length} default key(s).`);
}

async function seedBlockedDomains() {
  let n = 0;
  for (const domain of DISPOSABLE_DOMAINS) {
    const r = await pool.query(
      `INSERT INTO blocked_email_domains (domain) VALUES ($1)
       ON CONFLICT (domain) DO NOTHING`,
      [domain.toLowerCase()],
    );
    n += r.rowCount;
  }
  console.log(`[seed] blocked_email_domains: added ${n} new, ${DISPOSABLE_DOMAINS.length} total in seed list.`);
}

// ---------------------------------------------------------------------------
// Mock profiles -> real users + profiles (dev data). Replicated verbatim from
// src/data/mockProfiles.js (we cannot import across workspaces, so the literal
// values are copied here). Each becomes a public member: status='active',
// email_verified=true, is_verified=true, admin_approved=true. Password is the
// shared dev password 'Password123'. Idempotent via ON CONFLICT DO NOTHING on
// mat_id / email / user_id, so re-running `npm run seed` is safe.
// ---------------------------------------------------------------------------
const DEV_PASSWORD = 'Password123';

const IMG = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w || 400}&q=80`;
const PH = {
  shruthi: '1544005313-94ddf0286df2', priya: '1534528741775-53994a69daeb', ananya: '1524504388940-b1c1722653e1',
  kavya: '1517841905240-472988babdf9', f5: '1531746020798-e6953c6e8e04', f6: '1438761681033-6461ffad8d80',
  m1: '1500648767791-00dcc994a43e', m2: '1535713875002-d1d0cf377fde', m3: '1507003211169-0a1dd7228f2d',
};
const baseMock = {
  caste: 'Viswabrahmin', maritalStatus: 'Never Married', premium: false, online: false,
  membership: 'Free Member', motherTongue: 'Telugu', familyStatus: 'Middle Class', familyValues: 'Moderate',
};
const makeMock = (o) => ({
  ...baseMock,
  ...o,
  image: IMG(o.photo, 400),
  gallery: o.gallery.map((g) => IMG(g, 600)),
});

const MOCK_PROFILES = [
  makeMock({
    id: 'MAT2087', name: 'Shruthi', fullName: 'Shruthi Reddy', gender: 'Female', age: 26, height: '5\'4"',
    occupation: 'Surgeon', education: 'MBBS, MS (Surgery)', income: '25 - 30 Lakhs', city: 'Hyderabad', state: 'Telangana',
    workLocation: 'Hyderabad, Telangana', nativePlace: 'Warangal, Telangana', weight: '55 kg', familyStatus: 'Upper Middle Class', familyValues: 'Traditional',
    premium: true, online: true, membership: 'Gold Member', diet: 'Pure Vegetarian', subCaste: 'Goldsmith (Achari)',
    familyType: 'Nuclear Family', fatherOccupation: 'Retired (Govt. Employee)', motherOccupation: 'Homemaker', siblings: '1 Brother (Unmarried)',
    about: 'I am a practicing surgeon based in Hyderabad, passionate about my work and committed to making a difference. I come from a traditional Viswabrahmin family but hold progressive views on life. I enjoy classical music, traveling to heritage sites, and spending quality time with my family. Looking for a compatible partner who values traditions and has a growth mindset.',
    rasi: 'Vrishabha (Taurus)', nakshatra: 'Rohini', padam: '2', dob: '15 March 2000', tob: '06:45 AM', pob: 'Warangal, Telangana',
    photo: PH.shruthi, gallery: [PH.shruthi, PH.priya, PH.ananya],
  }),
  makeMock({
    id: 'MAT2091', name: 'Priya', fullName: 'Priya Chary', gender: 'Female', age: 24, height: '5\'3"',
    occupation: 'Software Engineer', education: 'B.Tech (CSE)', income: '12 - 15 Lakhs', city: 'Bangalore', state: 'Karnataka',
    workLocation: 'Bangalore, Karnataka', nativePlace: 'Guntur, Andhra Pradesh', weight: '52 kg', familyStatus: 'Middle Class', familyValues: 'Traditional',
    online: true, diet: 'Pure Vegetarian', subCaste: 'Carpenter (Vadla)', familyType: 'Joint Family',
    fatherOccupation: 'Business', motherOccupation: 'Homemaker', siblings: '1 Sister (Married)',
    about: 'Software engineer in Bangalore who loves problem solving, filter coffee and weekend treks. Family-oriented and looking for a kind, supportive partner.',
    rasi: 'Simha (Leo)', nakshatra: 'Magha', padam: '3', dob: '02 August 2002', tob: '09:10 PM', pob: 'Guntur, Andhra Pradesh',
    photo: PH.priya, gallery: [PH.priya, PH.f5, PH.f6],
  }),
  makeMock({
    id: 'MAT2105', name: 'Ananya', fullName: 'Ananya Rao', gender: 'Female', age: 28, height: '5\'5"',
    occupation: 'Architect', education: 'B.Arch, M.Arch', income: '18 - 22 Lakhs', city: 'Chennai', state: 'Tamil Nadu',
    workLocation: 'Chennai, Tamil Nadu', nativePlace: 'Nellore, Andhra Pradesh', weight: '56 kg', familyStatus: 'Affluent', familyValues: 'Moderate',
    premium: true, membership: 'Gold Member', diet: 'Vegetarian', subCaste: 'Goldsmith (Achari)', familyType: 'Nuclear Family',
    fatherOccupation: 'Retired Professor', motherOccupation: 'Teacher', siblings: 'No Siblings',
    about: 'Architect who enjoys designing sustainable spaces, sketching and classical dance. Looking for a thoughtful partner with a good sense of humour.',
    rasi: 'Tula (Libra)', nakshatra: 'Swati', padam: '1', dob: '21 October 1998', tob: '04:30 AM', pob: 'Chennai, Tamil Nadu',
    photo: PH.ananya, gallery: [PH.ananya, PH.shruthi, PH.kavya],
  }),
  makeMock({
    id: 'MAT2118', name: 'Kavya', fullName: 'Kavya Teja', gender: 'Female', age: 26, height: '5\'2"',
    occupation: 'Chartered Accountant', education: 'B.Com, CA', income: '14 - 18 Lakhs', city: 'Visakhapatnam', state: 'Andhra Pradesh',
    workLocation: 'Visakhapatnam, Andhra Pradesh', nativePlace: 'Rajahmundry, Andhra Pradesh', weight: '50 kg', familyStatus: 'Middle Class', familyValues: 'Traditional',
    online: true, diet: 'Pure Vegetarian', subCaste: 'Sculptor (Silpi)', familyType: 'Nuclear Family',
    fatherOccupation: 'Bank Manager (Retired)', motherOccupation: 'Homemaker', siblings: '1 Brother (Married)',
    about: 'Chartered accountant from Visakhapatnam. I love beach evenings, cooking traditional recipes and reading. Seeking a respectful and ambitious partner.',
    rasi: 'Kanya (Virgo)', nakshatra: 'Hasta', padam: '4', dob: '11 January 2000', tob: '11:55 AM', pob: 'Visakhapatnam, Andhra Pradesh',
    photo: PH.kavya, gallery: [PH.kavya, PH.f6, PH.priya],
  }),
  makeMock({
    id: 'MAT2124', name: 'Karthik', fullName: 'Karthik Chary', gender: 'Male', age: 29, height: '5\'10"',
    occupation: 'Software Architect', education: 'B.Tech, M.S.', income: '35 - 40 Lakhs', city: 'Hyderabad', state: 'Telangana',
    workLocation: 'Hyderabad, Telangana', nativePlace: 'Khammam, Telangana', weight: '74 kg', familyStatus: 'Upper Middle Class', familyValues: 'Moderate',
    premium: true, online: true, membership: 'Gold Member', diet: 'Vegetarian', subCaste: 'Carpenter (Vadla)', familyType: 'Nuclear Family',
    fatherOccupation: 'Business', motherOccupation: 'Homemaker', siblings: '1 Sister (Unmarried)',
    about: 'Software architect based in Hyderabad. I enjoy cricket, travel and cooking on weekends. Looking for an educated, independent partner who values family.',
    rasi: 'Mesha (Aries)', nakshatra: 'Ashwini', padam: '2', dob: '07 June 1997', tob: '07:20 AM', pob: 'Hyderabad, Telangana',
    photo: PH.m1, gallery: [PH.m1, PH.m2, PH.m3],
  }),
  makeMock({
    id: 'MAT2131', name: 'Sai Kiran', fullName: 'Sai Kiran Achari', gender: 'Male', age: 31, height: '5\'9"', maritalStatus: 'Divorced',
    occupation: 'Civil Engineer', education: 'B.E. (Civil)', income: '16 - 20 Lakhs', city: 'Vijayawada', state: 'Andhra Pradesh',
    workLocation: 'Vijayawada, Andhra Pradesh', nativePlace: 'Eluru, Andhra Pradesh', weight: '78 kg', familyStatus: 'Middle Class', familyValues: 'Traditional',
    diet: 'Non-Vegetarian', subCaste: 'Goldsmith (Achari)', familyType: 'Joint Family',
    fatherOccupation: 'Jeweller', motherOccupation: 'Homemaker', siblings: '2 Brothers (Married)',
    about: 'Civil engineer working on infrastructure projects. Calm, grounded and close to my family. Looking for an understanding partner for a fresh start.',
    rasi: 'Dhanu (Sagittarius)', nakshatra: 'Moola', padam: '1', dob: '19 December 1995', tob: '02:15 PM', pob: 'Vijayawada, Andhra Pradesh',
    photo: PH.m2, gallery: [PH.m2, PH.m1, PH.m3],
  }),
];

/** Deterministic dev email from the MAT id, e.g. "MAT2087" -> "mat2087@example.com". */
function seedEmail(matId) {
  return `${String(matId).toLowerCase()}@example.com`;
}

/** First / last name split from fullName (last_name = everything after the first word). */
function splitName(fullName, name) {
  const parts = String(fullName || name || '').trim().split(/\s+/);
  const first = name || parts[0] || null;
  const last = parts.length > 1 ? parts.slice(1).join(' ') : null;
  return { first, last };
}

/** Approximate a DATE dob from an integer age (mid-year), so computed age matches. */
function dobFromAge(age) {
  const n = parseInt(age, 10);
  if (!Number.isFinite(n)) return null;
  const year = new Date().getFullYear() - n;
  return `${year}-06-15`;
}

async function seedMockProfiles() {
  const passwordHash = await hashPassword(DEV_PASSWORD);
  let created = 0;

  for (const m of MOCK_PROFILES) {
    const email = seedEmail(m.id);
    // Insert the user. ON CONFLICT (mat_id) covers re-runs; a second guard on
    // email keeps the seed idempotent even if ids change.
    const userRes = await pool.query(
      `INSERT INTO users
         (mat_id, email, password_hash, status,
          email_verified, phone_verified, is_verified,
          admin_approved, admin_approved_at)
       VALUES ($1, $2, $3, 'active', true, false, true, true, now())
       ON CONFLICT (mat_id) DO NOTHING
       RETURNING id`,
      [m.id, email, passwordHash],
    );

    // Resolve the user id whether we just inserted or it already existed.
    let userId = userRes.rows[0]?.id;
    if (!userId) {
      const existing = await pool.query('SELECT id FROM users WHERE mat_id = $1', [m.id]);
      userId = existing.rows[0]?.id;
    }
    if (!userId) continue;

    const { first, last } = splitName(m.fullName, m.name);

    const r = await pool.query(
      `INSERT INTO profiles (
         user_id, first_name, last_name, full_name, gender, dob, dob_display,
         tob, pob, height, weight, marital_status, mother_tongue,
         education, occupation, income, work_location,
         city, state, native_place, caste, sub_caste,
         rasi, nakshatra, padam, diet,
         family_type, family_status, family_values,
         father_occupation, mother_occupation, siblings, about,
         membership, premium, online, image, gallery
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7,
         $8, $9, $10, $11, $12, $13,
         $14, $15, $16, $17,
         $18, $19, $20, $21, $22,
         $23, $24, $25, $26,
         $27, $28, $29,
         $30, $31, $32, $33,
         $34, $35, $36, $37, $38::jsonb
       )
       ON CONFLICT (user_id) DO NOTHING`,
      [
        userId, first, last, m.fullName, m.gender, dobFromAge(m.age), m.dob,
        m.tob, m.pob, m.height, m.weight, m.maritalStatus, m.motherTongue,
        m.education, m.occupation, m.income, m.workLocation,
        m.city, m.state, m.nativePlace, m.caste, m.subCaste,
        m.rasi, m.nakshatra, m.padam, m.diet,
        m.familyType, m.familyStatus, m.familyValues,
        m.fatherOccupation, m.motherOccupation, m.siblings, m.about,
        m.membership, m.premium, m.online, m.image, JSON.stringify(m.gallery),
      ],
    );
    created += r.rowCount;
  }

  // Keep mat_id_seq ahead of the seeded ids so new real registrations don't
  // collide with MAT2087..MAT2131. GREATEST guards against lowering the seq.
  await pool.query(
    `SELECT setval(
       'mat_id_seq',
       GREATEST(
         (SELECT COALESCE(MAX(NULLIF(regexp_replace(mat_id, '\\D', '', 'g'), '')::bigint), 2000) FROM users),
         2000
       ) + 1,
       false
     )`,
  );

  console.log(`[seed] mock profiles: ${created} profile row(s) inserted (${MOCK_PROFILES.length} in seed list).`);
}

// ---------------------------------------------------------------------------
// Seed one administrator so the (later) admin dashboard + the /api/admin
// endpoints have a working account to authenticate as. We flag the known
// seeded member MAT2087 (Shruthi, email mat2087@example.com, dev password
// 'Password123'). Idempotent: re-running just re-asserts the flag.
// ---------------------------------------------------------------------------
const ADMIN_MAT_ID = 'MAT2087';

async function seedAdmin() {
  const r = await pool.query(
    `UPDATE users SET is_admin = true WHERE mat_id = $1`,
    [ADMIN_MAT_ID],
  );
  if (r.rowCount) {
    console.log(`[seed] admin: ${ADMIN_MAT_ID} (mat2087@example.com) flagged is_admin=true.`);
  } else {
    console.log(`[seed] admin: ${ADMIN_MAT_ID} not found — run after mock profiles are seeded.`);
  }
}

try {
  await seedSettings();
  await seedBlockedDomains();
  await seedMockProfiles();
  await seedAdmin();
  console.log('[seed] done.');
} catch (err) {
  console.error('[seed] FAILED:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
