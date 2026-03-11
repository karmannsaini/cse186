import request from 'supertest';
import {describe, test, expect, vi} from 'vitest';
import server from '../src/app.js';

describe('app error handler coverage', () => {
  test('uses err.status when it is an integer', async () => {
    const res = await request(server)
        .get('/api/v0/__coverage_err_status')
        .expect(418);
    expect(res.body).toHaveProperty('status', 418);
    expect(res.body).toHaveProperty('message', 'teapot');
  });

  test('uses 500 when err.status is not an integer', async () => {
    const res = await request(server)
        .get('/api/v0/__coverage_err_no_status')
        .expect(500);
    expect(res.body).toHaveProperty('status', 500);
    expect(res.body).toHaveProperty('message', 'no status');
  });

  test('CORS allows origin localhost:4173', async () => {
    await request(server)
        .get('/api/v0/docs/')
        .set('Origin', 'http://localhost:4173')
        .expect(200);
  });

  test('does not register test routes when NODE_ENV is not test', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    const {default: serverProd} = await import('../src/app.js');
    const res = await request(serverProd).get('/api/v0/__coverage_err_status');
    expect(res.status).toBe(404);
    vi.unstubAllEnvs();
    vi.resetModules();
  });
});
