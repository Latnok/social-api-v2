import request from 'supertest';
import { testApp, makeUser } from './utils';

describe('Posts', () => {
  it('public list is accessible and initially empty', async () => {
    const app = testApp();
    const res = await request(app).get('/api/posts?limit=10').expect(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBe(0);
  });

  it('authorized user can create, read, update and delete own post', async () => {
    const app = testApp();
    const { access } = await makeUser('u1@example.com');

    const created = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${access}`)
      .send({ title: 'Hello', content: 'World' })
      .expect(201);

    const postId = created.body.id;

    // public read
    await request(app).get(`/api/posts/${postId}`).expect(200);

    // update
    const updated = await request(app)
      .patch(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${access}`)
      .send({ title: 'Hello 2' })
      .expect(200);

    expect(updated.body.title).toBe('Hello 2');

    // delete (soft)
    await request(app)
      .delete(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${access}`)
      .expect(204);

    // not found after soft delete
    await request(app).get(`/api/posts/${postId}`).expect(404);
  });

  it('non-author cannot edit another user post', async () => {
    const app = testApp();
    const { access: a1 } = await makeUser('author@example.com');
    const { access: a2 } = await makeUser('other@example.com');

    const created = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${a1}`)
      .send({ title: 'Mine', content: '...' });

    const postId = created.body.id;

    await request(app)
      .patch(`/api/posts/${postId}`)
      .set('Authorization', `Bearer ${a2}`)
      .send({ title: 'Hacked' })
      .expect(403);
  });
});
