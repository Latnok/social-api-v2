import request from 'supertest';
import { testApp } from './utils';

describe('Auth', () => {
  it('registers and returns access token + refresh cookie', async () => {
    const app = testApp();
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'a@example.com', password: 'pass12345', displayName: 'Alice' })
      .expect(201);

    expect(res.body.user.email).toBe('a@example.com');
    expect(res.body.accessToken).toBeTruthy();
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('logs in with existing user', async () => {
    const app = testApp();
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'b@example.com', password: 'pass12345', displayName: 'Bob' });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'b@example.com', password: 'pass12345' })
      .expect(200);

    expect(login.body.accessToken).toBeTruthy();
  });

  it('refresh returns new access token when refresh cookie is present', async () => {
    const app = testApp();
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'c@example.com', password: 'pass12345', displayName: 'Carol' });

    const cookie = reg.headers['set-cookie'];

    const refresh = await request(app).post('/api/auth/refresh').set('Cookie', cookie).expect(200);

    expect(refresh.body.accessToken).toBeTruthy();
  });
});
