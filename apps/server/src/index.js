// Server entry point. Starts the HTTP listener and wires graceful shutdown.
import { createApp } from './app.js';
import { config } from './config.js';
import { pingDb, closeDb } from './db.js';

const app = createApp();

// Bind explicitly to IPv4 0.0.0.0 (not the default, which can resolve to the
// IPv6 wildcard "::" on Windows). Binding to 0.0.0.0 accepts 127.0.0.1 and
// localhost-over-IPv4 cleanly and avoids the IPv4/IPv6 ambiguity that caused
// POST connection resets in local dev.
const HOST = '0.0.0.0';
const server = app.listen(config.port, HOST, async () => {
  console.log(`[server] listening on http://127.0.0.1:${config.port} (${config.env})`);
  try {
    const ok = await pingDb();
    console.log(ok ? '[server] database connection OK' : '[server] database ping returned no row');
  } catch (err) {
    console.warn('[server] database not reachable yet:', err.message);
    console.warn('[server] start PostgreSQL and run `npm run migrate`.');
  }
});

async function shutdown(signal) {
  console.log(`\n[server] ${signal} received, shutting down...`);
  server.close(async () => {
    await closeDb();
    process.exit(0);
  });
  // Force-exit if close hangs.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
