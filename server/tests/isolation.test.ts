import { beforeEach, describe, expect, it } from 'vitest';
import { getApp, registerUser, resetDb } from './helpers.js';

beforeEach(resetDb);

async function twoUsers() {
  const app = await getApp();
  const a = await registerUser(app, { email: 'a@x.com', username: 'alpha' });
  const b = await registerUser(app, { email: 'b@x.com', username: 'bravo' });
  return { app, a, b };
}

describe('tenant isolation', () => {
  it('keeps each creator\'s links private', async () => {
    const { a, b } = await twoUsers();

    const created = await a.agent
      .post('/api/links')
      .send({ title: 'My shop', url: 'https://example.com/shop' })
      .expect(201);
    const aLinkId = created.body.link.id;

    // B sees none of A's links.
    const bList = await b.agent.get('/api/links').expect(200);
    expect(bList.body.links).toHaveLength(0);

    // B cannot read, edit or delete A's link even with the real id.
    await b.agent.put(`/api/links/${aLinkId}`).send({ title: 'stolen' }).expect(404);
    await b.agent.delete(`/api/links/${aLinkId}`).expect(404);

    // A still owns it, unchanged.
    const aList = await a.agent.get('/api/links').expect(200);
    expect(aList.body.links).toHaveLength(1);
    expect(aList.body.links[0].title).toBe('My shop');
  });

  it('keeps products private across tenants', async () => {
    const { a, b } = await twoUsers();

    const created = await a.agent
      .post('/api/products')
      .send({ title: 'Preset pack', destinationUrl: 'https://example.com/p', pricePaise: 49900 })
      .expect(201);
    const id = created.body.product.id;

    const bList = await b.agent.get('/api/products').expect(200);
    expect(bList.body.products).toHaveLength(0);
    await b.agent.put(`/api/products/${id}`).send({ title: 'x' }).expect(404);
    await b.agent.delete(`/api/products/${id}`).expect(404);

    // A's product is intact.
    const aList = await a.agent.get('/api/products').expect(200);
    expect(aList.body.products[0].title).toBe('Preset pack');
  });

  it('scopes stats to the caller\'s tenant', async () => {
    const { a, b } = await twoUsers();
    await a.agent.post('/api/profile/publish').send({ isPublished: true }).expect(200);
    await a.agent.get('/api/public/alpha').expect(200);
    await a.agent.post('/api/public/alpha/view').send({}).expect(204);

    const aStats = await a.agent.get('/api/stats').expect(200);
    const bStats = await b.agent.get('/api/stats').expect(200);
    expect(aStats.body.stats.views).toBe(1);
    expect(bStats.body.stats.views).toBe(0);
  });

  it('does not allow a creator to reach admin endpoints', async () => {
    const { a } = await twoUsers();
    await a.agent.get('/api/admin/overview').expect(403);
    await a.agent.get('/api/admin/users').expect(403);
    await a.agent.get('/api/admin/stats').expect(403);
  });

  it('rejects reordering another tenant\'s resources', async () => {
    const { a, b } = await twoUsers();
    const created = await a.agent
      .post('/api/links')
      .send({ title: 'A link', url: 'https://example.com/a' })
      .expect(201);

    // B tries to reorder using A's id — it must be ignored, not applied.
    const res = await b.agent.put('/api/links/reorder').send({ ids: [created.body.link.id] }).expect(200);
    expect(res.body.links).toHaveLength(0);
  });
});
