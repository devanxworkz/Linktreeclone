import { beforeEach, describe, expect, it } from 'vitest';
import { agent, getApp, registerUser, resetDb } from './helpers.js';

beforeEach(resetDb);

/** A complete, valid appearance document (mirrors web templateDefaults()). */
function validAppearance() {
  return {
    template: 'soft-pastel',
    background: {
      kind: 'gradient',
      color: '#fdf2f8',
      gradientFrom: '#fdf2f8',
      gradientTo: '#ede9fe',
      gradientAngle: 135,
      imageUrl: '',
    },
    avatar: { size: 112, shape: 'rounded', align: 'center' },
    typography: {
      font: 'rounded',
      headingColor: '#3f3d56',
      bodyColor: '#57547a',
      headingScale: 1,
    },
    button: {
      color: '#db2777',
      textColor: '#ffffff',
      shape: 'pill',
      border: 'none',
      shadow: 'soft',
      gap: 12,
    },
    products: { layout: 'grid', aspect: 'square', card: 'soft', imageRadius: 16 },
    section: { surface: '#ffffff', radius: 20, padding: 20, gap: 12 },
  };
}

describe('storefront appearance settings', () => {
  it('starts null so the client falls back to template defaults', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, { email: 'fresh@x.com', username: 'freshuser' });

    const res = await ag.get('/api/profile').expect(200);
    expect(res.body.profile.appearance).toBeNull();
  });

  it('saves and echoes back the design', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, { email: 'save@x.com', username: 'saver' });

    const saved = await ag.put('/api/profile/appearance').send(validAppearance()).expect(200);
    expect(saved.body.profile.appearance.template).toBe('soft-pastel');
    expect(saved.body.profile.appearance.button.color).toBe('#db2777');
    expect(saved.body.profile.appearance.products.layout).toBe('grid');

    // Persisted across requests.
    const fetched = await ag.get('/api/profile').expect(200);
    expect(fetched.body.profile.appearance).toEqual(saved.body.profile.appearance);
  });

  it('stores a null-safe empty surface and a background image URL', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, { email: 'bg@x.com', username: 'bguser' });

    const payload = validAppearance();
    payload.background.kind = 'solid';
    payload.background.imageUrl = 'https://cdn.example.com/hero.jpg';
    payload.section.surface = '';

    const saved = await ag.put('/api/profile/appearance').send(payload).expect(200);
    expect(saved.body.profile.appearance.background.imageUrl).toBe(
      'https://cdn.example.com/hero.jpg',
    );
    expect(saved.body.profile.appearance.section.surface).toBe('');
  });

  it('requires every field to be a complete, valid document', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, { email: 'bad@x.com', username: 'baduser' });

    // Missing groups are rejected outright.
    await ag.put('/api/profile/appearance').send({ template: 'soft-pastel' }).expect(422);

    const badHex = validAppearance();
    badHex.button.color = 'pink';
    await ag.put('/api/profile/appearance').send(badHex).expect(422);

    const outOfRange = validAppearance();
    outOfRange.avatar.size = 900;
    await ag.put('/api/profile/appearance').send(outOfRange).expect(422);

    const unknownTemplate = { ...validAppearance(), template: 'nope' };
    await ag.put('/api/profile/appearance').send(unknownTemplate).expect(422);
  });

  it('refuses a background image that is not an http(s) URL', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, { email: 'js@x.com', username: 'jsuser' });

    const payload = validAppearance();
    payload.background.imageUrl = 'javascript:alert(1)';
    const res = await ag.put('/api/profile/appearance').send(payload).expect(422);
    expect(res.body.error.code).toBe('validation_error');
  });

  it('exposes the design on the public page only once published', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, { email: 'pub@x.com', username: 'pubdesign' });
    await ag.put('/api/profile/appearance').send(validAppearance()).expect(200);

    // Unpublished: no public page at all.
    await agent(app).get('/api/public/pubdesign').expect(404);

    await ag.post('/api/profile/publish').send({ isPublished: true }).expect(200);
    const page = await agent(app).get('/api/public/pubdesign').expect(200);
    expect(page.body.page.appearance.template).toBe('soft-pastel');
    expect(page.body.page.appearance.products.aspect).toBe('square');
  });

  it('returns a null design on the public page when none was saved', async () => {
    const app = await getApp();
    const { agent: ag } = await registerUser(app, { email: 'none@x.com', username: 'nodesign' });
    await ag.post('/api/profile/publish').send({ isPublished: true }).expect(200);

    const page = await agent(app).get('/api/public/nodesign').expect(200);
    expect(page.body.page.appearance).toBeNull();
  });

  it('keeps each creator\'s design private to their tenant', async () => {
    const app = await getApp();
    const a = await registerUser(app, { email: 'a@x.com', username: 'alpha' });
    const b = await registerUser(app, { email: 'b@x.com', username: 'bravo' });

    await a.agent.put('/api/profile/appearance').send(validAppearance()).expect(200);

    // B never inherits A's design.
    const bProfile = await b.agent.get('/api/profile').expect(200);
    expect(bProfile.body.profile.appearance).toBeNull();

    // B's own save does not touch A.
    const bDesign = validAppearance();
    bDesign.template = 'indian-boutique';
    await b.agent.put('/api/profile/appearance').send(bDesign).expect(200);

    const aProfile = await a.agent.get('/api/profile').expect(200);
    expect(aProfile.body.profile.appearance.template).toBe('soft-pastel');
  });

  it('requires a signed-in creator', async () => {
    const app = await getApp();
    await agent(app).put('/api/profile/appearance').send(validAppearance()).expect(401);
  });
});
