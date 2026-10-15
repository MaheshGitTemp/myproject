// Fetch wrapper for the admin app. Always sends the session cookie
// (credentials:'include'), parses JSON, throws on non-OK, and bounces to
// /login on 401. Paths are relative to config.API_BASE (which already ends in
// `/api`), so callers pass e.g. '/admin/stats', '/auth/login'.
import { config } from './config.js';

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function request(method, path, body) {
  const headers = { Accept: 'application/json' };
  const init = { method, headers, credentials: 'include' };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${config.API_BASE}${path}`, init);
  } catch {
    throw new Error('Network error. Is the backend running on port 4000?');
  }

  const data = await parseBody(res);

  if (res.status === 401) {
    // Session expired or missing: send the admin back to login.
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.assign('/login');
    }
    const err = new Error((data && (data.error || data.message)) || 'unauthenticated');
    err.status = 401;
    throw err;
  }

  if (!res.ok) {
    const err = new Error((data && (data.error || data.message)) || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const apiGet = (path) => request('GET', path);
export const apiPost = (path, body) => request('POST', path, body ?? {});
export const apiPut = (path, body) => request('PUT', path, body ?? {});
export const apiDelete = (path) => request('DELETE', path);
