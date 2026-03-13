import request from 'supertest';
import {describe, test, expect, vi} from 'vitest';
import {createGroupsApp} from './groupsTestUtils.js';

vi.mock('../src/db.js', () => ({
  queryOne: vi.fn().mockResolvedValue({id: 1}),
  query: vi.fn().mockResolvedValue({
    rows: [
      {
        id: 1,
        profile: {
          displayName: 'Display Name',
          email: 'display@example.com',
          roles: ['member'],
        },
      },
      {
        id: 2,
        profile: {
          email: 'email-only@example.com',
        },
      },
      {
        id: 3,
        profile: null,
      },
    ],
  }),
}));

describe('Group members profile mapping', () => {
  test(
      'handles profiles with and without displayName/email/roles',
      async () => {
        const app = createGroupsApp('/api/v0/groups');
        const res = await request(app)
            .get('/api/v0/groups/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d/members')
            .expect(200);

        expect(res.body).toEqual([
          {
            id: 1,
            displayName: 'Display Name',
            email: 'display@example.com',
            roles: ['member'],
          },
          {
            id: 2,
            displayName: 'email-only@example.com',
            email: 'email-only@example.com',
            roles: [],
          },
          {
            id: 3,
            displayName: '3',
            email: undefined,
            roles: [],
          },
        ]);
      },
  );
});

