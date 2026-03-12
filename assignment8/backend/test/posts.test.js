import {describe, test, expect} from 'vitest';
import request from 'supertest';
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

/**
 * Get Molly's auth token.
 * @returns {Promise<string>} JWT token
 */
async function mollyToken() {
  return await loginAndGetToken(server, 'molly@books.com', 'mollymember');
}

/**
 * Get Molly's token and visible posts.
 * @returns {Promise<{token: string, posts: Array<object>}>} token and posts
 */
async function mollyPosts() {
  const token = await mollyToken();
  const posts = await getPosts(server, token);
  expect(posts.length).toBeGreaterThan(0);
  return {token, posts};
}

/**
 * Pick a post authored by Molly (user id 1).
 * @param {Array<object>} posts visible posts
 * @returns {object} post authored by Molly
 */
function requireMine(posts) {
  const mine = posts.find((p) => p.authorId === 1);
  expect(mine).toBeDefined();
  return mine;
}

/**
 * Pick a post NOT authored by Molly.
 * @param {Array<object>} posts visible posts
 * @returns {object} post not authored by Molly
 */
function requireOther(posts) {
  const other = posts.find((p) => p.authorId !== 1);
  expect(other).toBeDefined();
  return other;
}

describe('GET /api/v0/posts', () => {
  test('returns posts for authenticated user sorted by date descending',
      async () => {
        const token = await mollyToken();
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
    const {token, posts: first} = await mollyPosts();
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

describe('PATCH /api/v0/posts/:postId', () => {
  test('allows author to edit their own post text', async () => {
    const {token, posts} = await mollyPosts();
    const mine = requireMine(posts);

    const newText = `${mine.content.text} (edited)`;
    await request(server)
        .patch(`/api/v0/posts/${mine.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({text: newText})
        .expect(204);

    const after = await getPosts(server, token);
    const updated = findPost(after, mine.id);
    expect(updated.content.text).toBe(newText);
  });

  test('rejects invalid text payload with 400', async () => {
    const {token, posts} = await mollyPosts();
    const mine = requireMine(posts);

    const res = await request(server)
        .patch(`/api/v0/posts/${mine.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({text: 123})
        .expect(400);
    expect(res.body).toHaveProperty('message');
  });

  test('returns 403 when editing a post by another author', async () => {
    const {token, posts} = await mollyPosts();
    const other = requireOther(posts);

    const res = await request(server)
        .patch(`/api/v0/posts/${other.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({text: 'not allowed'})
        .expect(403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
  });

  test('returns 404 when editing a non-existent post', async () => {
    const token = await mollyToken();

    const res = await request(server)
        .patch('/api/v0/posts/999999')
        .set('Authorization', `Bearer ${token}`)
        .send({text: 'nothing here'})
        .expect(404);
    expect(res.body).toHaveProperty('message', 'Post not found');
  });
});

describe('DELETE /api/v0/posts/:postId', () => {
  test('allows author to delete their own post', async () => {
    const {token, posts} = await mollyPosts();
    const mine = requireMine(posts);

    await request(server)
        .delete(`/api/v0/posts/${mine.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

    const after = await getPosts(server, token);
    const deleted = findPost(after, mine.id);
    expect(deleted).toBeUndefined();
  });

  test('returns 403 when deleting a post by another author', async () => {
    const {token, posts} = await mollyPosts();
    const other = requireOther(posts);

    const res = await request(server)
        .delete(`/api/v0/posts/${other.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
  });

  test('returns 404 when deleting a non-existent post', async () => {
    const token = await mollyToken();

    const res = await request(server)
        .delete('/api/v0/posts/999999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    expect(res.body).toHaveProperty('message', 'Post not found');
  });
});

