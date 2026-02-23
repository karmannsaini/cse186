import {test, expect, beforeAll, afterAll, vi} from 'vitest';
import supertest from 'supertest';
import app from '../src/app.js';
import * as db from './db.js';
import * as srcDb from '../src/db.js';

const request = supertest(app);

beforeAll(async () => {
  await db.reset();
});

afterAll(async () => {
  db.close();
});

test('GET /api/v0/mailbox returns initial mailboxes', async () => {
  const response = await request
      .get('/api/v0/mailbox')
      .expect(200)
      .expect('Content-Type', /json/);

  expect(response.body).toEqual(['Inbox', 'Sent', 'Trash']);
});

test('GET /api/v0/mail?mailbox=Inbox returns array', async () => {
  const res = await request.get('/api/v0/mail?mailbox=Inbox');
  expect(Array.isArray(res.body)).toBe(true);
});

test('GET /api/v0/mail?mailbox=Inbox returns status 200', async () => {
  const res = await request.get('/api/v0/mail?mailbox=Inbox');
  expect(res.status).toBe(200);
});

test('GET /api/v0/mail?mailbox=Sent returns mail for Sent', async () => {
  const res = await request.get('/api/v0/mail?mailbox=Sent');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test('GET /api/v0/mail without query returns status 400', async () => {
  const res = await request.get('/api/v0/mail');
  expect(res.status).toBe(400);
});

test('GET /api/v0/mail with fake mailbox returns empty array', async () => {
  const res = await request.get('/api/v0/mail?mailbox=DoesNotExist');
  expect(res.body.length).toBe(0);
});

// Happy Path: Functionality
test('GET /api/v0/mail?mailbox=Inbox returns 200', async () => {
  await request.get('/api/v0/mail?mailbox=Inbox').expect(200);
});

test('GET /api/v0/mail?mailbox=Inbox returns JSON', async () => {
  await request.get('/api/v0/mail?mailbox=Inbox')
      .expect('Content-Type', /json/);
});

test('GET /api/v0/mail?mailbox=Inbox returns all items', async () => {
  const res = await request.get('/api/v0/mail?mailbox=Inbox');
  expect(res.body.length).toBeGreaterThan(0);
});

// Edge Case: Case Insensitivity
test('GET /api/v0/mail?mailbox=inbox (lowercase) works', async () => {
  const res = await request.get('/api/v0/mail?mailbox=inbox');
  expect(res.status).toBe(200);
});

// Error Handling: Bad Requests
test('GET /api/v0/mail missing query returns 400', async () => {
  await request.get('/api/v0/mail').expect(400);
});

test('GET /api/v0/mail with empty mailbox returns empty array', async () => {
  const res = await request.get('/api/v0/mail?mailbox=empty');
  expect(res.body).toEqual([]);
});

test('GET /api/v0/mailbox handles 500 Server Error', async () => {
  vi.spyOn(srcDb, 'selectMailboxes').mockRejectedValueOnce(new Error('Crash'));
  const res = await request.get('/api/v0/mailbox');
  expect(res.status).toBe(500);
});

test('GET /api/v0/mail handles 500 Server Error', async () => {
  vi.spyOn(srcDb, 'selectMail').mockRejectedValueOnce(new Error('DB Crash'));
  const res = await request.get('/api/v0/mail?mailbox=Inbox');
  expect(res.status).toBe(500);
});

// PUT /api/v0/mail/:id?mailbox=... Tests
test('PUT /api/v0/mail/:id moves mail (204)', async () => {
  // 1. Get a real ID from the Inbox first
  const getRes = await request.get('/api/v0/mail?mailbox=Inbox');
  const id = getRes.body[0].id;

  // 2. Move that specific ID to Trash
  const res = await request
      .put(`/api/v0/mail/${id}?mailbox=Trash`);
  expect(res.status).toBe(204);
});

test('PUT /api/v0/mail/:id to Sent is Forbidden (403)', async () => {
  const id = '999d3e8e-8e6f-469b-8f3b-6f8d3e8e6f8d';
  const res = await request
      .put(`/api/v0/mail/${id}?mailbox=Sent`);
  expect(res.status).toBe(403);
});

test('PUT /api/v0/mail/:id with invalid ID (404)', async () => {
  const fakeId = '00000000-0000-0000-0000-000000000000';
  const res = await request
      .put(`/api/v0/mail/${fakeId}?mailbox=Trash`);
  expect(res.status).toBe(404);
});

// Coverage for the moveMail 500 error
test('PUT /api/v0/mail/:id handles 500 Server Error', async () => {
  vi.spyOn(srcDb, 'moveMail').mockRejectedValueOnce(new Error('DB Crash'));
  const id = '999d3e8e-8e6f-469b-8f3b-6f8d3e8e6f8d';
  const res = await request.put(`/api/v0/mail/${id}?mailbox=Trash`);
  expect(res.status).toBe(500);
});

test('GET /api/v0/mail/:id returns full email object (200)', async () => {
  const listRes = await request.get('/api/v0/mail?mailbox=Inbox');
  const validId = listRes.body[0].id;
  const res = await request.get(`/api/v0/mail/${validId}`);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('content');
});

test('GET /api/v0/mail/:id with invalid ID returns 404', async () => {
  const fakeId = '00000000-0000-0000-0000-000000000000';
  const res = await request.get(`/api/v0/mail/${fakeId}`);
  // 404 branch
  expect(res.status).toBe(404);
});

test('GET /api/v0/mail/:id handles 500 Server Error', async () => {
  const spy = vi.spyOn(srcDb, 'selectMailById').mockImplementation(() => {
    throw new Error('Database Failure');
  });

  const res = await request.get('/api/v0/mail/123');
  expect(res.status).toBe(500);
  spy.mockRestore();
});
