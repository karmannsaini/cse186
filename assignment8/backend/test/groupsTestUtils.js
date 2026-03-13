import express from 'express';
import groupsRouter from '../src/routes/groups.js';

/**
 * Build an Express app with groups router and a fake authenticated user.
 * @param {string} mountPath base path to mount router on
 * @returns {import('express').Express} configured app
 */
export function createGroupsApp(mountPath) {
  const app = express();
  app.use((req, res, next) => {
    req.user = {userId: 1};
    next();
  });
  app.use(mountPath, groupsRouter);
  return app;
}

