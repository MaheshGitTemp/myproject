// App-wide configuration (replaces assets/js/core/config.js). Values come from .env files.
export const config = {
  API_BASE: import.meta.env.VITE_API_BASE || 'https://telugusambandham.com/api',
  PROFILE_ENDPOINT: import.meta.env.VITE_PROFILE_ENDPOINT || null,
  USE_MOCK_FALLBACK: (import.meta.env.VITE_USE_MOCK_FALLBACK ?? 'true') === 'true',
};
