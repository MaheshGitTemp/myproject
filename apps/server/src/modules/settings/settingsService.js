// Cached reader for the admin-editable `settings` table (001_init.sql). The DB
// row is the runtime source of truth; config.settingsDefaults is the fallback
// used only when a key is missing from the table. A small in-process cache
// (~30s TTL) avoids a round-trip on every contact/photo/limit check; admin
// edits call set() which refreshes the cache immediately.
//
// No secret material lives in settings — only prices, windows and limits — so
// caching + reflecting values back to callers is safe.
import { query, queryOne } from '../../db.js';
import { config } from '../../config.js';

const CACHE_TTL_MS = 30_000;

let cache = null; // { key: value } snapshot of the whole table
let cacheExpiresAt = 0;

/** Load (or reuse) the full settings table as a plain object. */
async function load() {
  const now = Date.now();
  if (cache && now < cacheExpiresAt) return cache;
  const { rows } = await query('SELECT key, value FROM settings');
  const map = {};
  for (const r of rows) map[r.key] = r.value;
  cache = map;
  cacheExpiresAt = now + CACHE_TTL_MS;
  return cache;
}

/** Force the next read to hit the DB (used after a write). */
export function invalidate() {
  cache = null;
  cacheExpiresAt = 0;
}

/**
 * Raw string value for `key`. Falls back to config.settingsDefaults, then to
 * the supplied `fallback`. Returns a string (or the fallback as given).
 */
export async function get(key, fallback = null) {
  const map = await load();
  if (map[key] !== undefined && map[key] !== null) return map[key];
  const def = config.settingsDefaults[key];
  if (def !== undefined && def !== null) return String(def);
  return fallback;
}

/** The whole settings table as an object (DB values override defaults). */
export async function getAll() {
  const map = await load();
  const out = {};
  for (const [k, v] of Object.entries(config.settingsDefaults)) out[k] = String(v);
  for (const [k, v] of Object.entries(map)) out[k] = v;
  return out;
}

/** Numeric value for `key`, or `fallback` when missing / non-numeric. */
export async function getNumber(key, fallback = 0) {
  const raw = await get(key, null);
  if (raw == null) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** Date value for `key` as a Date, or null when missing / unparseable. */
export async function getDate(key) {
  const raw = await get(key, null);
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Upsert a setting (admin only — wired in the admin phase) and refresh the
 * cache so the new value takes effect immediately.
 */
export async function set(key, value) {
  await query(
    `INSERT INTO settings (key, value, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, String(value)],
  );
  invalidate();
  return queryOne('SELECT key, value FROM settings WHERE key = $1', [key]);
}
