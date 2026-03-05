import express from 'express';
import {query, queryOne} from '../db.js';

const router = new express.Router();

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await query(
        'SELECT g.id, g.info ' +
        'FROM groups g ' +
        'JOIN group_members gm ON gm.group_id = g.id ' +
        'WHERE gm.user_id = $1 ' +
        'ORDER BY g.id',
        [userId],
    );

    const groups = result.rows.map((row) => ({
      id: row.id,
      name: row.info.name,
      description: row.info.description,
    }));

    res.json(groups);
  } catch (err) {
    next(err);
  }
});

router.get('/:groupId/posts', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const groupId = Number(req.params.groupId);

    const membership = await queryOne(
        'SELECT 1 FROM groups g ' +
        'JOIN group_members gm ON gm.group_id = g.id ' +
        'WHERE gm.user_id = $1 AND g.id = $2',
        [userId, groupId],
    );

    if (!membership) {
      res.status(403).json({message: 'Forbidden'});
      return;
    }

    const result = await query(
        'SELECT id, author_id, content FROM posts ' +
        'WHERE (content->>\'groupId\')::integer = $1 ' +
        'ORDER BY (content->>\'createdAt\')::timestamptz DESC',
        [groupId],
    );

    const posts = result.rows.map((row) => ({
      id: row.id,
      authorId: row.author_id,
      content: row.content,
    }));

    res.json(posts);
  } catch (err) {
    next(err);
  }
});

export default router;

