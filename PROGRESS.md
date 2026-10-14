# Telugu Sambandham — Project Progress & Decisions

> Living document. Captures where the project stands and every locked-in decision so
> work can resume across sessions. Update it as phases complete.

**Domain:** telugusambandham.com
**Repo:** monorepo (planned) — frontend is `apps/web`, backend `apps/server`, admin `apps/admin`
**Baseline tag:** `v1.0-frontend` (frontend complete, before backend/monorepo)

---

## Current status

- ✅ **Frontend (React) complete** — all pages built, mobile-responsive, dark mode, pushed to `origin/main`.
- ⬜ **Backend** — not started (next).
- ⬜ **Admin panel** — after backend.

### Frontend pages that exist
- Auth: Login, Register (6-step wizard), ForgotPassword
- App: Home (recommended feed), Matches, Search, Chat, ProfileDetails (`/profile-details?id=MATxxxx`), Notifications
- Account: Dashboard, EditProfile (11-section accordion), Gallery, Me, PrivacySecurity, ChangePassword, CloseAccount

### Frontend API contract the backend must satisfy (from existing code)
- `config.API_BASE` + `POST /Fetchlistdata` — profile search (see `src/services/profileLookupService.js`)
- `PROFILE_ENDPOINT?id=MATxxxx` — single profile lookup
- OTP send / verify / resend during registration (see `src/services/authService.js`)
- Cookie-based session (`credentials: 'include'`)
- `config.USE_MOCK_FALLBACK` — flip OFF per feature as real endpoints land

---

## Locked-in stack decisions

| Area | Decision |
|---|---|
| Database | PostgreSQL |
| DB access | **Raw SQL** via `pg` + parameterized `db.query()` + hand-written numbered migrations (no ORM) |
| Backend runtime | Node.js + Express |
| Language | **Plain JavaScript (ESM)** — matches frontend |
| Repo | **Monorepo**: `apps/web`, `apps/server`, `apps/admin`, shared `packages/` |
| Hosting | Node + PostgreSQL **both on the Hostinger VPS** |
| Password hashing | **bcrypt** |
| Sessions | **Cookie-based, stored in a Postgres `sessions` table** (not JWT) |
| Auth OTP (v1) | **Email only** — Gmail SMTP via app password; console-stubbed in dev; swappable mailer module |
| Email sender | public `CustomerSupport@telugusambandham.com`; relays via `telugusambandham@gmail.com` + app password; inbound forwards to Gmail |
| Email domain policy | **Blocklist disposable/temp-mail** (admin-editable table); allow everything else; OTP proves reachability |
| Phone OTP (SMS) | deferred to post-v1 (needs DLT in India); `phone_verified` stays false until then |
| Images | local VPS disk; convert to **WebP**; **strip EXIF/GPS**; no original kept; **max 3/user**; store **display + thumbnail** sizes; `sharp` for processing + watermark; swappable storage module (→ S3/R2 later) |
| mat_id | auto-generated sequential (e.g. MAT2001, MAT2002, …) |
| Seed data | seed DB with existing mock profiles for immediate testing |

---

## Business rules (confirmed spec)

### Registration & verification
- Status flow: `pending_otp` → `pending_approval` → `active`.
- New users: **hidden from public** until an admin approves.
- A pending user **can browse**, but others' contact details show "Verification Pending".
- **Dual verification flags**: separate `email_verified` + `phone_verified`; computed `is_verified` = both true. **Kept separate from `admin_approved`** (public visibility). v1: final-verified = email only; "require phone" is a settings flag to flip when SMS is live.

### Photo approval
- New photos default **Pending**, not public. Visible only after **admin approval**, then still subject to the member's visibility settings.
- Rejected photos: delete the **disk file**; keep a minimal rejected row (reason) for admin history.

### Privacy & contact visibility (server-enforced)
- Reciprocal: if a user **hides their phone**, they cannot view others' phone numbers. Same for email.
- Enforced on the **server** (UI-only hiding is bypassable).

