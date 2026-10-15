// Photos service. Calls the authorized photo endpoints (apps/server photos
// module, mounted at /api/photos) for the owner's own gallery: list, upload,
// delete, and build the authorized file URL.
//
// Follows the accountService.js pattern (request() helper for JSON endpoints,
// credentials:'include', res.json() in try/catch, a USE_MOCK_FALLBACK branch
// that never throws). uploadPhoto uses multipart FormData with the field name
// 'photo' and does NOT set Content-Type (the browser adds the boundary).
import { config } from '../config/index.js';

/** JSON request against a photos endpoint with the session cookie.
 *  Returns { httpOk, status, data }; throws on network failure (caller handles). */
async function request(path, { method = 'GET', body } = {}) {
  const opts = {
    method,
    headers: { Accept: 'application/json' },
    credentials: 'include',
  };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${config.API_BASE}${path}`, opts);
  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  return { httpOk: res.ok, status: res.status, data };
}

/** GET /photos/me -> { ok, photos:[...] } (owner's photos, any status). Never throws. */
export async function listMyPhotos() {
  try {
    const { httpOk, data } = await request('/photos/me');
    if (!httpOk) throw new Error('list photos failed');
    return { ok: true, photos: data.photos || [] };
  } catch (e) {
    console.error('listMyPhotos failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true, photos: [] };
    return { ok: false, photos: [] };
  }
}

/**
 * POST /photos with multipart FormData (field 'photo'). Does NOT set
 * Content-Type so the browser supplies the multipart boundary. Returns
 * { ok, photo, error }. Never throws.
 */
export async function uploadPhoto(file) {
  try {
    const fd = new FormData();
    fd.append('photo', file);
    const res = await fetch(`${config.API_BASE}/photos`, {
      method: 'POST',
      credentials: 'include',
      body: fd,
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }
    return { ok: res.ok, photo: data.photo, error: data.error };
  } catch (e) {
    console.error('uploadPhoto failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true };
    return { ok: false };
  }
}

/** DELETE /photos/:id (owner only) -> { ok }. Never throws. */
export async function deletePhoto(id) {
  try {
    const res = await fetch(`${config.API_BASE}/photos/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return { ok: res.ok };
  } catch (e) {
    console.error('deletePhoto failed', e);
    if (config.USE_MOCK_FALLBACK) return { ok: true };
    return { ok: false };
  }
}

/**
 * Build the authorized file URL for a photo. `variant` (e.g. 'thumb') is added
 * as a query param when provided. Maps to GET /photos/file/:id[?variant=].
 *
 * This returns a SAME-ORIGIN /api path (not config.API_BASE) on purpose. The
 * URL is consumed by <img src=...>, an image subresource — not a fetch with
 * credentials:'include'. Pointing it at the current origin (served through the
 * Vite /api dev proxy in dev, and the same reverse proxy in prod) guarantees the
 * session cookie rides, so the owner can see their own still-pending photos.
 * A cross-port absolute URL risks a dropped sameSite:'lax' cookie on the <img>
 * request, which 404s the owner and renders a broken/'corrupted' image.
 */
export function photoFileUrl(id, variant) {
  return `/api/photos/file/${id}` + (variant ? `?variant=${variant}` : '');
}
