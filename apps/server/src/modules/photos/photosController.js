// Photo request handlers. Thin: validate, process via sharp, persist row +
// files, and serve files through an AUTHORIZED route (not a public static dir)
// so approval + visibility + blocking are enforced on the server.
//
// Endpoints (mounted at /api/photos in app.js):
//   POST   /api/photos          upload (multer memoryStorage) -> status pending
//   GET    /api/photos/me       the owner's photos (any status)
//   DELETE /api/photos/:id      unlink both disk files + delete row (owner only)
//   GET    /api/photos/file/:id authorized serving of the WebP display/thumb
import * as settings from '../settings/settingsService.js';
import { process as processPhoto } from './photoService.js';
import * as photosRepo from './photosRepo.js';
import * as storage from '../storage/localStorage.js';
import { isBlockedPair } from '../interactions/blocksRepo.js';
import { areConnected } from '../interactions/interactionsRepo.js';
import { getProfileByUserId } from '../profiles/profilesRepo.js';

const PHOTO_URL = (id) => `/api/photos/file/${id}`;
const THUMB_URL = (id) => `/api/photos/file/${id}?variant=thumb`;

/** Shape a photo row for the owner's /me listing. */
function toOwnerView(row) {
  return {
    id: row.id,
    status: row.status,
    isPrimary: row.is_primary,
    visibility: row.visibility,
    rejectReason: row.reject_reason || null,
    url: PHOTO_URL(row.id),
    thumbUrl: THUMB_URL(row.id),
    createdAt: row.created_at,
  };
}

/**
 * POST /api/photos  (requireAuth, multer memoryStorage single 'photo')
 * Validates mime + size (handled by multer in the route), enforces the
 * per-user max (settings.max_photos_per_user), processes to WebP display +
 * thumbnail (EXIF/GPS stripped, original discarded), inserts a PENDING row.
 */
export async function uploadPhoto(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'no_file' });
    }

    // Enforce the per-user photo cap (user message 3 §9: max 3 photos/user).
    const max = await settings.getNumber('max_photos_per_user', 3);
    const existing = await photosRepo.countByUser(req.user.id);
    if (existing >= max) {
      return res.status(409).json({ error: 'photo_limit_reached', limit: max });
    }

    let processed;
    try {
      processed = await processPhoto(req.file.buffer);
    } catch {
      // sharp could not decode the bytes -> not a real image.
      return res.status(422).json({ error: 'invalid_image' });
    }

    // First photo becomes the primary candidate (visible once approved).
    const isPrimary = existing === 0;
    const row = await photosRepo.insert(req.user.id, {
      displayName: processed.displayName,
      thumbName: processed.thumbName,
      isPrimary,
    });

    res.status(201).json({
      ok: true,
      photo: { id: row.id, status: row.status, isPrimary: row.is_primary },
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/photos/me  (requireAuth) — the owner's photos, any status. */
export async function listMyPhotos(req, res, next) {
  try {
    const rows = await photosRepo.listByUser(req.user.id);
    res.json({ ok: true, photos: rows.map(toOwnerView) });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/photos/:id  (requireAuth, owner only)
 * Removes the row and unlinks both the display and thumbnail files from disk.
 */
export async function deletePhoto(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });

    const row = await photosRepo.get(id);
    if (!row) return res.status(404).json({ error: 'not_found' });
    if (row.user_id !== req.user.id) return res.status(403).json({ error: 'forbidden' });

    // Delete the row first, then unlink the files it referenced.
    const removed = await photosRepo.remove(id);
    if (removed) {
      await storage.remove(removed.filename_display);
      await storage.remove(removed.filename_thumb);
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/photos/file/:id  (?variant=thumb for the thumbnail)
 * Authorized serving — NOT a public static dir. The owner always sees their own
 * photos; any other viewer sees a photo only when ALL hold:
 *   - the photo is status='approved', AND
 *   - the pair is NOT blocked (either direction), AND
 *   - the member's visibility rule allows this viewer:
 *       'all'         -> any viewer,
 *       'connections' -> a mutual accepted interest exists,
 *       'premium'     -> the viewer is a premium member.
 * Streams the stored WebP with the correct content-type.
 */
export async function servePhotoFile(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' });

    const row = await photosRepo.get(id);
    if (!row) return res.status(404).json({ error: 'not_found' });

    const viewer = req.user;
    const isOwner = viewer && viewer.id === row.user_id;

    if (!isOwner) {
      // Non-owners only ever see approved photos.
      if (row.status !== 'approved') return res.status(404).json({ error: 'not_found' });

      // Blocking hides photos both ways (business rule 5).
      if (viewer && (await isBlockedPair(viewer.id, row.user_id))) {
        return res.status(403).json({ error: 'blocked' });
      }

      const allowed = await visibilityAllows(row.visibility, viewer, row.user_id);
      if (!allowed) return res.status(403).json({ error: 'forbidden' });
    }

    const wantThumb = req.query.variant === 'thumb';
    const name = wantThumb ? row.filename_thumb : row.filename_display;
    // Rejected rows have null filenames; approved/pending have both.
    if (!name || !(await storage.exists(name))) {
      return res.status(404).json({ error: 'not_found' });
    }

    res.type('image/webp');
    res.setHeader('Cache-Control', 'private, max-age=300');
    const stream = storage.streamPath(name);
    stream.on('error', (err) => next(err));
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
}

/**
 * Apply the member's photo visibility rule for a given viewer.
 * Anonymous viewers only pass the 'all' rule.
 */
async function visibilityAllows(visibility, viewer, ownerId) {
  if (visibility === 'all') return true;
  if (!viewer) return false; // anonymous can only see 'all'
  if (visibility === 'connections') return areConnected(viewer.id, ownerId);
  if (visibility === 'premium') {
    // premium lives on the profile row, not the users row -> look it up.
    const prof = await getProfileByUserId(viewer.id);
    return prof ? prof.premium === true : false;
  }
  return false;
}
