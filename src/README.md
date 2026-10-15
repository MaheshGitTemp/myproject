# Frontend — going live against the real backend

The React app reads three Vite env vars (see `src/config/index.js`). By default
it points at the production API and keeps a mock fallback on, so the UI runs even
when no backend is reachable.

To run against the **local backend** (`apps/server`, default port 4000), create
`d:\React\myproject\.env.local` (not committed — do NOT put secrets here, these
are public build-time values) with:

```
VITE_API_BASE=http://localhost:4000/api
VITE_PROFILE_ENDPOINT=http://localhost:4000/api/profiles
VITE_USE_MOCK_FALLBACK=false
```

- `VITE_API_BASE` — base for all API calls (auth, search, interactions, chat…).
- `VITE_PROFILE_ENDPOINT` — single-profile lookup. With it set,
  `profileLookupService.getProfileById` calls `GET /api/profiles?id=MATxxxx`
  (the backend supports the `?id=` query form as well as `GET /api/profiles/:matId`).
- `VITE_USE_MOCK_FALLBACK` — set `false` to require the real API; leave `true`
  (or unset) to fall back to demo data when the API is unreachable.

Restart `npm run dev` after creating/changing `.env.local`.

## Service wiring status
- `services/authService.js` — **wired** to the real auth endpoints (register,
  verify-otp, resend-otp, login, logout, forgot/reset-password, `/me`), with a
  mock fallback gated by `VITE_USE_MOCK_FALLBACK`.
- `services/profileLookupService.js` — already calls the real
  `POST /api/Fetchlistdata` (search) and the single-profile endpoint, with demo
  fallbacks; no change needed.
- `services/profileService.js` — static "current member" sample used by the
  header/menu previews; left as-is (no mock service equivalent to swap).
- Feature screens that still use inline sample data (Matches `matchesData.js`,
  Chat `chatData.js`, notifications, etc.) are **left as-is** per scope. The
  backend endpoints they map to are documented in `apps/server/README.md`
  (`/api/matches`, `/api/shortlist`, `/api/interests`, `/api/blocks`,
  `/api/notifications`, `/api/chat/*`, `/api/contact/*`, `/api/photos/*`).
