import request from 'supertest';
import {beforeAll, afterAll, describe, test, expect} from 'vitest';
import server from '../src/app.js';
import {reset, close} from './db.js';

beforeAll(async () => {
  await reset();
});

afterAll(() => {
  close();
});

/**
 * Log in and return a JWT token string.
 * @param {string} email user email
 * @param {string} password user password
 * @returns {Promise<string>} token
 */
async function loginAndGetToken(email, password) {
  const response = await request(server)
      .post('/api/v0/auth/login')
      .send({email, password})
      .expect(200);

  return response.body.token;
}

describe('Groups API', () => {
  test('lists groups for a member', async () => {
    const token =
      await loginAndGetToken('molly@books.com', 'mollymember');

    const response = await request(server)
        .get('/api/v0/groups')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(3);

    const names = response.body.map((g) => g.name);
    expect(names).toContain('Books Club');
    expect(names).toContain('Cooking Circle');
    expect(names).toContain('Travel Buddies');
  });

  test('rejects unauthenticated group listing with 401', async () => {
    const response = await request(server)
        .get('/api/v0/groups')
        .expect(401);

    expect(response.body).toHaveProperty('message');
  });

  test('returns posts for a group the user is a member of', async () => {
    const token =
      await loginAndGetToken('molly@books.com', 'mollymember');

    const response = await request(server)
        .get('/api/v0/groups/1/posts')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(4);

    const groupIds = response.body.map((post) => post.content.groupId);
    const uniqueGroupIds = Array.from(new Set(groupIds));
    expect(uniqueGroupIds).toEqual([1]);
  });

  test('rejects access to group user is not a member of', async () => {
    const token =
      await loginAndGetToken('molly@books.com', 'mollymember');

    const response = await request(server)
        .get('/api/v0/groups/4/posts')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

    expect(response.body).toHaveProperty('message');
  });
});

