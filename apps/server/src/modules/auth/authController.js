// Auth request handlers. Thin: validate input, call helpers, shape the response.
// Matches the flow the frontend already expects (register -> OTP -> login).
import { config } from '../../config.js';
import { query, queryOne, withTransaction } from '../../db.js';
import { sendOtpEmail } from '../../mailer.js';
import {
  hashPassword, verifyPassword, nextMatId,
  isValidEmail, isBlockedEmailDomain, isValidPhone, passwordIssue,
  issueOtp, verifyOtp,
} from './authUtils.js';
import { createSession, destroySession, publicUser } from './session.js';
import { computeFullName, FIXED_CASTE } from '../profiles/profilesRepo.js';

// Coerce '' -> null so empty wizard fields don't persist as empty strings.
const nn = (v) => (v === undefined || v === '' ? null : v);
// In development only, surface the OTP so it can be tested without real SMTP.
// NEVER returns the code in production (strictly gated on NODE_ENV).
const isDev = (process.env.NODE_ENV || 'development') !== 'production';
function devOtpFields(code, email) {
  if (!isDev) return {};
  console.log(`[dev-otp] OTP for ${email}: ${code}`);
  return { devOtp: code };
}
// Coerce a value to an int (or null).
const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
};

/**
 * Build the profiles column set from the Register wizard form. Maps the
 * wizard's own-attribute keys to columns, computes full_name, fixes caste.
 */
function registerProfileFields(body) {
  return {
    profile_for: nn(body.profileFor),
    first_name: nn(body.firstName),
    last_name: nn(body.lastName),
    full_name: computeFullName(body.firstName, body.lastName),
    gender: nn(body.gender),
    dob: nn(body.dob),
    height: nn(body.profileHeight),
    marital_status: nn(body.profileMaritalStatus),
    education: nn(body.profileEducation),
    occupation: nn(body.profileOccupation),
    income: nn(body.salary),
    city: nn(body.city),
    state: nn(body.state),
    about: nn(body.aboutMe),
    sub_caste: nn(body.subCaste),
    gothram: nn(body.gothram),
    rasi: nn(body.rasi),
    nakshatra: nn(body.nakshatra),
    padam: nn(body.padam),
    caste: FIXED_CASTE,
  };
}

/**
 * Build the preferences column set from the Register wizard form. On the FORM,
 * `height/maritalStatus/education/occupation` are the PREFERENCE values.
 */
function registerPreferenceFields(body) {
  return {
    looking_for: nn(body.lookingFor),
    age_from: toInt(body.ageFrom),
    age_to: toInt(body.ageTo),
    pref_height_from: nn(body.height),
    marital_status: nn(body.maritalStatus),
    education: nn(body.education),
    occupation: nn(body.occupation),
    location: nn(body.preferredLocation),
  };
}

/**
 * POST /api/auth/register
 * Body: the full Register wizard form (firstName, lastName, email, phone,
 * password, gender, dob, profileHeight, ... lookingFor, ageFrom, ageTo, ...).
 * Creates a pending_otp user + profiles + preferences in ONE transaction and
 * sends an email OTP. OTP verify flips status pending_otp -> pending_approval.
 * Legacy minimal bodies (email/phone/password only) still create a stub profile
 * so the attachUser LEFT JOIN works.
 */
