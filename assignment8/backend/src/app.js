/*
#######################################################################
#
# Copyright (C) 2020-2026  David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
import express from 'express';
import cors from 'cors';
import yaml from 'js-yaml';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'node:path';
import OpenApiValidator from 'express-openapi-validator';
import {fileURLToPath} from 'node:url';
import http from 'http';
import authRouter from './routes/auth.js';
import {authMiddleware} from './auth.js';
import postsRouter from './routes/posts.js';
import groupsRouter from './routes/groups.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));

const apiSpec = path.join(__dirname, '../api/openapi.yaml');

const apidoc = yaml.load(fs.readFileSync(apiSpec, 'utf8'));
app.use('/api/v0/docs', swaggerUi.serve, swaggerUi.setup(apidoc));

// Allow connections from a non common origin so dev and preview
// UIs can connect
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4173'],
}));

if (process.env.NODE_ENV === 'test') {
  app.get('/api/v0/__coverage_err_status', (_req, _res, next) => {
    const e = new Error('teapot');
    e.status = 418;
    next(e);
  });
  app.get('/api/v0/__coverage_err_no_status', (_req, _res, next) => {
    next(new Error('no status'));
  });
}

app.use(
    OpenApiValidator.middleware({
      apiSpec: apiSpec,
      validateRequests: true,
      validateResponses: true,
    }),
);

// Your routes go here; however, do NOT write then inline.
// Create additional modules and delegate to their exports.

app.use('/api/v0/auth', authRouter);
app.use('/api/v0/posts', authMiddleware, postsRouter);
app.use('/api/v0/groups', authMiddleware, groupsRouter);

app.use((err, req, res, next) => {
  const status = Number.isInteger(err?.status) ? err.status : 500;
  res.status(status).json({
    message: err.message,
    errors: err.errors,
    status,
  });
});

const server = http.createServer(app);
export {app};
export default server;
