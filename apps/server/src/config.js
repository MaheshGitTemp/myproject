// Central config. Reads from .env (via dotenv) with sensible dev defaults.
// Everything that varies by environment lives here so the rest of the code
// never touches process.env directly.
import 'dotenv/config';

const bool = (v, fallback = false) =>
  v === undefined ? fallback : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
const int = (v, fallback) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
};
const list = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : []);

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  port: int(process.env.PORT, 4000),
  corsOrigins: list(process.env.CORS_ORIGINS).length
    ? list(process.env.CORS_ORIGINS)
    : ['http://localhost:5173', 'http://localhost:5174'],

  db: {
    // A single DATABASE_URL wins if provided; otherwise assemble from PG* parts.
    connectionString: process.env.DATABASE_URL || undefined,
    host: process.env.PGHOST || 'localhost',
    port: int(process.env.PGPORT, 5432),
    database: process.env.PGDATABASE || 'telugu_sambandham',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
  },

  session: {
    secret: process.env.SESSION_SECRET || 'dev-only-insecure-secret-change-me',
    ttlDays: int(process.env.SESSION_TTL_DAYS, 30),
    cookieSecure: bool(process.env.COOKIE_SECURE, false),
    cookieName: 'ts_session',
  },

  email: {
    driver: process.env.EMAIL_DRIVER || 'console', // 'console' | 'smtp'
    fromName: process.env.EMAIL_FROM_NAME || 'Telugu Sambandham',
    fromAddress: process.env.EMAIL_FROM_ADDRESS || 'CustomerSupport@telugusambandham.com',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: int(process.env.SMTP_PORT, 465),
      secure: bool(process.env.SMTP_SECURE, true),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  },

  otp: {
    length: int(process.env.OTP_LENGTH, 6),
    ttlMinutes: int(process.env.OTP_TTL_MINUTES, 10),
    maxAttempts: int(process.env.OTP_MAX_ATTEMPTS, 5),
    resendCooldownSeconds: int(process.env.OTP_RESEND_COOLDOWN_SECONDS, 30),
  },

  // Defaults seeded into the settings table on first migrate/seed.
  // The DB settings table is the runtime source of truth (admin-editable).
  settingsDefaults: {
    contact_unlock_price: int(process.env.CONTACT_UNLOCK_PRICE, 25),
    contact_unlock_free_until: process.env.CONTACT_UNLOCK_FREE_UNTIL || '2026-12-31',
    phone_view_daily_limit: int(process.env.PHONE_VIEW_DAILY_LIMIT, 5),
    max_photos_per_user: int(process.env.MAX_PHOTOS_PER_USER, 3),
  },

  uploadDir: process.env.UPLOAD_DIR || './uploads',
};
