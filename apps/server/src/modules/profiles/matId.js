// MAT id normalization — mirrors the frontend's normalizeId
// (src/services/profileLookupService.js) so lookups accept "mat-2087",
// " 2087 ", "MAT2087" etc. and resolve to the canonical "MAT2087".
export function normalizeMatId(raw) {
  const s = String(raw == null ? '' : raw).toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!s) return '';
  return /^\d+$/.test(s) ? `MAT${s}` : s;
}

export const isValidMatId = (id) => /^MAT\d{1,8}$/.test(id);
