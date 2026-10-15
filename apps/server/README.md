# Telugu Sambandham — Backend (`apps/server`)

Node.js + Express + PostgreSQL. **Raw SQL** (no ORM), **plain JavaScript (ESM)**.

## Prerequisites
- Node.js 20+
- PostgreSQL 14+ running locally (or reachable via the `PG*` / `DATABASE_URL` env vars)

## First-time setup

```bash
cd apps/server
cp .env.example .env          # then edit .env with your local DB password etc.
npm install
```

Create the database once (adjust user as needed):

```bash
# using psql / createdb
createdb telugu_sambandham
# or inside psql:  CREATE DATABASE telugu_sambandham;
```

Apply the schema and seed baseline data:

```bash
npm run migrate     # applies db/migrations/*.sql in order
npm run seed        # settings defaults + disposable-email blocklist
```

## Run

```bash
npm run dev         # node --watch, restarts on change
# or
npm start
```

Verify it's alive:

```
GET http://localhost:4000/api/health   ->  { "status": "ok", "db": true, ... }
```

## Database / migrations (raw SQL)
- Schema lives in `db/migrations/NNN_name.sql`, applied in filename order.
- `npm run migrate` applies pending files; already-applied files are tracked in
  `schema_migrations` and skipped (safe to re-run).
- **To change the schema, add a NEW numbered file** — never edit one already applied.
- `npm run migrate:status` shows applied vs pending.
- `npm run db:reset` drops & re-applies everything (**dev only**, refuses in production).

## Email (OTP) in development
- `EMAIL_DRIVER=console` (default) prints OTP codes to the server terminal — no real
  email needed during development.
- Set `EMAIL_DRIVER=smtp` + the `SMTP_*` vars (Gmail app password) to send for real.

## Layout
```
apps/server/
├── db/
│   ├── migrations/      # numbered .sql schema files
│   ├── migrate.js       # migration runner (up | status | reset)
│   └── seed.js          # settings + blocklist (+ mock profiles later)
├── src/
│   ├── config.js        # env -> config object
│   ├── db.js            # pg pool + query()/queryOne()/withTransaction()
│   ├── app.js           # express app (routes mount here)
│   └── index.js         # http listener + graceful shutdown
├── .env.example
└── package.json
```

Feature modules (auth, profiles, search, …) are added under `src/` as phases land;
each mounts its router in `app.js`.

## API endpoints (summary)

All routes are mounted after `attachUser`, so `req.user` is available (null when
anonymous). Browser calls must send `credentials:'include'` for the session cookie.

Auth (`/api/auth`): `POST /register`, `POST /verify-otp`, `POST /resend-otp`,
`POST /login`, `POST /logout`, `GET /me`, `POST /forgot-password`,
`POST /reset-password`.

Profiles / search: `GET /api/profiles/me`, `PUT /api/profiles/me`,
`POST /api/profiles`, `GET /api/profiles?id=MATxxxx` (+ `GET /api/profiles/:matId`),
`POST /api/Fetchlistdata` (search list).

Interactions: `/api/shortlist`, `/api/interests`, `/api/matches`, `/api/blocks`,
`/api/notifications`, `/api/reports`.

Contact: `POST /api/contact/unlock/:matId`, `GET /api/contact/:matId`.

Photos: `POST /api/photos`, `GET /api/photos/me`, `DELETE /api/photos/:id`,
`GET /api/photos/file/:id` (authorized serving).

Chat: `GET /api/chat/conversations`, `GET /api/chat/conversations/:id/messages`,
`POST /api/chat/messages`, `POST /api/chat/conversations/:id/read`.

### Account closure (P7)
- `POST /api/account/close` (requireAuth) — **permanently** deletes the signed-in
  user. Runs the shared cleanup routine `accountRepo.deleteUserFully(userId)`:
  unlink the user's photo **files on disk** first, then `DELETE FROM users`, letting
  `ON DELETE CASCADE` remove profile, preferences, photos rows, chat
  conversations/messages, notifications, shortlists, interests, blocks, sessions,
  OTP records, phone-view logs and contact unlocks. The session is destroyed and
  the cookie cleared. **Admin delete reuses the exact same routine.**

### Admin (schema-ready, no UI yet)
Migration `007_admin.sql` adds `users.is_admin BOOLEAN DEFAULT false` and an
append-only `admin_audit` table. All `/api/admin/*` routes require `requireAdmin`
(authenticated **and** `is_admin`) and write an `admin_audit` row (except the
read-only pending queue):
- `GET /api/admin/pending` — users awaiting approval + photos awaiting review.
- `POST /api/admin/profiles/:matId/approve` — publish a pending profile.
- `POST /api/admin/photos/:id/approve`, `POST /api/admin/photos/:id/reject`
  (`{reason}`; rejected photo files are unlinked from disk).
- `POST /api/admin/users/:matId/block` (`{type}`) — **reversible**; writes a
  `blocks` row (`blocked_by_admin=true`) and bumps `users.admin_block_count`.
- `DELETE /api/admin/users/:matId` — **permanent**; reuses `deleteUserFully`.
- `PUT /api/admin/settings` (`{key,value}`) — updates an admin-editable setting
  (price / free-window / daily limit / max photos) and refreshes the cache.

**Seeded admin:** `npm run seed` flags **MAT2087** (`mat2087@example.com`, dev
password `Password123`) with `is_admin=true`. Change this in production.

## Running order after pulling P2–P7
```bash
cd apps/server
npm install           # brings in sharp + multer (P5), express-rate-limit
npm run migrate       # applies 002–007 (001 already applied)
npm run seed          # mock profiles + admin flag on MAT2087
npm run dev           # restart the dev server
```
