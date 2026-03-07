import request from 'supertest';
import {describe, test, expect} from 'vitest';
import server from '../src/app.js';
import {registerLifecycle, loginAndGetToken} from './helpers.js';

registerLifecycle();

describe('Groups API', () => {
  test('lists groups for a member', async () => {
    const token =
      await loginAndGetToken(server, 'molly@books.com', 'mollymember');

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

  const BOOKS_CLUB_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
  const ADMINS_ONLY_ID = 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a';

  test('returns posts for a group the user is a member of', async () => {
    const token =
      await loginAndGetToken(server, 'molly@books.com', 'mollymember');

    const response = await request(server)
        .get(`/api/v0/groups/${BOOKS_CLUB_ID}/posts`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(4);

    const groupIds = response.body.map((post) => post.content.groupId);
    const uniqueGroupIds = Array.from(new Set(groupIds));
    expect(uniqueGroupIds).toEqual([BOOKS_CLUB_ID]);
  });

  test('rejects access to group user is not a member of', async () => {
    const token =
      await loginAndGetToken(server, 'molly@books.com', 'mollymember');

    const response = await request(server)
        .get(`/api/v0/groups/${ADMINS_ONLY_ID}/posts`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

    expect(response.body).toHaveProperty('message');
  });
});

