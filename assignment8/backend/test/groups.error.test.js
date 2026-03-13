import {describe, test, vi} from 'vitest';
import {assertErrorPropagated} from './helpers.js';
import {createDbMock} from './errorTestSetup.js';
import {createGroupsApp} from './groupsTestUtils.js';

vi.mock('../src/db.js', () => createDbMock({
  queryOne: vi.fn().mockResolvedValue({id: 1}),
}));

/**
 * Build an Express app with groups router mounted at /groups for error tests.
 * @returns {import('express').Express} configured app
 */
function createErrorApp() {
  // Mount at /groups so existing helper expectations continue to work.
  return createGroupsApp('/groups');
}

describe('groups router error handling', () => {
  test('propagates database errors via next', async () => {
    const app = createErrorApp();
    await assertErrorPropagated(
        app,
        (client) => client.get('/groups').expect(500),
    );
  });

  test('propagates errors from group posts route', async () => {
    const app = createErrorApp();
    await assertErrorPropagated(
        app,
        (client) => client
            .get('/groups/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d/posts')
            .expect(500),
    );
  });

  test('propagates errors from group members route', async () => {
    const app = createErrorApp();
    await assertErrorPropagated(
        app,
        (client) => client
            .get('/groups/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d/members')
            .expect(500),
    );
  });
});

