// tests/utils.ts
import request from 'supertest';
import { createApp } from '../src/app';
import { AppDataSource } from '../src/db/data-source';

export function testApp() {
  return createApp();
}

export async function makeUser(email: string, password = 'pass12345', displayName = 'User') {
  const app = testApp();
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password, displayName });

  const access = res.body.accessToken as string;

  // set-cookie может быть string | string[] | undefined — нормализуем в массив
  const raw = res.headers['set-cookie'] as string | string[] | undefined;
  const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];

  return { access, cookies, user: res.body.user };
}

export async function promoteToAdmin(userId: string) {
  // использовать существующее соединение (инициализируется в jest.setup.ts)
  await AppDataSource.query(`UPDATE users SET role='admin' WHERE id=?`, [userId]);
}
