// Photo processing pipeline (sharp). Takes a raw upload buffer and produces two
// WebP renditions — a display image (~1080px longest edge) and a thumbnail
// (~300px longest edge) — then persists them via the storage seam. The original
// upload is NEVER written to disk (user message 3 §9: "Do NOT keep the original").
//
// Privacy / correctness notes:
//   * .rotate() with no argument applies the EXIF orientation so the saved
//     image looks right, THEN all metadata is dropped because we do NOT call
//     .withMetadata() — sharp strips EXIF/GPS/ICC by default on re-encode. This
//     satisfies "EXIF and GPS data is stripped" (user message 3 §9).
//   * We re-encode to WebP (never pass the bytes through), so embedded metadata
//     cannot survive.
import crypto from 'node:crypto';
import sharp from 'sharp';
import { saveBuffer } from '../storage/localStorage.js';

const DISPLAY_MAX = 1080; // longest edge for the full display image
const THUMB_MAX = 300;    // longest edge for the thumbnail
const WEBP_QUALITY = 82;

/** A collision-resistant base name for one photo's two renditions. */
function newBaseName() {
  return `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Process one upload buffer into display + thumbnail WebP files on disk.
 *
 * @param {Buffer} buffer  the raw uploaded image bytes (multer memoryStorage)
 * @returns {Promise<{ displayName: string, thumbName: string }>}
 * @throws when the buffer is not a decodable image (sharp rejects)
 */
export async function process(buffer) {
  const base = newBaseName();
  const displayName = `${base}_d.webp`;
  const thumbName = `${base}_t.webp`;

  // Build each rendition from the ORIGINAL buffer independently. `fit:'inside'`
  // + `withoutEnlargement:true` scales down to the max longest edge but never
  // upscales a small image. No .withMetadata() -> EXIF/GPS stripped on encode.
  const displayBuf = await sharp(buffer)
    .rotate() // honor EXIF orientation, then drop it (no withMetadata)
    .resize(DISPLAY_MAX, DISPLAY_MAX, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  const thumbBuf = await sharp(buffer)
    .rotate()
    .resize(THUMB_MAX, THUMB_MAX, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  // Persist via the storage seam (local disk now; S3/R2 later).
  await saveBuffer(displayBuf, displayName);
  await saveBuffer(thumbBuf, thumbName);

  return { displayName, thumbName };
}

export const limits = { DISPLAY_MAX, THUMB_MAX, WEBP_QUALITY };
