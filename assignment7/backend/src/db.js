import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Don't create the pool immediately!
let pool;

// Lazy-load the pool so it grabs the environment variables AFTER tests set them
const getPool = () => {
  if (!pool) {
    pool = new pg.Pool({
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    });
  }
  return pool;
};

/**
 * @returns {Promise<string[]>} Array of mailbox names
 */
export const selectMailboxes = async () => {
  const select = 'SELECT initcap(data->>\'name\') as name FROM mailbox';
  const {rows} = await getPool().query(select);
  return rows.map((row) => row.name);
};

/**
 * @param {string} mailbox Name of the mailbox to select from
 * @returns {Promise<object[]>} Array of email objects without content
 */
export const selectMail = async (mailbox) => {
  const query = {
    text: `SELECT m.id, m.data FROM mail m 
           JOIN mailbox mb ON m.mailbox = mb.id 
           WHERE initcap(mb.data->>'name') = initcap($1)`,
    values: [mailbox],
  };
  const {rows} = await getPool().query(query);
  return rows.map((row) => {
    const email = {...row.data};
    email.id = row.id;
    delete email.content;
    return email;
  });
};

/**
 * @param {string} id UUID of the email to retrieve
 * @returns {Promise<object>} Full email object including content
 */
export const selectMailById = async (id) => {
  const query = {
    text: 'SELECT id, data FROM mail WHERE id = $1',
    values: [id],
  };
  const {rows} = await getPool().query(query);
  if (rows.length === 0) return null;
  const email = {...rows[0].data};
  email.id = rows[0].id;
  return email;
};

/**
 * @param {string} id UUID of the email to move
 * @param {string} mailboxName Name of the destination mailbox
 * @returns {Promise<number>} Number of rows updated
 */
export const moveMail = async (id, mailboxName) => {
  const query = {
    text: `UPDATE mail SET mailbox = (
             SELECT id FROM mailbox WHERE initcap(data->>'name') = initcap($1)
           ) WHERE id = $2`,
    values: [mailboxName, id],
  };
  const {rowCount} = await getPool().query(query);
  return rowCount;
};
