// Mocked authentication - same rules and delays as the original login.js / register.js.
// Replace the bodies with real API calls (see config.API_BASE).
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// The original dashboard greets "Mahesh" for everyone; this stands in for the user the API will return.
const MOCK_USER = { id: 'MAT1001', firstName: 'Mahesh', lastName: 'Kumar' };

export async function login({ identifier, password }) {
  await delay(1500);
  if (identifier.length > 3 && password.length >= 6) return { ok: true, user: MOCK_USER };
  return { ok: false };
}

export async function sendOtp() {
  await delay(1500);
  return { ok: true };
}

export async function verifyOtp() {
  await delay(1000);
  return { ok: true };
}

export async function resendOtp() {
  await delay(1000);
  return { ok: true };
}

export async function registerProfile(form) {
  return { ok: true, user: { ...MOCK_USER, firstName: form.firstName || MOCK_USER.firstName, lastName: form.lastName || MOCK_USER.lastName } };
}

// ---- Forgot password (mocked, same delays as the original forgot-password.js) ----
export async function sendResetOtp() {
  await delay(1500);
  return { ok: true };
}

export async function resendResetOtp() {
  await delay(1000);
  return { ok: true };
}

export async function resetPassword() {
  await delay(1500);
  return { ok: true };
}
