import {vi} from 'vitest';

/**
 * Factory for db.js mock that rejects query(); add queryOne etc. via extra.
 * @param {object} [extra] extra keys (e.g. { queryOne: vi.fn() })
 * @returns {object} mock for vi.mock('../src/db.js', () => createDbMock(...))
 */
export function createDbMock(extra = {}) {
  return {
    query: vi.fn().mockRejectedValue(new Error('Database failure')),
    ...extra,
  };
}
