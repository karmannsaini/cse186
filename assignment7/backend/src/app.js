import express from 'express';
import cors from 'cors';
import path from 'path';
import {fileURLToPath} from 'url';
import * as OpenApiValidator from 'express-openapi-validator';
import * as Mailbox from './mailbox.js';
import {initStatus} from './notif.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.use(
    OpenApiValidator.middleware({
      apiSpec: path.join(__dirname, '../api/openapi.yaml'),
      validateRequests: true,
      validateResponses: true,
    }),
);

app.get('/api/v0/mailbox', Mailbox.getMailboxes);
app.get('/api/v0/mail', Mailbox.getMail);
app.get('/api/v0/mail/:id', Mailbox.getMailById);
app.put('/api/v0/mail/:id', Mailbox.moveMail);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

let server;
const originalListen = app.listen.bind(app);
app.listen = (...args) => {
  server = originalListen(...args);
  initStatus(server);
  return server;
};

app.close = (callback) => {
  if (server) {
    server.close(callback);
  }
};

export default app;
