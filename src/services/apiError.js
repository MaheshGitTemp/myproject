// Centralized API error mapping + a tiny session-expired event bus.
//
// Plain JS (no React) so services AND pages can share one source of truth for
// user-facing error copy. Every service already returns a normalized
// { ok:false, status, error } shape; pages pass that here to get a friendly
// { title, message } instead of showing raw "Request failed with status 401".
//
// A 401 on an already-authenticated call is special: instead of a per-call
// toast storm it fires ONE global "session expired" handler (logout + redirect)
// via notifySessionExpired(). The AuthContext registers the listener.

// Required user-facing copy (keep in sync with the product spec).
const MESSAGES = {
  invalidCredentials: {
    title: 'Login failed',
    message: 'Incorrect email or password. Please try again.',
  },
  sessionExpired: {
    title: 'Session expired',
    message: 'Your session has expired. Please log in again.',
  },
  forbidden: {
    title: 'No access',
    message: "You don't have access to this feature.",
  },
  otpNotSent: {
    title: 'Could not send code',
    message: "We couldn't send the OTP. Please check your email and try again.",
  },
  otpInvalid: {
    title: 'Invalid code',
    message: 'The OTP is incorrect or has expired. Request a new one.',
  },
  server: {
    title: 'Something went wrong',
    message: 'Something went wrong on our side. Please try again in a moment.',
  },
  emailNotVerified: {
    title: 'Verify your email',
    message: 'Please verify your email before signing in.',
  },
  accountSuspended: {
    title: 'Account unavailable',
    message: 'This account is not active. Please contact support.',
  },
  generic: {
    title: 'Request failed',
    message: 'Something went wrong. Please try again.',
  },
};

const OTP_SEND_ERRORS = new Set([
  'email_failed', 'otp_send_failed', 'mail_failed', 'rate_limited', 'email_rate_limited',
]);
const OTP_INVALID_ERRORS = new Set([
  'otp_invalid', 'otp_expired', 'otp_max_attempts', 'otp_not_found', 'otp_mismatch',
]);

/**
 * Map a normalized API failure to friendly { title, message }.
 * @param {{ status?: number, error?: string, context?: string }} input
 *   context: 'login' | 'otp' | 'otp-send' | 'authed' | undefined
 *     - 'login'   : a 401 means bad credentials, not an expired session.
 *     - 'authed'  : a 401 means the session expired on an authenticated page.
 *     - 'otp'     : OTP verify/reset path (invalid/expired code mapping).
 *     - 'otp-send': register/resend/forgot path (send-failure mapping).
 */
export function mapApiError({ status, error, context } = {}) {
  // Explicit backend error codes first (most specific).
  if (error === 'invalid_credentials') return MESSAGES.invalidCredentials;
  if (error === 'email_not_verified') return MESSAGES.emailNotVerified;
  if (error && (error === 'account_suspended' || error === 'account_closed')) return MESSAGES.accountSuspended;
  if (error && OTP_INVALID_ERRORS.has(error)) return MESSAGES.otpInvalid;
  if (error && OTP_SEND_ERRORS.has(error)) return MESSAGES.otpNotSent;
  if (error && error.startsWith('otp_')) return MESSAGES.otpInvalid;

  // Context-aware status mapping.
  if (status === 401) {
    if (context === 'login') return MESSAGES.invalidCredentials;
    return MESSAGES.sessionExpired;
  }
  if (status === 403) return MESSAGES.forbidden;
  if (status === 429) {
    if (context === 'otp-send') return MESSAGES.otpNotSent;
    return { title: 'Please slow down', message: 'Too many attempts. Please wait a moment and try again.' };
  }
  // 0 / undefined status => network failure; 5xx => server error.
  if (!status || status >= 500) {
    if (context === 'otp-send') return MESSAGES.otpNotSent;
    return MESSAGES.server;
  }

  // Context fallbacks for a 400 with no recognized code.
  if (context === 'otp') return MESSAGES.otpInvalid;
  if (context === 'otp-send') return MESSAGES.otpNotSent;
  return MESSAGES.generic;
}

// --- Session-expired event bus --------------------------------------------
// One listener (registered in AuthContext). A short debounce window collapses a
// burst of concurrent 401s into a single logout + redirect + toast.

let sessionListener = null;
let lastFiredAt = 0;
const DEBOUNCE_MS = 3000;

/** Register the single handler that performs logout + redirect + the toast. */
export function onSessionExpired(fn) {
  sessionListener = fn;
  return () => {
    if (sessionListener === fn) sessionListener = null;
  };
}

/** True only when the app believes it has a logged-in user (set by AuthContext). */
function hasActiveSession() {
  try {
    return !!(localStorage.getItem('ts_session') || sessionStorage.getItem('ts_session'));
  } catch {
    return false;
  }
}

/**
 * Called by services when an AUTHED request returns 401. Fires the single
 * global handler ONCE per debounce window — but only if the app currently
 * believes it is logged in, so an anonymous user browsing public pages is never
 * bounced to /login by a background 401.
 */
export function notifySessionExpired() {
  if (!hasActiveSession()) return;
  const now = Date.now();
  if (now - lastFiredAt < DEBOUNCE_MS) return;
  lastFiredAt = now;
  if (typeof sessionListener === 'function') sessionListener();
}
