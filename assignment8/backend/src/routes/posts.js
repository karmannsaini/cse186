import express from 'express';
import {query} from '../db.js';
import {mapPostRows} from '../utils.js';

const router = new express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await query(
        'SELECT p.id, p.author_id, p.content, u.profile ' +
        'FROM posts p JOIN users u ON u.id = p.author_id ' +
        'LEFT JOIN group_members gm ON ' +
        '  gm.group_id = (NULLIF(p.content->>\'groupId\', \'\'))::uuid ' +
        '  AND gm.user_id = $1 ' +
        'WHERE p.content->>\'groupId\' IS NULL ' +
        '   OR p.content->>\'groupId\' = \'\' ' +
        '  OR gm.user_id IS NOT NULL ' +
        'ORDER BY (p.content->>\'createdAt\')::timestamptz DESC',
        [req.user.userId],
    );
    res.json(mapPostRows(result.rows));
  } catch (err) {
    next(err);
  }
});

export default router;

