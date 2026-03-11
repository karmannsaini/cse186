import request from 'supertest';
import {describe, test, expect} from 'vitest';
import server from '../src/app.js';
import {
  registerLifecycle,
  loginAndGetToken,
  getGroupPosts,
  findPost,
  expectReactionCounts,
} from './helpers.js';
import {query, queryOne} from '../src/db.js';

registerLifecycle();

const BOOKS_CLUB_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const ADMINS_ONLY_ID = 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a';

describe('Groups API', () => {
  test('lists groups for a member', async () => {
    const token =
      await loginAndGetToken(server, 'molly@books.com', 'mollymember');
    const response = await request(server)
        .get('/api/v0/groups')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    expect(response.body.length).toBeGreaterThanOrEqual(3);
    const names = response.body.map((g) => g.name);
    expect(names).toContain('Books Club');
    expect(names).toContain('Cooking Circle');
    expect(names).toContain('Travel Buddies');
  });

  test('rejects unauthenticated group listing with 401', async () => {
    const response = await request(server)
        .get('/api/v0/groups')
        .expect(401);
    expect(response.body).toHaveProperty('message');
  });

  test('returns posts for a group the user is a member of', async () => {
    const token =
      await loginAndGetToken(server, 'molly@books.com', 'mollymember');
    const body = await getGroupPosts(server, token, BOOKS_CLUB_ID);
    expect(body.length).toBeGreaterThanOrEqual(4);
    const groupIds = body.map((post) => post.content.groupId);
    expect(Array.from(new Set(groupIds))).toEqual([BOOKS_CLUB_ID]);
  });

  test('returns empty array when group has no posts', async () => {
    const token =
      await loginAndGetToken(server, 'molly@books.com', 'mollymember');
    const insertGroup = await query(
        'INSERT INTO groups (owner_id, info) VALUES ' +
        '(1, \'{"name": "Empty Group", "description": "No posts"}\') ' +
        'RETURNING id',
        [],
    );
    const newGroupId = insertGroup.rows[0].id;
    await query(
        'INSERT INTO group_members (user_id, group_id) VALUES ($1, $2)',
        [1, newGroupId],
    );
    const body = await getGroupPosts(server, token, newGroupId);
    expect(body.length).toBe(0);
  });

  test('includes reactions metadata for group posts', async () => {
    const token =
      await loginAndGetToken(server, 'molly@books.com', 'mollymember');
    const postRow = await queryOne(
        'SELECT id FROM posts WHERE content->>\'groupId\' = $1 LIMIT 1',
        [BOOKS_CLUB_ID],
    );
    const postId = postRow.id;
    await query(
        'INSERT INTO reactions (post_id, user_id, type) ' +
        'VALUES ($1, $2, \'like\')',
        [postId, 1],
    );
    const body = await getGroupPosts(server, token, BOOKS_CLUB_ID);
    expectReactionCounts(findPost(body, postId), {like: 1}, 'like');
  });

  test('aggregates multiple reaction types on same post', async () => {
    const token =
      await loginAndGetToken(server, 'molly@books.com', 'mollymember');
    const postRow = await queryOne(
        'SELECT id FROM posts WHERE content->>\'groupId\' = $1 ' +
        'AND id NOT IN (SELECT post_id FROM reactions) LIMIT 1',
        [BOOKS_CLUB_ID],
    );
    const postId = postRow.id;
    await query(
        'INSERT INTO reactions (post_id, user_id, type) ' +
        'VALUES ($1, 1, $2), ($1, 2, $3)',
        [postId, 'like', 'love'],
    );
    const body = await getGroupPosts(server, token, BOOKS_CLUB_ID);
    expectReactionCounts(findPost(body, postId), {like: 1, love: 1});
  });

  test('rejects access to group user is not a member of', async () => {
    const token =
      await loginAndGetToken(server, 'molly@books.com', 'mollymember');
    const response = await request(server)
        .get(`/api/v0/groups/${ADMINS_ONLY_ID}/posts`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    expect(response.body).toHaveProperty('message');
  });
});

