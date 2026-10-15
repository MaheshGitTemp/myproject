// Auth helpers: password hashing (bcrypt), OTP generation + hashing, mat_id
// generation, email-domain blocklist check, and small validators.
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { config } from '../../config.js';
import { query, queryOne } from '../../db.js';

// ---- Passwords ----
export function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}
export function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// ---- OTP ----
/** Numeric OTP of config.otp.length digits (zero-padded). */
export function generateOtp() {
  const max = 10 ** config.otp.length;
  const n = crypto.randomInt(0, max);
  return String(n).padStart(config.otp.length, '0');
}
/** Hash the OTP so it is never stored in cleartext. */
export function hashOtp(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

// ---- mat_id ----
/** Next sequential member id, e.g. "MAT2001". Uses the mat_id_seq sequence. */
export async function nextMatId() {
  const row = await queryOne("SELECT nextval('mat_id_seq') AS n");
  return `MAT${row.n}`;
}

// ---- Email domain policy (blocklist) ----
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}
export function emailDomain(email) {
  return String(email).trim().toLowerCase().split('@')[1] || '';
}
/** True if the email's domain is on the admin-editable disposable blocklist. */
export async function isBlockedEmailDomain(email) {
  const domain = emailDomain(email);
  if (!domain) return true;
  const row = await queryOne('SELECT 1 FROM blocked_email_domains WHERE domain = $1', [domain]);
  return !!row;
}

// ---- Phone / password validators ----
export function isValidPhone(phone) {
  // Accepts +country and 7–15 digits; lenient for now, tighten per market later.
  return typeof phone === 'string' && /^\+?[0-9]{7,15}$/.test(phone.replace(/[\s-]/g, ''));
}
export function passwordIssue(pw) {
  if (typeof pw !== 'string' || pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'Password must include letters and numbers.';
  return null;
}

// ---- OTP persistence helpers ----
/**
 * Create and store a hashed OTP for a destination+purpose. Invalidates prior
 * unconsumed codes for the same destination+purpose.
 * @returns {Promise<string>} the plaintext code (to send via email)
 */
export async function issueOtp({ userId = null, destination, channel = 'email', purpose }) {
  const code = generateOtp();
  const codeHash = hashOtp(code);
  const expires = new Date(Date.now() + config.otp.ttlMinutes * 60_000);

  // consume any outstanding codes for this destination+purpose so only the newest is valid
  await query(
    `UPDATE otp_codes SET consumed_at = now()
       WHERE destination = $1 AND purpose = $2 AND consumed_at IS NULL`,
    [destination, purpose],
  );
  await query(
    `INSERT INTO otp_codes (user_id, destination, channel, purpose, code_hash, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, destination, channel, purpose, codeHash, expires],
  );
  return code;
}

/**
 * Verify an OTP for destination+purpose. Handles expiry + attempt limit.
 * @returns {Promise<{ ok: boolean, reason?: string, userId?: number|null }>}
 */
export async function verifyOtp({ destination, purpose, code }) {
  const row = await queryOne(
    `SELECT * FROM otp_codes
       WHERE destination = $1 AND purpose = $2 AND consumed_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
    [destination, purpose],
  );
  if (!row) return { ok: false, reason: 'no_code' };
  if (new Date(row.expires_at) < new Date()) return { ok: false, reason: 'expired' };
  if (row.attempts >= config.otp.maxAttempts) return { ok: false, reason: 'too_many_attempts' };

  if (row.code_hash !== hashOtp(code)) {
    await query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1', [row.id]);
    return { ok: false, reason: 'incorrect' };
  }

  await query('UPDATE otp_codes SET consumed_at = now() WHERE id = $1', [row.id]);
  return { ok: true, userId: row.user_id };
}
