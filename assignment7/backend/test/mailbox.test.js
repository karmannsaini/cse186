import {it, expect, beforeAll, afterAll} from 'vitest';
import request from 'supertest';
import server from '../src/app';
import * as db from './db';

beforeAll(async () => {
  await db.reset();
});

afterAll(async () => {
  db.close();
});

it('GET /api/v0/mailbox returns initial mailboxes', async () => {
  const response = await request(server)
      .get('/api/v0/mailbox')
      .expect(200)
      .expect('Content-Type', /json/);

  expect(response.body).toEqual(['Inbox', 'Sent', 'Trash']);
});
