// App-wide configuration (replaces assets/js/core/config.js). Values come from .env files.
//
// Dev defaults are SAME-ORIGIN relative paths ('/api', '/api/profiles') so that,
// even without a .env.local, the browser calls the current origin and the Vite
// dev proxy forwards to the backend — keeping the sameSite:'lax' session cookie
// attached (no cross-site cookie drop -> no spurious 401s). Prod keeps the
// absolute API host. USE_MOCK_FALLBACK defaults to false so API failures surface
// instead of being silently masked by mock data. .env values still override.
const isDev = import.meta.env.DEV;

export const config = {
  API_BASE: import.meta.env.VITE_API_BASE || (isDev ? '/api' : 'https://telugusambandham.com/api'),
  PROFILE_ENDPOINT: import.meta.env.VITE_PROFILE_ENDPOINT || (isDev ? '/api/profiles' : null),
  USE_MOCK_FALLBACK: (import.meta.env.VITE_USE_MOCK_FALLBACK ?? 'false') === 'true',
};
