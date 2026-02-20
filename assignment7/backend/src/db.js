import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

/**
 * Query the database for all mailbox names
 * @returns {Promise<Array>} Array of mailbox names
 */
export const selectMailboxes = async () => {
  const query = {
    // initcap() capitalizes the first letter at the database level!
    text: 'SELECT initcap(data->>\'name\') AS name FROM mailbox',
  };
  const {rows} = await pool.query(query);
  return rows.map((row) => row.name);
};