### Contact access model — **pay-per-contact, no subscriptions**
- Browse/view profiles = free. Contact details (phone, email, WhatsApp) = **locked**.
- Unlock is a **one-time payment per specific profile**; stays unlocked permanently.
- **Launch promo:** price shown as ~~₹25~~ **Free** for a launch window.
- `contact_unlocks` table (unique `viewer_id`+`unlocked_profile_id`); `settings` holds `contact_unlock_price` + `contact_unlock_free_until`. During free window, unlock still creates a row (price 0).
- Payment gateway (Razorpay) deferred; isolated module so it slots in later.

### Phone-view daily limit
- Default **5 per day per user**; stored in admin **settings** table (editable, no code change).
- Interpretation (default): caps how many **new** contacts unlocked per day (anti-scraping); re-viewing an already-unlocked contact is free/unlimited. Same number same day doesn't double-count; resets daily. (`phone_views` table, unique `(viewer_id, viewed_id, date)`.)

### Blocking & messaging (bidirectional)
- **User Block** (`full`): blocked users can't see each other's profile, search, matches; no messaging/interaction.
- **Message Block** (`message_only`): can see profiles, but messaging restricted.
- Blocks apply both directions.
- Admin: Block = reversible, Delete = permanent. Track user-block counts (both directions) + admin-block count.

### Account closure / admin delete — full cascade cleanup
Remove: profile, photo rows **+ disk files**, chat messages/conversations, notifications, shortlists, interests/proposals, blocks, sessions, OTP records, phone-view logs. (Admin delete = same cleanup as closure.)
- Open question for later: hard-delete (current spec) vs 30-day grace soft-delete.

### Interest / proposal flow
- Send Interest → pending → accepted / declined (state machine). Needed to model before paid contact flows mature.

---

## Also to build (not in original spec, folded into schema design)
- Rate limiting (login, OTP send/verify, registration, phone-view).
- OTP expiry (~10 min) + attempt lockout.
- Reports/abuse table feeding admin moderation (frontend "Report" button exists).
- Admin audit log (who did what, when).
- Password reset flow (ForgotPassword page → email OTP + reset endpoints).
- Session expiry + revoke/logout-everywhere.

---

## Roadmap (phases)

- **Phase 0** — Lock baseline: tag `v1.0-frontend`, write this file. ← *in progress*
- **Phase 1** — Monorepo restructure (`src/` → `apps/web/`) + scaffold `apps/server` (config, `db.query`, migration runner, `001_init.sql`), email stubbed to console.
- **Phase 2** — Auth: register, email OTP (expiry/attempts/rate-limit), bcrypt, cookie+Postgres sessions, login/logout, password reset.
- **Phase 3** — Profiles + search: profile CRUD (11 sections), `/Fetchlistdata`-compatible search, single-profile lookup, mat_id gen, seed data. Flip `USE_MOCK_FALLBACK` off for search/profile.
- **Phase 4** — Interactions: shortlist, interests (state machine), matches, blocking, notifications.
- **Phase 5** — Contact unlock (free-launch flow) + phone-view limit + reciprocal privacy; images pipeline (upload → WebP → strip EXIF → thumbnail → pending → admin approve).
- **Phase 6** — Chat (conversations/messages, message-block rules).
- **Phase 7** — Membership/payments (Razorpay) + hardening (helmet, CORS, rate limits, logging) + VPS deploy.
- **Phase 8** — Admin panel (`apps/admin`): auth/roles, dashboard, member mgmt, profile+photo moderation, reports, settings (limits/pricing/free-window), audit log.

---

## Migration workflow (raw SQL)
- Schema source of truth = numbered files in `apps/server/db/migrations/` (e.g. `001_init.sql`).
- Apply with `npm run migrate` (runner tracks applied files in `schema_migrations`; safe to re-run).
- New change = **new numbered file** (never edit an applied one).
- Deploy = `git pull` → `npm run migrate` on the VPS.
- `npm run seed` loads option lists + mock profiles. `npm run db:reset` for local dev only (never prod).

---

## Notes / reminders
- Gmail app password that was exposed in chat has been **revoked**; generate a fresh one at email-wiring time and keep it in `apps/server/.env` only (gitignored, never committed).
- `.agents/` (workflow planning/review artifacts) is gitignored.
- No test runner configured — verification is `npm run build` (Vite) + manual dev-server checks. Consider adding Vitest/Jest when backend logic lands.
