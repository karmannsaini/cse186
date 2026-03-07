import express from 'express';
import {describe, test, vi} from 'vitest';
import {assertErrorPropagated} from './helpers.js';
import {createDbMock} from './errorTestSetup.js';

vi.mock('../src/db.js', () => createDbMock({
  queryOne: vi.fn().mockResolvedValue({id: 1}),
}));

import groupsRouter from '../src/routes/groups.js';

/**
 * Build an Express app with groups router and a fake authenticated user.
 * @returns {import('express').Express} configured app
 */
function createGroupsApp() {
  const app = express();
  app.use((req, res, next) => {
    req.user = {userId: 1};
    next();
  });
  app.use('/groups', groupsRouter);
  return app;
}

describe('groups router error handling', () => {
  test('propagates database errors via next', async () => {
    const app = createGroupsApp();
    await assertErrorPropagated(
        app,
        (client) => client.get('/groups').expect(500),
    );
  });

  test('propagates errors from group posts route', async () => {
    const app = createGroupsApp();
    await assertErrorPropagated(
        app,
        (client) => client
            .get('/groups/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d/posts')
            .expect(500),
    );
  });
});

