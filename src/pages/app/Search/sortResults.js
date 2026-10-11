// Pure client-side comparators for the Search results, keyed off the fields that
// actually exist on result objects (see profileLookupService.js / mockProfiles.js):
// id, name, age, occupation, education, city, state, caste, premium, online,
// compatibility: { score, total, label }. There is NO join-date / geo field, so:
//   - 'recent'   -> identity (the order the service returned; API returns newest-first)
//   - 'location' -> alphabetical by "city state"
// Every SORTS id maps to a real, visible comparator — no chip is silently dead.

const loc = (p) => `${p.city || ''} ${p.state || ''}`.trim().toLowerCase();

const COMPARATORS = {
  recent: null, // identity — keep service order
  match: (a, b) => (b.compatibility?.score ?? 0) - (a.compatibility?.score ?? 0),
  'age-low': (a, b) => (a.age ?? Infinity) - (b.age ?? Infinity),
  'age-high': (a, b) => (b.age ?? -Infinity) - (a.age ?? -Infinity),
  name: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
  location: (a, b) => loc(a).localeCompare(loc(b)),
};

/** Returns a sorted COPY of `list`; never mutates the input. */
export default function sortResults(list, sortBy) {
  const arr = Array.isArray(list) ? [...list] : [];
  const cmp = COMPARATORS[sortBy];
  if (!cmp) return arr; // 'recent' or unknown id -> source order
  return arr.sort(cmp);
}
