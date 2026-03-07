import express from 'express';
import {describe, test, vi} from 'vitest';
import {assertErrorPropagated} from './helpers.js';

vi.mock('../src/auth.js', () => ({
  login: vi.fn().mockRejectedValue(new Error('Login failure')),
}));

import authRouter from '../src/routes/auth.js';

describe('auth router error handling', () => {
  test('propagates login errors via next', async () => {
    const app = express();
    app.use(express.json());
    app.use('/api/v0/auth', authRouter);
    await assertErrorPropagated(
        app,
        (client) => client
            .post('/api/v0/auth/login')
            .send({email: 'user@example.com', password: 'badpass'})
            .expect(500),
    );
  });
});

