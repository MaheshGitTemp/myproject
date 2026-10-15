# Telugu Sambandham — Admin Panel

Standalone Vite + React admin app. It is **not** part of a workspace: it has its
own `node_modules` and its own `npm install`. Do not add a root workspace
`package.json`, and do not move the member frontend.

## Run

```bash
cd apps/admin
npm install
npm run dev
```

The dev server listens on **http://localhost:5174** and can run at the same time
as the member app (which uses port 5173). The backend API must also be running
(see `apps/server`, port 4000).

## Environment

Copy the example env and keep the default API base:

```bash
cp .env.example .env.local
```

```
VITE_API_BASE=http://127.0.0.1:4000/api
```

## CORS / cookies — open the app at localhost:5174

Auth uses the backend's cookie session, so the browser origin must be in the
backend CORS allowlist. The backend default allowlist is
`http://localhost:5173` and `http://localhost:5174`.

- **Open the admin app at http://localhost:5174** (the `localhost` origin is
  already allowed) and open it consistently — don't mix `localhost` and
  `127.0.0.1`, because they are different origins for cookies and CORS.
- `http://127.0.0.1:5174` is **not** in the default allowlist. If you must use
  the `127.0.0.1` origin, add it to the backend `CORS_ORIGINS` (in
  `apps/server/.env`, comma-separated). This repo does **not** edit the backend
  `.env` for you — it's only a recommendation.

Note that `VITE_API_BASE` points at `127.0.0.1:4000` for talking to the API;
that's unrelated to the browser page origin above.

## Admin account

Only users with `isAdmin = true` can enter. A non-admin member is rejected at
sign-in. Seeded admin credentials:

```
email:    mat2087@example.com
password: Password123
```

## Structure

```
apps/admin/
├── package.json          # standalone deps (match member versions)
├── vite.config.js        # server.port 5174
├── tailwind.config.js    # brand/gold tokens mirrored from the member app
├── postcss.config.js
├── index.html
├── .env.example          # VITE_API_BASE
└── src/
    ├── main.jsx          # providers: Toast > Auth > App
    ├── App.jsx           # routes + admin guard
    ├── index.css         # Tailwind directives
    ├── config.js         # reads VITE_API_BASE
    ├── api.js            # fetch wrapper (credentials:'include', 401 -> /login)
    ├── context/
    │   ├── AuthContext.jsx    # /auth/me, signIn, signOut; isAdmin gate
    │   └── ToastContext.jsx
    ├── components/
    │   ├── ProtectedRoute.jsx # admin guard + Access Denied
    │   ├── AdminLayout.jsx    # sidebar + topbar, responsive
    │   ├── Spinner.jsx
    │   ├── EmptyState.jsx
    │   └── ErrorState.jsx
    └── pages/            # Login is real; the rest are stubs for Phase B (screens)
```