export async function register(req, res, next) {
  try {
    const { email, phone, password } = req.body || {};

    if (!isValidEmail(email)) return res.status(400).json({ error: 'invalid_email' });
    if (await isBlockedEmailDomain(email)) {
      return res.status(400).json({ error: 'blocked_email_domain', message: 'Please use a non-disposable email address.' });
    }
    if (phone && !isValidPhone(phone)) return res.status(400).json({ error: 'invalid_phone' });
    const pwIssue = passwordIssue(password);
    if (pwIssue) return res.status(400).json({ error: 'weak_password', message: pwIssue });

    const normalizedEmail = email.trim().toLowerCase();

    // Uniqueness checks (friendly errors instead of raw constraint violations)
    if (await queryOne('SELECT 1 FROM users WHERE email = $1', [normalizedEmail])) {
      return res.status(409).json({ error: 'email_taken' });
    }
    if (phone && await queryOne('SELECT 1 FROM users WHERE phone = $1', [phone])) {
      return res.status(409).json({ error: 'phone_taken' });
    }

    const matId = await nextMatId();
    const passwordHash = await hashPassword(password);

    const profileFields = registerProfileFields(req.body || {});
    const prefFields = registerPreferenceFields(req.body || {});

    const user = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO users (mat_id, email, phone, password_hash, status)
         VALUES ($1, $2, $3, $4, 'pending_otp')
         RETURNING *`,
        [matId, normalizedEmail, phone || null, passwordHash],
      );
      const newUser = rows[0];

      // profiles row (1:1). Build columns dynamically so this stays in sync
      // with whatever fields the wizard supplied.
      const pCols = ['user_id', ...Object.keys(profileFields)];
      const pVals = [newUser.id, ...Object.values(profileFields)];
      await client.query(
        `INSERT INTO profiles (${pCols.join(', ')})
         VALUES (${pCols.map((_, i) => `$${i + 1}`).join(', ')})`,
        pVals,
      );

      // preferences row (1:1).
      const fCols = ['user_id', ...Object.keys(prefFields)];
      const fVals = [newUser.id, ...Object.values(prefFields)];
      await client.query(
        `INSERT INTO preferences (${fCols.join(', ')})
         VALUES (${fCols.map((_, i) => `$${i + 1}`).join(', ')})`,
        fVals,
      );

      return newUser;
    });

    const code = await issueOtp({ userId: user.id, destination: normalizedEmail, purpose: 'register' });
    await sendOtpEmail(normalizedEmail, code, 'register');

    res.status(201).json({
      ok: true,
      matId: user.mat_id,
      next: 'verify_email',
      resendCooldownSeconds: config.otp.resendCooldownSeconds,
      ...devOtpFields(code, normalizedEmail),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/verify-otp
 * Body: { email, code }
 * On success: email_verified=true, is_verified recomputed, status -> pending_approval.
 */
export async function verifyEmailOtp(req, res, next) {
  try {
    const { email, code } = req.body || {};
    if (!isValidEmail(email) || !code) return res.status(400).json({ error: 'invalid_input' });
    const normalizedEmail = email.trim().toLowerCase();

    const result = await verifyOtp({ destination: normalizedEmail, purpose: 'register', code });
    if (!result.ok) return res.status(400).json({ error: 'otp_' + result.reason });

    // email verified -> recompute is_verified (true only when both email+phone verified);
    // v1 is email-only, so is_verified tracks email_verified for now.
    const user = await queryOne(
      `UPDATE users
          SET email_verified = true,
              is_verified = (true AND phone_verified),
              status = CASE WHEN status = 'pending_otp' THEN 'pending_approval' ELSE status END,
              updated_at = now()
        WHERE email = $1
        RETURNING *`,
      [normalizedEmail],
    );

    res.json({
      ok: true,
      status: user.status,
      message: 'Email verified. Your profile is awaiting admin approval before it goes public.',
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/resend-otp  Body: { email } */
export async function resendOtp(req, res, next) {
  try {
    const { email } = req.body || {};
    if (!isValidEmail(email)) return res.status(400).json({ error: 'invalid_email' });
    const normalizedEmail = email.trim().toLowerCase();
    const user = await queryOne('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    // Always respond ok (don't leak whether the email exists), but only send if it does.
    let devFields = {};
    if (user) {
      const code = await issueOtp({ userId: user.id, destination: normalizedEmail, purpose: 'register' });
      await sendOtpEmail(normalizedEmail, code, 'register');
      devFields = devOtpFields(code, normalizedEmail);
    }
    res.json({ ok: true, resendCooldownSeconds: config.otp.resendCooldownSeconds, ...devFields });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login  Body: { identifier (email or phone), password }
 * Creates a session cookie on success.
 */
export async function login(req, res, next) {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) return res.status(400).json({ error: 'invalid_input' });

    const id = String(identifier).trim();
    const user = await queryOne(
      'SELECT * FROM users WHERE email = $1 OR phone = $2',
      [id.toLowerCase(), id],
    );
    // generic error to avoid user enumeration
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    if (user.status === 'suspended' || user.status === 'closed') {
      return res.status(403).json({ error: 'account_' + user.status });
    }
    if (!user.email_verified) {
      return res.status(403).json({ error: 'email_not_verified', message: 'Please verify your email first.' });
    }

    await createSession(res, user.id, req);
    await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);
    res.json({ ok: true, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/logout */
export async function logout(req, res, next) {
  try {
    await destroySession(req, res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/** GET /api/auth/me */
export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

/**
 * POST /api/auth/change-password  (requireAuth)
 * Body: { currentPassword, newPassword }
 * Verifies the current password, validates the new one, updates the hash, then
 * invalidates every OTHER session (keeps req.sessionId so the caller stays in).
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body || {};

    const row = await queryOne('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!row || !(await verifyPassword(currentPassword, row.password_hash))) {
      return res.status(400).json({ error: 'wrong_password' });
    }

    const pwIssue = passwordIssue(newPassword);
    if (pwIssue) return res.status(400).json({ error: 'weak_password', message: pwIssue });

    const passwordHash = await hashPassword(newPassword);
    await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2',
      [passwordHash, req.user.id]);
    // Keep the current session; log out everywhere else.
    await query('DELETE FROM sessions WHERE user_id = $1 AND id <> $2',
      [req.user.id, req.sessionId]);

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/forgot-password  Body: { email } -> sends reset OTP */
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body || {};
    if (!isValidEmail(email)) return res.status(400).json({ error: 'invalid_email' });
    const normalizedEmail = email.trim().toLowerCase();
    const user = await queryOne('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    let devFields = {};
    if (user) {
      const code = await issueOtp({ userId: user.id, destination: normalizedEmail, purpose: 'reset' });
      await sendOtpEmail(normalizedEmail, code, 'reset');
      devFields = devOtpFields(code, normalizedEmail);
    }
    res.json({ ok: true, ...devFields }); // don't leak existence
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/reset-password  Body: { email, code, newPassword } */
export async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword } = req.body || {};
    if (!isValidEmail(email) || !code) return res.status(400).json({ error: 'invalid_input' });
    const pwIssue = passwordIssue(newPassword);
    if (pwIssue) return res.status(400).json({ error: 'weak_password', message: pwIssue });

    const normalizedEmail = email.trim().toLowerCase();
    const result = await verifyOtp({ destination: normalizedEmail, purpose: 'reset', code });
    if (!result.ok) return res.status(400).json({ error: 'otp_' + result.reason });

    const passwordHash = await hashPassword(newPassword);
    await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE email = $2',
      [passwordHash, normalizedEmail]);
    // invalidate all existing sessions for safety
    const u = await queryOne('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (u) await query('DELETE FROM sessions WHERE user_id = $1', [u.id]);

    res.json({ ok: true, message: 'Password reset. Please sign in.' });
  } catch (err) {
    next(err);
  }
}
