import {describe, test, expect} from 'vitest';
import {mapPostRows} from '../src/utils.js';

describe('mapPostRows', () => {
  test('uses displayName when present', () => {
    const rows = [{
      id: 1,
      author_id: 10,
      content: {text: 'Hi', createdAt: '2025-01-01T00:00:00.000Z'},
      profile: {displayName: 'Alice', email: 'alice@test.com'},
    }];
    const result = mapPostRows(rows);
    expect(result).toHaveLength(1);
    expect(result[0].authorDisplayName).toBe('Alice');
  });

  test('uses email when displayName is missing', () => {
    const rows = [{
      id: 2,
      author_id: 20,
      content: {text: 'Bye', createdAt: '2025-01-02T00:00:00.000Z'},
      profile: {email: 'bob@test.com'},
    }];
    const result = mapPostRows(rows);
    expect(result).toHaveLength(1);
    expect(result[0].authorDisplayName).toBe('bob@test.com');
  });

  test('uses "Unknown" when profile has no displayName or email', () => {
    const rows = [{
      id: 3,
      author_id: 30,
      content: {text: 'Ok', createdAt: '2025-01-03T00:00:00.000Z'},
      profile: {},
    }];
    const result = mapPostRows(rows);
    expect(result).toHaveLength(1);
    expect(result[0].authorDisplayName).toBe('Unknown');
  });

  test('uses "Unknown" when profile is missing', () => {
    const rows = [{
      id: 4,
      author_id: 40,
      content: {text: 'Meh', createdAt: '2025-01-04T00:00:00.000Z'},
    }];
    const result = mapPostRows(rows);
    expect(result).toHaveLength(1);
    expect(result[0].authorDisplayName).toBe('Unknown');
  });
});
