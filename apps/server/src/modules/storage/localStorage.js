// Local-disk storage for processed photos. This is deliberately a thin seam so
// a future swap to S3 / Cloudflare R2 only replaces THIS module (same API):
//   ensureDir(), saveBuffer(buffer, name), remove(name), absPath(name),
//   streamPath(name).
//
// All files live under config.uploadDir. Callers pass a bare filename (we
// generate it in the photo service); we `path.basename` it and resolve against
// the upload dir so a user-controlled value can never traverse outside it.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { config } from '../../config.js';

// Resolve the upload directory to an absolute path once (config.uploadDir may be
// relative like './uploads' — resolve against the process CWD, the server root).
const UPLOAD_DIR = path.resolve(config.uploadDir);

/** Absolute path for a stored file. basename() strips any traversal attempt. */
export function absPath(name) {
  return path.join(UPLOAD_DIR, path.basename(String(name)));
}

/** Create the upload directory if it does not exist (idempotent, like mkdir -p). */
export async function ensureDir() {
  await fsp.mkdir(UPLOAD_DIR, { recursive: true });
  return UPLOAD_DIR;
}

/** Persist a buffer under `name`. Ensures the directory exists first. */
export async function saveBuffer(buffer, name) {
  await ensureDir();
  const target = absPath(name);
  await fsp.writeFile(target, buffer);
  return target;
}

/** Delete a stored file. Missing files are ignored (idempotent cleanup). */
export async function remove(name) {
  if (!name) return false;
  try {
    await fsp.unlink(absPath(name));
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

/** True when the stored file exists on disk. */
export async function exists(name) {
  if (!name) return false;
  try {
    await fsp.access(absPath(name));
    return true;
  } catch {
    return false;
  }
}

/**
 * Open a read stream for a stored file (used by the authorized serving route to
 * pipe the WebP to the response). Returns a Node fs.ReadStream.
 */
export function streamPath(name) {
  return fs.createReadStream(absPath(name));
}
