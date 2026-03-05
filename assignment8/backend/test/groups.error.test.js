import express from 'express';
import request from 'supertest';
import {describe, test, expect, vi} from 'vitest';

vi.mock('../src/db.js', () => ({
  query: vi.fn().mockRejectedValue(new Error('Database failure')),
  queryOne: vi.fn(),
}));

import groupsRouter from '../src/routes/groups.js';

describe('groups router error handling', () => {
  test('propagates database errors via next', async () => {
    const app = express();
    app.use((req, res, next) => {
      req.user = {userId: 1};
      next();
    });
    app.use('/groups', groupsRouter);

    let capturedError = null;
    app.use((err, req, res, next) => {
      capturedError = err;
      res.status(500).json({message: 'Internal error'});
    });

    const response = await request(app)
        .get('/groups')
        .expect(500);

    expect(response.body).toHaveProperty('message', 'Internal error');
    expect(capturedError).toBeInstanceOf(Error);
  });
});

