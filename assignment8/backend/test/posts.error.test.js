import express from 'express';
import request from 'supertest';
import {describe, test, expect, vi} from 'vitest';

vi.mock('../src/db.js', () => ({
  query: vi.fn().mockRejectedValue(new Error('Database failure')),
}));

import postsRouter from '../src/routes/posts.js';

describe('posts router error handling', () => {
  test('propagates database errors via next', async () => {
    const app = express();
    app.use('/posts', postsRouter);

    let capturedError = null;
    app.use((err, req, res, next) => {
      capturedError = err;
      res.status(500).json({message: 'Internal error'});
    });

    const response = await request(app)
        .get('/posts')
        .expect(500);

    expect(response.body).toHaveProperty('message', 'Internal error');
    expect(capturedError).toBeInstanceOf(Error);
  });
});

