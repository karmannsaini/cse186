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

it('GET /api/v0/mail returns all mailboxes', async () => {
  const res = await request.get('/api/v0/mail');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBeTruthy();
  const names = res.body.map((mb) => mb.name);
  expect(names.indexOf('inbox') !== -1).toBeTruthy();
  // Check content is removed
  if (res.body[0] && res.body[0].mail && res.body[0].mail[0]) {
    expect(res.body[0].mail[0].content).toBeUndefined();
  }
});

it('GET /api/v0/mail?mailbox=inbox returns only inbox', async () => {
  const res = await request.get('/api/v0/mail?mailbox=inbox');
  expect(res.status).toBe(200);
  expect(res.body.length).toBe(1);
  expect(res.body[0].name).toBe('inbox');
});

it('GET /api/v0/mail?mailbox=invalid returns 404', async () => {
  await request.get('/api/v0/mail?mailbox=invalid').expect(404);
});

it('GET /api/v0/mail/{id} returns full email', async () => {
  const all = await request.get('/api/v0/mail');
  const targetId = all.body[0].mail[0].id;
  const res = await request.get('/api/v0/mail/' + targetId);
  expect(res.status).toBe(200);
  expect(res.body.content).toBeDefined();
});

it('GET /api/v0/mail/{id} unknown UUID returns 404', async () => {
  const unknown = '00000000-0000-0000-0000-000000000000';
  await request.get('/api/v0/mail/' + unknown).expect(404);
});

it('GET /api/v0/mail/{id} invalid UUID format returns 400', async () => {
  const res = await request.get('/api/v0/mail/not-a-uuid');
  expect(res.status).toBe(400);
  expect(res.body.message).toBeDefined();
});

it('POST /api/v0/mail creates new sent mail', async () => {
  const payload = {
    to: {name: 'Test', email: 'test@test.com'},
    subject: 'Sub',
    content: 'Con',
  };
  const res = await request.post('/api/v0/mail').send(payload);
  expect(res.status).toBe(201);
  expect(res.body.from.name).toBe('CSE186 Student');
});

it('POST /api/v0/mail with invalid property returns 400', async () => {
  const payload = {
    to: {name: 'Test', email: 'test@test.com'},
    subject: 'Sub',
    content: 'Con',
    garbage: 'property',
  };
  await request.post('/api/v0/mail').send(payload).expect(400);
});

it('PUT /api/v0/mail/{id} moves email and creates mailbox', async () => {
  const all = await request.get('/api/v0/mail?mailbox=inbox');
  const targetId = all.body[0].mail[0].id;
  await request.put('/api/v0/mail/' + targetId + '?mailbox=newbox').expect(204);
});

it('PUT /api/v0/mail/{id} to sent from inbox returns 409', async () => {
  const all = await request.get('/api/v0/mail?mailbox=inbox');
  const targetId = all.body[0].mail[0].id;
  await request.put('/api/v0/mail/' + targetId + '?mailbox=sent').expect(409);
});


it('PUT /api/v0/mail/{id} moves email to existing mailbox', async () => {
  // First get a mail from inbox
  const all = await request.get('/api/v0/mail?mailbox=inbox');
  const targetId = all.body[0].mail[0].id;
  // Move it to 'trash' which already exists in seed data
  await request.put('/api/v0/mail/' + targetId + '?mailbox=trash').expect(204);
  // is it there
  const trash = await request.get('/api/v0/mail?mailbox=trash');
  const found = trash.body[0].mail.find((m) => m.id === targetId);
  expect(found).toBeDefined();
});


it('GET /api/v0/mail?mailbox returns empty box if empty', async () => {
  // create a new mail
  const payload = {
    to: {name: 'Test', email: 't@t.com'},
    subject: 'Temp',
    content: 'Temp',
  };
  const newMail = await request.post('/api/v0/mail').send(payload);
  const id = newMail.body.id;

  // Move it to a new mailbox 'tempbox'
  await request.put('/api/v0/mail/' + id + '?mailbox=tempbox').expect(204);

  // move it OUT of 'tempbox' to 'trash'
  await request.put('/api/v0/mail/' + id + '?mailbox=trash').expect(204);

  // it should exist but be empty
  const res = await request.get('/api/v0/mail?mailbox=tempbox');
  expect(res.status).toBe(200);
  expect(res.body[0].name).toBe('tempbox');
  expect(res.body[0].mail.length).toBe(0);
});

it('PUT /api/v0/mail/{id} returns 404 if email not found', async () => {
  const unknown = '00000000-0000-0000-0000-000000000000';
  await request.put('/api/v0/mail/' + unknown + '?mailbox=trash').expect(404);
});
