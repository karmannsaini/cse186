import express from 'express';
import {query, queryOne} from '../db.js';
import {mapPostRows, enrichPostsWithReactions} from '../utils.js';

const groupRouter = new express.Router();

/**
 * Ensure the authenticated user is a member of the given group.
 * Sends 403 and returns null if not; otherwise returns the membership row.
 * @param {object} res Express response
 * @param {number} userId authenticated user id
 * @param {string} groupId group UUID string
 * @returns {Promise<object|null>} membership row or null if forbidden
 */
async function loadMembershipOrSendForbidden(res, userId, groupId) {
  const membership = await queryOne(
      'SELECT 1 FROM groups g ' +
      'JOIN group_members gm ON gm.group_id = g.id ' +
      'WHERE gm.user_id = $1 AND g.id = $2::uuid',
      [userId, groupId],
  );
  if (!membership) {
    res.status(403).json({message: 'Forbidden'});
    return null;
  }
  return membership;
}

/**
 * Wrap a route handler with group membership authorization.
 * @param {(req: import('express').Request,
 *   res: import('express').Response,
 *   next: import('express').NextFunction,
 *   userId: number,
 *   groupId: string) => Promise<void>} handler
 *   route handler called after authorization
 * @returns {(req: import('express').Request,
 *   res: import('express').Response,
 *   next: import('express').NextFunction) => Promise<void>}
 *   Express middleware handler
 */
function withGroupMembership(handler) {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const groupId = req.params.groupId;
      const membership = await loadMembershipOrSendForbidden(
          res,
          userId,
          groupId,
      );
      if (!membership) return;
      await handler(req, res, next, userId, groupId);
    } catch (err) {
      next(err);
    }
  };
}

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

groupRouter.get(
    '/:groupId/members',
    withGroupMembership(async (_req, res, _next, _userId, groupId) => {
      const result = await query(
          'SELECT u.id, u.profile ' +
          'FROM group_members gm ' +
          'JOIN users u ON u.id = gm.user_id ' +
          'WHERE gm.group_id = $1::uuid ' +
          'ORDER BY u.id',
          [groupId],
      );

      const members = result.rows.map((row) => {
        const profile = row.profile || {};
        return {
          id: row.id,
          displayName: profile.displayName || profile.email || String(row.id),
          email: profile.email,
          roles: profile.roles || [],
        };
      });

      res.json(members);
    }),
);

groupRouter.get(
    '/:groupId/posts',
    withGroupMembership(async (_req, res, _next, userId, groupId) => {
      const baseResult = await query(
          'SELECT p.id, p.author_id, p.content, u.profile ' +
          'FROM posts p JOIN users u ON u.id = p.author_id ' +
          'WHERE p.content->>\'groupId\' = $1 ' +
          'ORDER BY (p.content->>\'createdAt\')::timestamptz DESC',
          [groupId],
      );
      const posts = mapPostRows(baseResult.rows);
      res.json(await enrichPostsWithReactions(query, userId, posts));
    }),
);

export default groupRouter;

