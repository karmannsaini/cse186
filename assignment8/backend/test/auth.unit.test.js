import {describe, test, expect, vi} from 'vitest';

vi.mock('../src/db.js', () => ({
  queryOne: vi.fn(),
}));

const {queryOne} = await import('../src/db.js');
const {login} = await import('../src/auth.js');

describe('auth.login unit (profile fallback branches)', () => {
  test('profile.email fallback when profile has no email', async () => {
    queryOne.mockResolvedValueOnce({
      id: 99,
      profile: {roles: ['member']},
    });
    const result = await login('param@email.com', 'pass');
    expect(result).not.toBeNull();
    expect(result.user.email).toBe('param@email.com');
  });

  test('profile.roles fallback when profile has no roles', async () => {
    queryOne.mockResolvedValueOnce({
      id: 98,
      profile: {email: 'noroles@test.com'},
    });
    const result = await login('noroles@test.com', 'pass');
    expect(result).not.toBeNull();
    expect(result.user.roles).toEqual([]);
  });

  test('row.profile fallback when profile is null', async () => {
    queryOne.mockResolvedValueOnce({
      id: 97,
      profile: null,
    });
    const result = await login('nullprofile@test.com', 'pass');
    expect(result).not.toBeNull();
    expect(result.user.roles).toEqual([]);
    expect(result.user.email).toBe('nullprofile@test.com');
  });
});
