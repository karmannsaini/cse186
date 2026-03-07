import request from 'supertest';
import {describe, test, expect} from 'vitest';
import server from '../src/app.js';
import {registerLifecycle} from './helpers.js';

registerLifecycle();

describe('POST /api/v0/auth/login', () => {
  test('logs in valid user and returns JWT', async () => {
    const response = await request(server)
        .post('/api/v0/auth/login')
        .send({
          email: 'molly@books.com',
          password: 'mollymember',
        })
        .expect(200);

    expect(response.body).toHaveProperty('token');
    expect(typeof response.body.token).toBe('string');

    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toMatchObject({
      email: 'molly@books.com',
    });
  });

  test('rejects invalid password with 401', async () => {
    const response = await request(server)
        .post('/api/v0/auth/login')
        .send({
          email: 'molly@books.com',
          password: 'wrongpassword',
        })
        .expect(401);

    expect(response.body).toHaveProperty('message');
  });

  test('rejects unknown user with 401', async () => {
    const response = await request(server)
        .post('/api/v0/auth/login')
        .send({
          email: 'unknown@example.com',
          password: 'whatever',
        })
        .expect(401);

    expect(response.body).toHaveProperty('message');
  });

  test('handles user with minimal profile (roles/displayName fallbacks)',
      async () => {
        const response = await request(server)
            .post('/api/v0/auth/login')
            .send({email: 'minimal@test.com', password: 'minimal'})
            .expect(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body.user).toMatchObject({
          email: 'minimal@test.com',
          displayName: 'minimal@test.com',
          roles: [],
        });
      });

  test('rejects malformed payload with 400', async () => {
    const response = await request(server)
        .post('/api/v0/auth/login')
        .send({
          email: 'not-an-email',
        })
        .expect(400);

    expect(response.body).toHaveProperty('message');
  });
});

