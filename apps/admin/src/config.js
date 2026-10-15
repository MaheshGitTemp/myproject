// Admin app configuration. Values come from .env.local (see .env.example).
export const config = {
  API_BASE: import.meta.env.VITE_API_BASE || 'http://127.0.0.1:4000/api',
};
