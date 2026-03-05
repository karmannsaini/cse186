import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

let pool;

/**
 * Get a shared PostgreSQL connection pool.
 * @returns {pg.Pool} connection pool
 */
function getPool() {
  if (!pool) {
    pool = new pg.Pool({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: Number(process.env.POSTGRES_PORT) || 5432,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    });
  }
  return pool;
}

/**
 * Run a query that returns a single row.
 * @param {string} text SQL text
 * @param {Array} params SQL parameters
 * @returns {Promise<object|null>} first row or null
 */
export async function queryOne(text, params) {
  const result = await getPool().query(text, params);
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0];
}

/**
 * Run a query and return all rows.
 * @param {string} text SQL text
 * @param {Array} params SQL parameters
 * @returns {Promise<pg.QueryResult>} query result
 */
export async function query(text, params) {
  return getPool().query(text, params);
}

