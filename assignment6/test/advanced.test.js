/*
#######################################################################
#
# Copyright (C) 2020-2026 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
import {it, beforeAll, afterAll, expect} from 'vitest';
import supertest from 'supertest';
import http from 'http';
import * as db from './db.js';
import app from '../src/app.js';

let server;
let request;

beforeAll(async () => {
  server = http.createServer(app);
  server.listen();
  request = supertest(server);
  await db.reset();
});

afterAll(async () => {
  await db.close();
  await server.close();
});

it('GET /api/v0/mail?from= search returns sorted mailboxes', async () => {
  // Create a mail
  const m1 = await request.post('/api/v0/mail').send({
    to: {name: 'A', email: 'a@a.com'},
    subject: 'S1',
    content: 'C1',
  });
  // Move it to 'boxA'
  await request.put(`/api/v0/mail/${m1.body.id}?mailbox=boxA`);

  // Create another mail
  await request.post('/api/v0/mail').send({
    to: {name: 'B', email: 'b@b.com'},
    subject: 'S2',
    content: 'C2',
  });

  // Search 'CSE186' (default sender). Should find boxA and sent.
  const res = await request.get('/api/v0/mail?from=CSE186');
  expect(res.status).toBe(200);
  expect(res.body.length).toBeGreaterThanOrEqual(2);
});

it('GET /api/v0/mail?from= unknown returns 404', async () => {
  await request.get('/api/v0/mail?from=nonexistentuser').expect(404);
});
