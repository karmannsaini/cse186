import request from 'supertest';
import {beforeAll, afterAll, expect} from 'vitest';
import {reset, close} from './db.js';

/**
 * Register beforeAll/afterAll to reset DB and close pool.
 */
export function registerLifecycle() {
  beforeAll(async () => {
    await reset();
  });
  afterAll(() => {
    close();
  });
}

/**
 * Log in and return a JWT token string.
 * @param {object} server Express server or app
 * @param {string} email user email
 * @param {string} password user password
 * @returns {Promise<string>} token
 */
export async function loginAndGetToken(server, email, password) {
  const response = await request(server)
      .post('/api/v0/auth/login')
      .send({email, password})
      .expect(200);
  return response.body.token;
}

/**
 * Mount error handler, run request and assert 500 was passed.
 * @param {object} app Express app with router already mounted
 * @param {(client: unknown) => Promise<unknown>} makeRequest builds a request
 */
export async function assertErrorPropagated(app, makeRequest) {
  let capturedError = null;
  app.use((err, req, res, next) => {
    capturedError = err;
    res.status(500).json({message: 'Internal error'});
  });
  const response = await makeRequest(request(app));
  expect(response.body).toHaveProperty('message', 'Internal error');
  expect(capturedError).toBeInstanceOf(Error);
}
