import request from 'supertest';
import {describe, test, expect} from 'vitest';
import server from '../src/app.js';
import {registerLifecycle, loginAndGetToken} from './helpers.js';

registerLifecycle();

describe('GET /api/v0/posts', () => {
  test('returns posts for authenticated user sorted by date descending',
      async () => {
        const token =
        await loginAndGetToken(server, 'molly@books.com', 'mollymember');

        const response = await request(server)
            .get('/api/v0/posts')
            .set('Authorization', `Bearer ${token}`)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        const dates = response.body.map((post) =>
          new Date(post.content.createdAt).getTime(),
        );
        const sorted = [...dates].sort((a, b) => b - a);
        expect(dates).toEqual(sorted);
      });

  test('rejects unauthenticated requests with 401', async () => {
    const response = await request(server)
        .get('/api/v0/posts')
        .expect(401);

    expect(response.body).toHaveProperty('message');
  });
});

