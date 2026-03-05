import {describe, test, expect, vi} from 'vitest';
import {authMiddleware} from '../src/auth.js';

/**
 * Create mock req, res, and next objects for testing middleware.
 * @param {string|undefined} header authorization header value
 * @returns {object} mocks
 */
function createMocks(header) {
  const req = {
    get: vi.fn(() => header),
  };
  const status = vi.fn().mockReturnThis();
  const json = vi.fn();
  const res = {status, json};
  const next = vi.fn();
  return {req, res, next, status, json};
}

describe('authMiddleware', () => {
  test('returns 401 when Authorization header is missing', () => {
    const {req, res, next, status, json} = createMocks(undefined);

    authMiddleware(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({message: 'Unauthorized'});
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when token is invalid', () => {
    const {req, res, next, status, json} = createMocks('Bearer invalid.token');

    authMiddleware(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({message: 'Unauthorized'});
    expect(next).not.toHaveBeenCalled();
  });
});

