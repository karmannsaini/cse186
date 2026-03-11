import request from 'supertest';
import {beforeAll, afterAll, expect} from 'vitest';
import {reset, close} from './db.js';

/**
 * Register beforeAll/afterAll to reset DB and close pool.
 */
export function registerLifecycle() {
  beforeAll(async () => {
    await reset();
  });
  afterAll(() => {
    close();
  });
}

/**
 * Log in and return a JWT token string.
 * @param {object} server Express server or app
 * @param {string} email user email
 * @param {string} password user password
 * @returns {Promise<string>} token
 */
export async function loginAndGetToken(server, email, password) {
  const response = await request(server)
      .post('/api/v0/auth/login')
      .send({email, password})
      .expect(200);
  return response.body.token;
}

/**
 * Mount error handler, run request and assert 500 was passed.
 * @param {object} app Express app with router already mounted
 * @param {(client: unknown) => Promise<unknown>} makeRequest builds a request
 */
export async function assertErrorPropagated(app, makeRequest) {
  let capturedError = null;
  app.use((err, req, res, next) => {
    capturedError = err;
    res.status(500).json({message: 'Internal error'});
  });
  const response = await makeRequest(request(app));
  expect(response.body).toHaveProperty('message', 'Internal error');
  expect(capturedError).toBeInstanceOf(Error);
}

/**
 * GET /api/v0/posts with token, return response body.
 * @param {object} server Express server
 * @param {string} token JWT
 * @returns {Promise<Array>} posts array
 */
export async function getPosts(server, token) {
  const res = await request(server)
      .get('/api/v0/posts')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  return res.body;
}

/**
 * GET /api/v0/groups/:groupId/posts with token, return response body.
 * @param {object} server Express server
 * @param {string} token JWT
 * @param {string} groupId group UUID
 * @returns {Promise<Array>} posts array
 */
export async function getGroupPosts(server, token, groupId) {
  const res = await request(server)
      .get(`/api/v0/groups/${groupId}/posts`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  return res.body;
}

/**
 * Find post by id in posts array.
 * @param {Array<object>} posts posts list
 * @param {number} postId post id
 * @returns {object|undefined} post or undefined
 */
export function findPost(posts, postId) {
  return posts.find((p) => p.id === postId);
}

/**
 * Assert post has given reaction counts (and optional userReaction).
 * @param {object} post post object with reactions
 * @param {object} counts e.g. { like: 1, love: 1 }
 * @param {string} [userReaction] expected userReaction
 */
export function expectReactionCounts(post, counts, userReaction) {
  expect(post).toBeDefined();
  for (const [type, min] of Object.entries(counts)) {
    expect((post.reactions[type] ?? 0)).toBeGreaterThanOrEqual(min);
  }
  if (userReaction !== undefined) {
    expect(post.userReaction).toBe(userReaction);
  }
}
