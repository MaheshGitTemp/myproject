// Thin PostgreSQL access layer over `pg`. The whole app talks to the DB through
// `query()` (always parameterized -> safe from SQL injection) and `withTransaction()`.
// No ORM: SQL is written by hand in repositories and migration files.
import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

// Prefer a single connection string if provided, else the discrete PG* fields.
export const pool = new Pool(
  config.db.connectionString
    ? { connectionString: config.db.connectionString }
    : {
        host: config.db.host,
        port: config.db.port,
        database: config.db.database,
        user: config.db.user,
        password: config.db.password,
      },
);

pool.on('error', (err) => {
  // A pooled idle client errored (e.g. DB restarted). Log; the pool recovers.
  console.error('[db] unexpected idle client error:', err.message);
});

/**
 * Run a parameterized query. ALWAYS pass values via `params`, never interpolate
 * user input into `text`.
 * @param {string} text  SQL with $1, $2 placeholders
 * @param {any[]}  params values for the placeholders
 * @returns {Promise<import('pg').QueryResult>}
 */
export function query(text, params) {
  return pool.query(text, params);
}

/** Convenience: return the first row (or null). */
export async function queryOne(text, params) {
  const { rows } = await pool.query(text, params);
  return rows[0] || null;
}

/**
 * Run a function inside a transaction. The callback receives a client whose
 * `.query` is used for all statements; commits on success, rolls back on throw.
 * @param {(client: import('pg').PoolClient) => Promise<T>} fn
 * @returns {Promise<T>}
 * @template T
 */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Quick connectivity check used by the health route and startup. */
export async function pingDb() {
  const { rows } = await pool.query('SELECT 1 AS ok');
  return rows[0]?.ok === 1;
}

export async function closeDb() {
  await pool.end();
}
