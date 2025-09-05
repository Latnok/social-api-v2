import request from 'supertest';
import { testApp, makeUser, promoteToAdmin } from './utils';

describe('Admin Users', () => {
  it('requires admin role', async () => {
    const app = testApp();
    await request(app).get('/api/users').expect(401);

    const { access } = await makeUser('user@example.com');
    await request(app).get('/api/users').set('Authorization', `Bearer ${access}`).expect(403);
  });

  it('admin can list users', async () => {
    const app = testApp();
    const { user, access } = await makeUser('admin@example.com');
    await promoteToAdmin(user.id);

    // нужно залогиниться снова, чтобы role в токене стала 'admin'
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'pass12345' })
      .expect(200);

    const token = login.body.accessToken;
    const res = await request(app)
      .get('/api/users?limit=10')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body.items)).toBe(true);
  });
});
