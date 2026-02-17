import pool from './db.js';

/**
 * Formats a mail object for the API by merging
 * the UUID and removing content if requested.
 * @param {object} row - The database row containing the mail data.
 * @param {boolean} [includeContent] - Whether to include the content.
 * Defaults to false.
 * @returns {object} - The formatted email object.
 */
function formatMail(row, includeContent = false) {
  const mail = {id: row.id, ...row.data};
  if (!includeContent) {
    delete mail.content;
  }
  return mail;
}

/**
 * Retrieves mailboxes and their emails.
 * @param {string} [name] - The name of the mailbox to filter by.
 * @returns {Promise<Array>} - A list of mailboxes.
 */
export const getMailboxes = async (name) => {
  let query = 'SELECT mb.id, mb.data->>\'name\' as mb_name, ' +
              'm.id as m_id, m.data as m_data ' +
              'FROM mailbox mb LEFT JOIN mail m ON mb.id = m.mailbox';
  const params = [];
  if (name) {
    query += ' WHERE mb.data->>\'name\' = $1';
    params.push(name);
  }
  query += ' ORDER BY mb.data->>\'name\' ASC, m.data->>\'sent\' DESC';

  const {rows} = await pool.query(query, params);
  if (name && rows.length === 0) return null;

  const mbs = {};
  rows.forEach((row) => {
    if (!mbs[row.mb_name]) mbs[row.mb_name] = {name: row.mb_name, mail: []};
    if (row.m_id) {
      mbs[row.mb_name].mail.push(formatMail({id: row.m_id, data: row.m_data}));
    }
  });
  return Object.values(mbs).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Advanced Search: Retrieves mailboxes filtering by sender.
 * @param {string} from - The sender's name or email to filter by.
 * @returns {Promise<Array>} - A list of mailboxes containing matching emails.
 */
export const getBySender = async (from) => {
  const query = 'SELECT mb.data->>\'name\' as mb_name, m.id, m.data ' +
                'FROM mail m JOIN mailbox mb ON m.mailbox = mb.id ' +
                'WHERE m.data->\'from\'->>\'name\' ILIKE $1 ' +
                'OR m.data->\'from\'->>\'email\' ILIKE $1 ' +
                'ORDER BY m.data->>\'sent\' DESC';
  const {rows} = await pool.query(query, ['%' + from + '%']);
  if (rows.length === 0) return null;

  const mbs = {};
  rows.forEach((row) => {
    if (!mbs[row.mb_name]) mbs[row.mb_name] = {name: row.mb_name, mail: []};
    mbs[row.mb_name].mail.push(formatMail(row));
  });
  return Object.values(mbs).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Retrieves a specific email by its ID.
 * @param {string} id - The UUID of the email.
 * @returns {Promise<object>} - The email object.
 */
export const getById = async (id) => {
  const query = 'SELECT * FROM mail WHERE id = $1';
  const {rows} = await pool.query(query, [id]);
  return rows.length ? formatMail(rows[0], true) : null;
};

/**
 * Creates a new email.
 * @param {object} mail - The email data.
 * @returns {Promise<object>} - The created email object.
 */
export const create = async (mail) => {
  const now = new Date().toISOString();
  const data = {
    ...mail,
    from: {name: 'CSE186 Student', email: 'CSE186student@ucsc.edu'},
    sent: now,
    received: now,
  };
  const mbQuery = 'SELECT id FROM mailbox WHERE data->>\'name\' = \'sent\'';
  const mbRes = await pool.query(mbQuery);
  const query = 'INSERT INTO mail(mailbox, data) ' +
                'VALUES ($1, $2) RETURNING id, data';
  const {rows} = await pool.query(query, [mbRes.rows[0].id, data]);
  return formatMail(rows[0], true);
};

/**
 * Moves an email to a specified mailbox.
 * @param {string} id - The UUID of the email.
 * @param {string} targetName - The destination mailbox name.
 * @returns {Promise<number>} - The HTTP status code.
 */
export const move = async (id, targetName) => {
  const mail = await getById(id);
  if (!mail) return 404;

  const {rows: currentMb} = await pool.query(
      'SELECT mb.data->>\'name\' as name FROM mailbox mb ' +
      'JOIN mail m ON m.mailbox = mb.id WHERE m.id = $1',
      [id],
  );

  if (targetName === 'sent' && currentMb[0].name !== 'sent') return 409;

  let {rows: targetMb} = await pool.query(
      'SELECT id FROM mailbox WHERE data->>\'name\' = $1',
      [targetName],
  );

  if (!targetMb.length) {
    targetMb = (await pool.query(
        'INSERT INTO mailbox(data) VALUES ($1) RETURNING id',
        [{name: targetName}],
    )).rows;
  }

  await pool.query('UPDATE mail SET mailbox = $1 WHERE id = $2',
      [targetMb[0].id, id]);
  return 204;
};
