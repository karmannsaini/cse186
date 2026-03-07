/**
 * Run schema.sql and data.sql against the database in .env (e.g. dev).
 * Usage: node scripts/seed-dev.js
 * Run from backend directory so that sql/ paths resolve.
 */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
dotenv.config({path: path.join(root, '.env')});

const pool = new pg.Pool({
  host: 'localhost',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

async function run(file) {
  const filePath = path.join(root, 'sql', file);
  const content = fs.readFileSync(filePath, 'utf8');
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
}

async function main() {
  try {
    await run('schema.sql');
    await run('data.sql');
    console.log('Dev database seeded.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
