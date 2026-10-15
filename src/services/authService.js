// Authentication service. Talks to the real backend auth endpoints
// (POST /api/auth/register, /verify-otp, /resend-otp, /login, /logout,
// /forgot-password, /reset-password and GET /api/auth/me), always with
// credentials:'include' so the session cookie is sent/stored.
//
// The exported function NAMES and SIGNATURES are unchanged from the original
// mock so the pages that import them keep working. When the API cannot be
// reached, each call falls back to the old mock behaviour ONLY if
// config.USE_MOCK_FALLBACK is true — so the app still runs offline while the
// backend is down; otherwise a failure returns { ok:false }.
import { config } from '../config/index.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Stand-in used only by the mock fallback path (API unreachable + fallback on).
const MOCK_USER = { id: 'MAT1001', firstName: 'Mahesh', lastName: 'Kumar' };

// The registration flow spans three screens: step 1 collects the email, step 2
// verifies the OTP, and the wizard finishes with registerProfile(). verifyOtp()
// / resendOtp() receive a bare code / form, so we remember the registering
// email here to pass to /verify-otp (which keys on email).
let lastRegisterEmail = null;

/** POST JSON to an auth endpoint with the session cookie. Returns the parsed
 *  body plus the HTTP ok flag; throws on network failure (caller handles). */
async function postAuth(path, body) {
  const res = await fetch(`${config.API_BASE}/auth/${path}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body || {}),
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { httpOk: res.ok, status: res.status, data };
}

/** GET /api/auth/me — resolves the full user object (incl. firstName/lastName). */
async function fetchMe() {
  try {
    const res = await fetch(`${config.API_BASE}/auth/me`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

// --- Login ---------------------------------------------------------------
export async function login({ identifier, password }) {
  try {
    const { httpOk, data } = await postAuth('login', { identifier, password });
    if (!httpOk) return { ok: false, error: data.error, message: data.message };
    // login returns the user, but names live on the profile — pull the fully
    // joined user from /me so the app has firstName/lastName.
    const user = (await fetchMe()) || data.user;
    return { ok: true, user };
  } catch (e) {
    console.error('login failed', e);
    if (config.USE_MOCK_FALLBACK) {
      await delay(1500);
      if (identifier.length > 3 && password.length >= 6) return { ok: true, user: MOCK_USER };
    }
    return { ok: false };
  }
}

// --- Registration: send OTP (creates the pending user + emails the code) ---
export async function sendOtp(form) {
  lastRegisterEmail = form && form.email ? form.email : lastRegisterEmail;
  try {
    const { httpOk, data } = await postAuth('register', form || {});
    if (!httpOk) return { ok: false, error: data.error, message: data.message };
    return { ok: true, matId: data.matId, resendCooldownSeconds: data.resendCooldownSeconds };
  } catch (e) {
    console.error('sendOtp failed', e);
    if (config.USE_MOCK_FALLBACK) {
      await delay(1500);
      return { ok: true };
    }
    return { ok: false };
  }
}

// --- Registration: verify the emailed OTP (6-char code string) -------------
export async function verifyOtp(code) {
  try {
    const { httpOk, data } = await postAuth('verify-otp', { email: lastRegisterEmail, code });
    if (!httpOk) return { ok: false, error: data.error, message: data.message };
    return { ok: true };
  } catch (e) {
    console.error('verifyOtp failed', e);
    if (config.USE_MOCK_FALLBACK) {
      await delay(1000);
      return { ok: true };
    }
    return { ok: false };
  }
}

// --- Registration: resend the OTP ------------------------------------------
export async function resendOtp(form) {
  const email = (form && form.email) || lastRegisterEmail;
  try {
    const { httpOk, data } = await postAuth('resend-otp', { email });
    if (!httpOk) return { ok: false, error: data.error, message: data.message };
    return { ok: true, resendCooldownSeconds: data.resendCooldownSeconds };
  } catch (e) {
    console.error('resendOtp failed', e);
    if (config.USE_MOCK_FALLBACK) {
      await delay(1000);
      return { ok: true };
    }
    return { ok: false };
  }
}

// --- Finish registration: the user + profile already exist (created by
//     /auth/register after OTP verification), so establish the session by
//     logging in with the step-1 credentials and return the user. -----------
export async function registerProfile(form) {
  try {
    const { httpOk, data } = await postAuth('login', {
      identifier: form.email,
      password: form.password,
    });
    if (!httpOk) return { ok: false, error: data.error, message: data.message };
    const user = (await fetchMe()) || data.user;
    return { ok: true, user };
  } catch (e) {
    console.error('registerProfile failed', e);
    if (config.USE_MOCK_FALLBACK) {
      return {
        ok: true,
        user: {
          ...MOCK_USER,
          firstName: form.firstName || MOCK_USER.firstName,
          lastName: form.lastName || MOCK_USER.lastName,
        },
      };
    }
    return { ok: false };
  }
}

// --- Forgot password: send reset OTP (identifier = email or phone) ---------
export async function sendResetOtp(identifier) {
  try {
    const { httpOk, data } = await postAuth('forgot-password', { email: identifier });
    if (!httpOk) return { ok: false, error: data.error, message: data.message };
    return { ok: true, resendCooldownSeconds: data.resendCooldownSeconds };
  } catch (e) {
    console.error('sendResetOtp failed', e);
    if (config.USE_MOCK_FALLBACK) {
      await delay(1500);
      return { ok: true };
    }
    return { ok: false };
  }
}

export async function resendResetOtp(identifier) {
  try {
    const { httpOk, data } = await postAuth('forgot-password', { email: identifier });
    if (!httpOk) return { ok: false, error: data.error, message: data.message };
    return { ok: true, resendCooldownSeconds: data.resendCooldownSeconds };
  } catch (e) {
    console.error('resendResetOtp failed', e);
    if (config.USE_MOCK_FALLBACK) {
      await delay(1000);
      return { ok: true };
    }
    return { ok: false };
  }
}

// --- Forgot password: reset with the OTP (identifier->email, otp->code) ----
export async function resetPassword({ identifier, otp, newPassword }) {
  try {
    const { httpOk, data } = await postAuth('reset-password', {
      email: identifier,
      code: otp,
      newPassword,
    });
    if (!httpOk) return { ok: false, error: data.error, message: data.message };
    return { ok: true };
  } catch (e) {
    console.error('resetPassword failed', e);
    if (config.USE_MOCK_FALLBACK) {
      await delay(1500);
      return { ok: true };
    }
    return { ok: false };
  }
}
