// Express app wiring: security headers, CORS (cookie-friendly), body + cookie parsing,
// routes, and a JSON error handler. Kept separate from index.js so it can be imported
// by tests later without starting a listener.
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { pingDb } from './db.js';
import { attachUser } from './modules/auth/session.js';
import { authRouter } from './modules/auth/authRoutes.js';
import { profilesRouter } from './modules/profiles/profilesRoutes.js';
import { fetchList } from './modules/profiles/searchController.js';
import {
  shortlistRouter, interestsRouter, matchesRouter,
  blocksRouter, notificationsRouter, reportsRouter,
} from './modules/interactions/interactionsRoutes.js';
import { contactRouter } from './modules/contact/contactRoutes.js';
import { photosRouter } from './modules/photos/photosRoutes.js';
import { chatRouter } from './modules/chat/chatRoutes.js';
import { accountRouter } from './modules/account/accountRoutes.js';
import { getStats, getDashboard } from './modules/account/statsController.js';
import { requireAuth } from './modules/auth/session.js';
import { adminRouter } from './modules/admin/adminRoutes.js';

export function createApp() {
  const app = express();

  // Trust the first proxy hop so req.ip is resolved consistently (and so
  // express-rate-limit's IP key generation doesn't throw on localhost/IPv6).
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigins,
      credentials: true, // allow the session cookie (frontend uses credentials:'include')
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser(config.session.secret));

  // Resolve the session cookie -> req.user (null when anonymous) for every request.
  app.use(attachUser);

  // App-wide safety-net rate limiter for the API. This is a GENEROUS ceiling
  // that catches runaway/abusive clients without getting in the way of normal
  // use; the auth router keeps its own TIGHTER limiters (login/OTP/register),
  // which trip first for those endpoints. We skip the health probe and the
  // authorized photo-serving route (a profile page can request many images)
  // so neither is rate-limited to death.
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 1000, // per IP per window across /api
    standardHeaders: true,
    legacyHeaders: false,
    // Disable express-rate-limit v7's strict runtime validations. On localhost
    // (IPv6 ::1 / undefined req.ip) those validations throw a ValidationError
    // that escapes Express and crashes the process — which reset the connection
    // on every POST. A safe keyGenerator + validate:false makes it robust.
    validate: false,
    keyGenerator: (req) => req.ip || req.socket?.remoteAddress || 'unknown',
    message: { error: 'rate_limited', message: 'Too many requests. Please slow down.' },
    skip: (req) => {
      if (req.method !== 'GET') return false;
      // originalUrl is the full path (the limiter is mounted at /api, which
      // strips the prefix from req.path). Match on the full URL + query.
      const url = req.originalUrl.split('?')[0];
      return url === '/api/health' || url.startsWith('/api/photos/file/');
    },
  });
  app.use('/api', apiLimiter);

  // --- Health check ---
  app.get('/api/health', async (_req, res) => {
    let db = false;
    try {
      db = await pingDb();
    } catch {
      db = false;
    }
    res.status(db ? 200 : 503).json({
      status: db ? 'ok' : 'degraded',
      db,
      env: config.env,
      time: new Date().toISOString(),
    });
  });

  // --- Feature routers ---
  app.use('/api/auth', authRouter);
  app.use('/api/profiles', profilesRouter);
  // Search endpoint — exact path + method the frontend posts to (capital F).
  app.post('/api/Fetchlistdata', fetchList);

  // Interactions (P3): shortlist, interests, matches, blocks, notifications, reports.
  app.use('/api/shortlist', shortlistRouter);
  app.use('/api/interests', interestsRouter);
  app.use('/api/matches', matchesRouter);
  app.use('/api/blocks', blocksRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/reports', reportsRouter);

  // Contact unlock + gated contact details (P4).
  app.use('/api/contact', contactRouter);

  // Photos pipeline (P5): upload (pending), owner list, delete, authorized serve.
  app.use('/api/photos', photosRouter);

  // Chat (P6): conversations list, messages, send (block-enforced), mark read.
  app.use('/api/chat', chatRouter);

  // Account self-service (P7): close (permanently delete) your own account.
  app.use('/api/account', accountRouter);

  // Member stats + dashboard (read-only aggregates behind auth).
  app.get('/api/me/stats', requireAuth, getStats);
  app.get('/api/dashboard', requireAuth, getDashboard);

  // Admin (schema-ready, no UI yet): guarded moderation/settings stubs that
  // each write an admin_audit row. requireAdmin enforced inside the router.
  app.use('/api/admin', adminRouter);

  // --- 404 ---
  app.use((req, res) => {
    res.status(404).json({ error: 'not_found', path: req.originalUrl });
  });

  // --- Error handler (last) ---
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    console.error('[error]', err);
    const status = err.status || 500;
    res.status(status).json({
      error: err.code || 'internal_error',
      message: config.isProd ? 'Something went wrong.' : err.message,
    });
  });

  return app;
}
