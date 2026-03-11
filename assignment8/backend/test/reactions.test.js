import {describe, it, expect} from 'vitest';
import supertest from 'supertest';
import server from '../src/app.js';
import {
  registerLifecycle,
  loginAndGetToken,
  getPosts,
  findPost,
  expectReactionCounts,
} from './helpers.js';

const request = supertest(server);

registerLifecycle();

describe('post reactions API', () => {
  it('treats missing reaction count as zero in helper', () => {
    const post = {id: 1, reactions: {}};
    expectReactionCounts(post, {like: 0});
  });

  it('allows setting and changing a reaction on a post', async () => {
    const token =
      await loginAndGetToken(server, 'molly@books.com', 'mollymember');
    const posts = await getPosts(server, token);
    expect(posts.length).toBeGreaterThan(0);
    const postId = posts[0].id;

    await request
        .put(`/api/v0/posts/${postId}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .send({type: 'like'})
        .expect(204);

    const afterLike = await getPosts(server, token);
    expectReactionCounts(findPost(afterLike, postId), {like: 1}, 'like');

    await request
        .put(`/api/v0/posts/${postId}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .send({type: 'love'})
        .expect(204);

    const afterLove = await getPosts(server, token);
    expectReactionCounts(findPost(afterLove, postId), {love: 1}, 'love');
  });

  it('allows removing a reaction', async () => {
    const token =
      await loginAndGetToken(server, 'molly@books.com', 'mollymember');
    const posts = await getPosts(server, token);
    const postId = posts[0].id;

    await request
        .put(`/api/v0/posts/${postId}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .send({type: 'like'});

    await request
        .delete(`/api/v0/posts/${postId}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

    const afterDelete = await getPosts(server, token);
    const post = findPost(afterDelete, postId);
    expect(post.userReaction === null || post.userReaction === undefined)
        .toBe(true);
  });

  it('rejects invalid reaction types', async () => {
    const token =
      await loginAndGetToken(server, 'molly@books.com', 'mollymember');
    const posts = await getPosts(server, token);
    const postId = posts[0].id;

    const bad = await request
        .put(`/api/v0/posts/${postId}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .send({type: 'invalid'});
    expect(bad.status).toBe(400);
  });

  it('returns 404 when reacting to a non-existent post', async () => {
    const token =
      await loginAndGetToken(server, 'molly@books.com', 'mollymember');

    const response = await request
        .put('/api/v0/posts/999999/reactions')
        .set('Authorization', `Bearer ${token}`)
        .send({type: 'like'});
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'Post not found');
  });
});
