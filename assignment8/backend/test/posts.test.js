import request from 'supertest';
import {describe, test, expect} from 'vitest';
import server from '../src/app.js';
import {
  registerLifecycle,
  loginAndGetToken,
  getPosts,
  findPost,
  expectReactionCounts,
} from './helpers.js';
import {query} from '../src/db.js';

registerLifecycle();

describe('GET /api/v0/posts', () => {
  test('returns posts for authenticated user sorted by date descending',
      async () => {
        const token =
          await loginAndGetToken(server, 'molly@books.com', 'mollymember');
        const body = await getPosts(server, token);
        expect(body.length).toBeGreaterThan(0);
        const dates = body.map((post) =>
          new Date(post.content.createdAt).getTime(),
        );
        expect(dates).toEqual([...dates].sort((a, b) => b - a));
      });

  test('returns empty list when user has no visible posts', async () => {
    const token =
      await loginAndGetToken(server, 'minimal@test.com', 'minimal');
    const body = await getPosts(server, token);
    expect(body.length).toBe(0);
  });

  test('rejects unauthenticated requests with 401', async () => {
    const response = await request(server)
        .get('/api/v0/posts')
        .expect(401);
    expect(response.body).toHaveProperty('message');
  });

  test('aggregates multiple reaction types per post', async () => {
    const token =
      await loginAndGetToken(server, 'molly@books.com', 'mollymember');
    const first = await getPosts(server, token);
    const postId = first[0]?.id;
    expect(postId).toBeDefined();
    await query('DELETE FROM reactions WHERE post_id = $1', [postId]);
    await query(
        'INSERT INTO reactions (post_id, user_id, type) ' +
        'VALUES ($1, 1, $2), ($1, 2, $3)',
        [postId, 'like', 'love'],
    );
    const body = await getPosts(server, token);
    expectReactionCounts(findPost(body, postId), {like: 1, love: 1});
  });
});

