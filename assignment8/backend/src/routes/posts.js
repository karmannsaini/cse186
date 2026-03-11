import express from 'express';
import {query, queryOne} from '../db.js';
import {mapPostRows, enrichPostsWithReactions} from '../utils.js';

const router = new express.Router();

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const baseResult = await query(
        'SELECT p.id, p.author_id, p.content, u.profile ' +
        'FROM posts p JOIN users u ON u.id = p.author_id ' +
        'LEFT JOIN group_members gm ON ' +
        '  gm.group_id = (NULLIF(p.content->>\'groupId\', \'\'))::uuid ' +
        '  AND gm.user_id = $1 ' +
        'WHERE p.content->>\'groupId\' IS NULL ' +
        '   OR p.content->>\'groupId\' = \'\' ' +
        '  OR gm.user_id IS NOT NULL ' +
        'ORDER BY (p.content->>\'createdAt\')::timestamptz DESC',
        [userId],
    );
    const rows = baseResult.rows;
    const posts = mapPostRows(rows);

    const enriched = await enrichPostsWithReactions(query, userId, posts);
    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

router.put('/:postId/reactions', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const postId = Number(req.params.postId);
    const {type} = req.body || {};

    const allowed = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
    if (!allowed.includes(type)) {
      res.status(400).json({message: 'Invalid reaction type'});
      return;
    }

    const post = await queryOne(
        'SELECT id FROM posts WHERE id = $1',
        [postId],
    );
    if (!post) {
      res.status(404).json({message: 'Post not found'});
      return;
    }

    await query(
        'INSERT INTO reactions (post_id, user_id, type) ' +
        'VALUES ($1, $2, $3) ' +
        'ON CONFLICT (post_id, user_id) DO UPDATE SET type = EXCLUDED.type',
        [postId, userId, type],
    );

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.delete('/:postId/reactions', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const postId = Number(req.params.postId);

    await query(
        'DELETE FROM reactions WHERE post_id = $1 AND user_id = $2',
        [postId, userId],
    );

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
