import pg from 'pg';

const pool = new pg.Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB || 'postgres',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

/**
 * @returns {Promise<string[]>} Array of mailbox names
 */
export const selectMailboxes = async () => {
  const select = 'SELECT data->>\'name\' as name FROM mailbox';
  const {rows} = await pool.query(select);
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
  const {rows} = await pool.query(query);
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
  const {rows} = await pool.query(query);
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
  const {rowCount} = await pool.query(query);
  return rowCount;
};
