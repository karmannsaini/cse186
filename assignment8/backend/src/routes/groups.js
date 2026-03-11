import express from 'express';
import {query, queryOne} from '../db.js';
import {mapPostRows, enrichPostsWithReactions} from '../utils.js';

const groupRouter = new express.Router();

groupRouter.get('/', async (req, res, next) => {
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

groupRouter.get('/:groupId/posts', async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const groupId = req.params.groupId;

    const membership = await queryOne(
        'SELECT 1 FROM groups g ' +
        'JOIN group_members gm ON gm.group_id = g.id ' +
        'WHERE gm.user_id = $1 AND g.id = $2::uuid',
        [userId, groupId],
    );

    if (!membership) {
      res.status(403).json({message: 'Forbidden'});
      return;
    }

    const baseResult = await query(
        'SELECT p.id, p.author_id, p.content, u.profile ' +
        'FROM posts p JOIN users u ON u.id = p.author_id ' +
        'WHERE p.content->>\'groupId\' = $1 ' +
        'ORDER BY (p.content->>\'createdAt\')::timestamptz DESC',
        [groupId],
    );
    const posts = mapPostRows(baseResult.rows);
    return res.json(await enrichPostsWithReactions(query, userId, posts));
  } catch (err) {
    next(err);
  }
});

export default groupRouter;

