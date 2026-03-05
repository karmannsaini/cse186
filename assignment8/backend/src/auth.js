import jwt from 'jsonwebtoken';
import {queryOne} from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET || 'dev-secret';

/**
 * Attempt to log a user in. Password verified in DB using pgcrypto.
 * @param {string} email email address
 * @param {string} password plain text password
 * @returns {Promise<object|null>} token and user info or null
 */
export async function login(email, password) {
  const row = await queryOne(
      'SELECT id, profile FROM users WHERE profile->>\'email\' = $1 ' +
      'AND password_hash = crypt($2, password_hash)',
      [email, password],
  );

  if (!row) {
    return null;
  }

  const profile = row.profile || {};
  const roles = profile.roles || [];
  const userEmail = profile.email || email;

  const payload = {
    userId: row.id,
    email: userEmail,
    roles,
  };

  const token = jwt.sign(payload, JWT_SECRET, {expiresIn: '1h'});

  return {
    token,
    user: {
      id: row.id,
      email: userEmail,
      displayName: profile.displayName || userEmail,
      roles,
    },
  };
}

/**
 * Express middleware to authenticate using a bearer JWT.
 * @param {import('express').Request} req request
 * @param {import('express').Response} res response
 * @param {import('express').NextFunction} next next
 */
export function authMiddleware(req, res, next) {
  const header = req.get('authorization') || '';
  if (!header.startsWith('Bearer ')) {
    res.status(401).json({message: 'Unauthorized'});
    return;
  }

  const token = header.substring('Bearer '.length);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({message: 'Unauthorized'});
  }
}

