/*
#######################################################################
#
# Copyright (C) 2020-2026 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
/*
#######################################################################
#######               DO NOT MODIFY THIS FILE               ###########
#######################################################################
*/

import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
process.env.POSTGRES_DB='test';

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

const run = async (file) => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  let statement = '';
  for (let line of lines) {
    line = line.trim();
    if (!line.startsWith('--')) {
      statement += ' ' + line + '\n';
      if (line.endsWith(';')) {
        await pool.query(statement);
        statement = '';
      }
    }
  }
};

/**
 */
export function close() {
  pool.end();
};

/**
 */
export async function reset() {
  await run('sql/schema.sql');
  await run('sql/data.sql');
};
