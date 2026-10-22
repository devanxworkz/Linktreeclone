import { beforeEach, describe, expect, it } from 'vitest';
import { agent, getApp, registerUser, resetDb } from './helpers.js';

beforeEach(resetDb);

describe('public creator page', () => {
  it('is 404 until published, then 200 with only published content', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, {
      email: 'pub@x.com',
      username: 'publisher',
      displayName: 'Publisher',
    });

    await ag.get('/api/public/publisher').expect(404);

    await ag
      .put('/api/profile')
      .send({
        displayName: 'Publisher',
        bio: 'Hello',
        whatsappNumber: '919876543210',
        upiId: 'pub@okhdfcbank',
      })
      .expect(200);

    const link = await ag
      .post('/api/links')
      .send({ title: 'Public link', url: 'https://example.com/one' })
      .expect(201);
    // An inactive link must not appear publicly.
    await ag
      .post('/api/links')
      .send({ title: 'Hidden link', url: 'https://example.com/two', isActive: false })
      .expect(201);

    await ag.post('/api/profile/publish').send({ isPublished: true }).expect(200);

    const page = await ag.get('/api/public/publisher').expect(200);
    expect(page.body.page.displayName).toBe('Publisher');
    expect(page.body.page.links).toHaveLength(1);
    expect(page.body.page.links[0].id).toBe(link.body.link.id);
    // Never returns private fields.
    expect(page.body.page).not.toHaveProperty('email');
    expect(page.body.page).not.toHaveProperty('tenantId');
  });

  it('hides the page again after unpublishing', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, { email: 'u@x.com', username: 'togglepage' });
    await ag.post('/api/profile/publish').send({ isPublished: true }).expect(200);
    await ag.get('/api/public/togglepage').expect(200);
    await ag.post('/api/profile/publish').send({ isPublished: false }).expect(200);
    await ag.get('/api/public/togglepage').expect(404);
  });

  it('404s an unknown username', async () => {
    await resetDb();
    const app = await getApp();
    await agent(app).get('/api/public/does-not-exist').expect(404);
  });

  it('does not let a visitor read an unpublished creator', async () => {
    const app = await getApp();
    await registerUser(app, { email: 'secret@x.com', username: 'secretuser' });
    await agent(app).post('/api/public/secretuser/view').send({}).expect(204);
    await agent(app).get('/api/public/secretuser').expect(404);
  });
});
