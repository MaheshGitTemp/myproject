// Photo routes. Mounted at /api/photos in app.js (after attachUser, before the
// 404 handler). Uploads use multer MEMORY storage so the bytes go straight to
// sharp — nothing untransformed ever touches the disk (the original is dropped).
//
// Route ordering: the static-ish `/me` and `/file/:id` paths are declared
// before the bare `/:id` DELETE so they are never shadowed.
import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../auth/session.js';
import {
  uploadPhoto, listMyPhotos, deletePhoto, servePhotoFile,
} from './photosController.js';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB raw-upload cap
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

// Memory storage: multer keeps the file in req.file.buffer; sharp re-encodes it.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    const err = new Error('unsupported_file_type');
    err.status = 400;
    err.code = 'unsupported_file_type';
    cb(err);
  },
});

// Translate multer's own errors (e.g. size limit) into our JSON error shape.
function uploadSingle(req, res, next) {
  upload.single('photo')(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'file_too_large', limitBytes: MAX_UPLOAD_BYTES });
    }
    const status = err.status || 400;
    return res.status(status).json({ error: err.code || 'upload_failed' });
  });
}

export const photosRouter = Router();

photosRouter.post('/', requireAuth, uploadSingle, uploadPhoto);
photosRouter.get('/me', requireAuth, listMyPhotos);
// Authorized serving. req.user may be null (anonymous) — the controller only
// serves 'all'-visibility approved photos to anonymous viewers.
photosRouter.get('/file/:id', servePhotoFile);
photosRouter.delete('/:id', requireAuth, deletePhoto);
