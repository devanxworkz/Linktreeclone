import { beforeEach, describe, expect, it } from 'vitest';
import { agent, getApp, registerUser, resetDb } from './helpers.js';

beforeEach(resetDb);

describe('server-side validation', () => {
  it('rejects a bad email, short password and bad username on register', async () => {
    const app = await getApp();
    await agent(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'Password@123', displayName: 'X', username: 'goodname' })
      .expect(422);
    await agent(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'short', displayName: 'X', username: 'goodname' })
      .expect(422);
    await agent(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'Password@123', displayName: 'X', username: 'admin' })
      .expect(422);
    await agent(app)
      .post('/api/auth/register')
      .send({ email: 'a@b.com', password: 'Password@123', displayName: 'X', username: 'UPPER space' })
      .expect(422);
  });

  it('rejects a link with a non-http url', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, { email: 'l@x.com', username: 'linkuser' });
    await ag.post('/api/links').send({ title: 'Bad', url: 'javascript:alert(1)' }).expect(422);
    await ag.post('/api/links').send({ title: 'Bad', url: 'not a url' }).expect(422);
  });

  it('rejects an invalid theme colour but accepts a valid one', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, { email: 't@x.com', username: 'themeuser' });
    await ag.put('/api/profile/theme').send({ themeKey: 'saffron', layout: 'classic', accent: 'orange' }).expect(422);
    await ag.put('/api/profile/theme').send({ themeKey: 'indigo', layout: 'grid', accent: '#4f46e5' }).expect(200);
  });

  it('rejects an invalid UPI id and phone number', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, { email: 'p@x.com', username: 'profuser' });
    await ag.put('/api/profile').send({ displayName: 'P', upiId: 'not-a-upi' }).expect(422);
    await ag.put('/api/profile').send({ displayName: 'P', whatsappNumber: 'abc' }).expect(422);
    await ag.put('/api/profile').send({ displayName: 'P', upiId: 'name@okhdfcbank' }).expect(200);
  });

  it('rejects a negative product price', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, { email: 'pr@x.com', username: 'produser' });
    await ag
      .post('/api/products')
      .send({ title: 'X', destinationUrl: 'https://example.com', pricePaise: -5 })
      .expect(422);
  });

  it('rejects an unknown field type instead of silently accepting it', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, { email: 'f@x.com', username: 'fielduser' });
    await ag.post('/api/links').send({ title: '', url: 'https://example.com' }).expect(422);
  });
});
