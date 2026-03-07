import request from 'supertest';
import {beforeAll, describe, test, expect, vi} from 'vitest';
import {registerLifecycle} from './helpers.js';

registerLifecycle();

let serverDevSecret;
let serverSecretFallback;

beforeAll(async () => {
  vi.stubEnv('JWT_SECRET', '');
  vi.stubEnv('SECRET', '');
  vi.resetModules();
  const mod1 = await import('../src/app.js');
  serverDevSecret = mod1.default;

  vi.stubEnv('JWT_SECRET', '');
  vi.stubEnv('SECRET', 'fallback-secret');
  vi.resetModules();
  const mod2 = await import('../src/app.js');
  serverSecretFallback = mod2.default;
});

describe('auth JWT_SECRET fallback branches', () => {
  test('login works when JWT_SECRET and SECRET unset (uses dev-secret)',
      async () => {
        const response = await request(serverDevSecret)
            .post('/api/v0/auth/login')
            .send({email: 'molly@books.com', password: 'mollymember'})
            .expect(200);
        expect(response.body).toHaveProperty('token');
      });

  test('login works when SECRET set but JWT_SECRET unset', async () => {
    const response = await request(serverSecretFallback)
        .post('/api/v0/auth/login')
        .send({email: 'molly@books.com', password: 'mollymember'})
        .expect(200);
    expect(response.body).toHaveProperty('token');
  });
});
