// Feed selectors derived from the shared demo profiles, so Home.jsx stays a clean
// composition root. Replaces the old swipe-deck PROFILES for the landing feed.
// Opposite-gender matching is intentionally ignored here (task decision) — ordering
// is purely by compatibility score.
import { MOCK_PROFILES } from '../../../data/mockProfiles.js';

// Top-compatibility profiles for the "Matches of the Day" strip (top 3–5).
export const MATCHES_OF_DAY = [...MOCK_PROFILES]
  .sort((a, b) => (b.compatibility?.score ?? 0) - (a.compatibility?.score ?? 0))
  .slice(0, 5);

// Full list for the recommended vertical feed.
export const RECOMMENDED = MOCK_PROFILES;
