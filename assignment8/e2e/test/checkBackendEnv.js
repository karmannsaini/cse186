import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.join(__dirname, '..', '..', 'backend');
const envPath = path.join(backendDir, '.env');

const required = [
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'SECRET',
];

function parseEnv(text) {
  const values = {};
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const idx = line.indexOf('=');
    if (idx < 0) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    values[key] = value;
  }
  return values;
}

if (!fs.existsSync(envPath)) {
  console.error('Missing backend .env file.');
  console.error('Create backend/.env from backend/.env.example.');
  process.exit(1);
}

const envValues = parseEnv(fs.readFileSync(envPath, 'utf8'));
const missing = required.filter((key) => !envValues[key]);

if (missing.length > 0) {
  console.error('backend/.env is missing required values:');
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  process.exit(1);
}

console.log('Backend env check passed.');
