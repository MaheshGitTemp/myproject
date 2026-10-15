// Cookie-based sessions stored in Postgres. A random session id lives in a signed
// cookie; the sessions table holds the server-side record (user, expiry).
import crypto from 'node:crypto';
import { config } from '../../config.js';
import { query, queryOne } from '../../db.js';

const COOKIE = config.session.cookieName;

function cookieOptions() {
  return {
    httpOnly: true,
    secure: config.session.cookieSecure, // true in prod (HTTPS)
    sameSite: 'lax',
    signed: true,
    maxAge: config.session.ttlDays * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

/** Create a session row + set the signed cookie on the response. */
export async function createSession(res, userId, req) {
  const id = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + config.session.ttlDays * 24 * 60 * 60 * 1000);
  await query(
    `INSERT INTO sessions (id, user_id, user_agent, ip, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, userId, req?.headers['user-agent'] || null, req?.ip || null, expires],
  );
  res.cookie(COOKIE, id, cookieOptions());
  return id;
}

/** Destroy the current session (DB row + clear cookie). */
export async function destroySession(req, res) {
  const id = req.signedCookies?.[COOKIE];
  if (id) await query('DELETE FROM sessions WHERE id = $1', [id]);
  res.clearCookie(COOKIE, { ...cookieOptions(), maxAge: undefined });
}

/**
 * Express middleware: resolve the session cookie to a user and attach `req.user`
 * (or null). Expired sessions are deleted. Never throws for anonymous requests.
 */
export async function attachUser(req, _res, next) {
  req.user = null;
  try {
    const id = req.signedCookies?.[COOKIE];
    if (id) {
      const row = await queryOne(
        `SELECT s.id AS session_id, s.expires_at, u.*,
                p.first_name, p.last_name
           FROM sessions s
           JOIN users u ON u.id = s.user_id
           LEFT JOIN profiles p ON p.user_id = u.id
          WHERE s.id = $1`,
        [id],
      );
      if (row) {
        if (new Date(row.expires_at) < new Date()) {
          await query('DELETE FROM sessions WHERE id = $1', [id]);
        } else {
          // strip the password hash before exposing the user on the request
          const { password_hash, session_id, expires_at, ...user } = row;
          req.user = user;
          req.sessionId = session_id;
        }
      }
    }
  } catch (err) {
    console.error('[session] attachUser error:', err.message);
  }
  next();
}

/** Guard: require an authenticated user. */
export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'unauthenticated' });
  next();
}

/** Shape the user object the frontend receives (safe fields only). */
export function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    matId: u.mat_id,
    email: u.email,
    phone: u.phone,
    status: u.status,
    emailVerified: u.email_verified,
    phoneVerified: u.phone_verified,
    isVerified: u.is_verified,
    adminApproved: u.admin_approved,
    isAdmin: u.is_admin,
    firstName: u.first_name || null,  // populated once profiles land
    lastName: u.last_name || null,
  };
}
