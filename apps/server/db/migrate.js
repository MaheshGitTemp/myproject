// Minimal raw-SQL migration runner.
//   node db/migrate.js up      -> apply all pending migrations (default)
//   node db/migrate.js status  -> list applied vs pending
//   node db/migrate.js reset   -> DROP every table then re-apply all (DEV ONLY)
//
// Migrations are numbered .sql files in db/migrations/ (e.g. 001_init.sql).
// Each applied file is recorded in schema_migrations so re-running is safe.
// To change the schema: add a NEW numbered file. Never edit one already applied.
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../src/config.js';
import { pool, withTransaction } from '../src/db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, 'migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function listMigrationFiles() {
  const files = await readdir(MIGRATIONS_DIR);
  return files.filter((f) => f.endsWith('.sql')).sort(); // lexical sort == numeric order with zero-padded names
}

async function appliedSet() {
  const { rows } = await pool.query('SELECT filename FROM schema_migrations');
  return new Set(rows.map((r) => r.filename));
}

async function up() {
  await ensureMigrationsTable();
  const files = await listMigrationFiles();
  const applied = await appliedSet();
  const pending = files.filter((f) => !applied.has(f));

  if (pending.length === 0) {
    console.log('[migrate] up to date — no pending migrations.');
    return;
  }

  for (const file of pending) {
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');
    console.log(`[migrate] applying ${file} ...`);
    // Each migration runs in its own transaction: all-or-nothing.
    await withTransaction(async (client) => {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
    });
    console.log(`[migrate]   done ${file}`);
  }
  console.log(`[migrate] applied ${pending.length} migration(s).`);
}

async function status() {
  await ensureMigrationsTable();
  const files = await listMigrationFiles();
  const applied = await appliedSet();
  console.log('[migrate] status:');
  for (const f of files) console.log(`  ${applied.has(f) ? '✓ applied ' : '· pending '} ${f}`);
  const pending = files.filter((f) => !applied.has(f)).length;
  console.log(`[migrate] ${files.length} total, ${pending} pending.`);
}

async function reset() {
  if (config.isProd) {
    console.error('[migrate] refusing to reset in production.');
    process.exit(1);
  }
  console.log('[migrate] RESET — dropping public schema and re-applying all migrations.');
  // Drop and recreate the public schema => wipes every table cleanly.
  await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
  await up();
}

const cmd = process.argv[2] || 'up';
try {
  if (cmd === 'up') await up();
  else if (cmd === 'status') await status();
  else if (cmd === 'reset') await reset();
  else {
    console.error(`[migrate] unknown command "${cmd}". Use: up | status | reset`);
    process.exit(1);
  }
} catch (err) {
  console.error('[migrate] FAILED:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
