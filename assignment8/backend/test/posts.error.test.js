import express from 'express';
import {describe, test, vi} from 'vitest';
import {assertErrorPropagated} from './helpers.js';
import {createDbMock} from './errorTestSetup.js';

vi.mock('../src/db.js', () => createDbMock());

import postsRouter from '../src/routes/posts.js';

describe('posts router error handling', () => {
  test('propagates database errors via next', async () => {
    const app = express();
    app.use('/posts', postsRouter);
    await assertErrorPropagated(
        app,
        (client) => client.get('/posts').expect(500),
    );
  });
});

