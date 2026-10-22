import { beforeEach, describe, expect, it } from 'vitest';
import { getDb } from '../src/db/index.js';
import { agent, getApp, registerUser, resetDb } from './helpers.js';

beforeEach(resetDb);

describe('auth', () => {
  it('registers a creator and returns a session', async () => {
    const app = await getApp();
    const { agent: ag, user } = await registerUser(app, {
      email: 'a@example.com',
      username: 'aarti',
    });

    const me = await ag.get('/api/auth/me').expect(200);
    expect(me.body.user.email).toBe('a@example.com');
    expect(me.body.profile.username).toBe('aarti');
    expect(me.body.profile.isPublished).toBe(false);
    expect(me.body.profile.publicUrl).toBe('http://localhost:5173/u/aarti');
    expect(user.id).toBeTruthy();
  });

  it('rejects a duplicate username with 409', async () => {
    const app = await getApp();
    await registerUser(app, { username: 'taken', email: 'one@example.com' });
    const res = await agent(app)
      .post('/api/auth/register')
      .send({ email: 'two@example.com', password: 'Password@123', displayName: 'Two', username: 'taken' })
      .expect(409);
    expect(res.body.error.code).toBe('conflict');
  });

  it('rejects a duplicate email with 409', async () => {
    const app = await getApp();
    await registerUser(app, { email: 'dup@example.com', username: 'userone' });
    await agent(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', password: 'Password@123', displayName: 'Two', username: 'usertwo' })
      .expect(409);
  });

  it('does not leave an orphan tenant when a username collides', async () => {
    const app = await getApp();
    await registerUser(app, { username: 'collide', email: 'first@example.com' });
    await agent(app)
      .post('/api/auth/register')
      .send({ email: 'second@example.com', password: 'Password@123', displayName: 'Two', username: 'collide' })
      .expect(409);

    const db = await getDb();
    const { rows } = await db.query<{ n: number }>('select count(*)::int as n from tenants');
    expect(rows[0]!.n).toBe(1);
  });

  it('rejects a wrong password with 401 and a vague message', async () => {
    const app = await getApp();
    await registerUser(app, { email: 'login@example.com', username: 'loginuser' });
    const res = await agent(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: 'wrong-password' })
      .expect(401);
    expect(res.body.error.message).toMatch(/invalid email or password/i);
  });

  it('blocks anonymous access to protected routes', async () => {
    const app = await getApp();
    await agent(app).get('/api/auth/me').expect(401);
    await agent(app).get('/api/profile').expect(401);
    await agent(app).get('/api/links').expect(401);
    await agent(app).get('/api/products').expect(401);
    await agent(app).get('/api/stats').expect(401);
    await agent(app).get('/api/admin/overview').expect(401);
  });

  it('logs out and invalidates the session', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, { email: 'bye@example.com', username: 'byeuser' });
    await ag.post('/api/auth/logout').expect(204);
    await ag.get('/api/auth/me').expect(401);
  });

  it('refuses login for a suspended account', async () => {
    const app = await getApp();
    const { user } = await registerUser(app, { email: 'susp@example.com', username: 'suspuser' });
    const db = await getDb();
    await db.query("update users set status = 'suspended' where id = $1", [user.id]);
    await agent(app)
      .post('/api/auth/login')
      .send({ email: 'susp@example.com', password: 'Password@123' })
      .expect(403);
  });

  it('changes the password only with the correct current one', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, { email: 'pw@example.com', username: 'pwuser' });
    await ag
      .post('/api/auth/change-password')
      .send({ currentPassword: 'nope', newPassword: 'BrandNew@123' })
      .expect(401);
    await ag
      .post('/api/auth/change-password')
      .send({ currentPassword: 'Password@123', newPassword: 'BrandNew@123' })
      .expect(204);

    const login = agent(app);
    await login
      .post('/api/auth/login')
      .send({ email: 'pw@example.com', password: 'BrandNew@123' })
      .expect(200);
  });
});
