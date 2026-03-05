import express from 'express';
import {query} from '../db.js';

const router = new express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await query(
        'SELECT id, author_id, content FROM posts ' +
        'ORDER BY (content->>\'createdAt\')::timestamptz DESC',
        [],
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

