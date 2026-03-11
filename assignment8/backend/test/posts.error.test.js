import request from 'supertest';
import express from 'express';
import {describe, test, expect, vi} from 'vitest';
import {assertErrorPropagated} from './helpers.js';
import {createDbMock} from './errorTestSetup.js';

vi.mock('../src/db.js', () =>
  createDbMock({queryOne: vi.fn().mockResolvedValue({id: 1})}),
);

import postsRouter from '../src/routes/posts.js';

const fakeAuth = (req, _res, next) => {
  req.user = {userId: 1};
  next();
};

/**
 * Express app with posts router and fake auth for unit tests.
 * @returns {express.Express} App with /posts mounted and req.user set.
 */
function appWithPosts() {
  const app = express();
  app.use(express.json());
  app.use('/posts', fakeAuth, postsRouter);
  return app;
}

describe('posts router error handling', () => {
  test('propagates database errors via next', async () => {
    const app = express();
    app.use('/posts', postsRouter);
    await assertErrorPropagated(
        app,
        (client) => client.get('/posts').expect(500),
    );
  });

  test('PUT reactions returns 400 for invalid type', async () => {
    const app = appWithPosts();
    const res = await request(app)
        .put('/posts/1/reactions')
        .send({type: 'invalid'})
        .expect(400);
    expect(res.body).toHaveProperty('message', 'Invalid reaction type');
  });

  test('PUT reactions returns 400 when body is missing', async () => {
    const app = appWithPosts();
    const res = await request(app)
        .put('/posts/1/reactions')
        .expect(400);
    expect(res.body).toHaveProperty('message', 'Invalid reaction type');
  });

  test('PUT reactions propagates DB errors via next', async () => {
    const app = appWithPosts();
    await assertErrorPropagated(
        app,
        (client) =>
          client.put('/posts/1/reactions').send({type: 'like'}).expect(500),
    );
  });

  test('DELETE reactions propagates DB errors via next', async () => {
    const app = appWithPosts();
    await assertErrorPropagated(
        app,
        (client) => client.delete('/posts/1/reactions').expect(500),
    );
  });
});

