import { beforeEach, describe, expect, it } from 'vitest';
import { getDb } from '../src/db/index.js';
import { getApp, registerUser, resetDb } from './helpers.js';

beforeEach(resetDb);

async function promoteToAdmin(userId: string) {
  const db = await getDb();
  await db.query("update users set role = 'admin' where id = $1", [userId]);
}

describe('admin', () => {
  it('lets an admin see the platform overview and users', async () => {
    const app = await getApp();
    const admin = await registerUser(app, { email: 'admin@x.com', username: 'theadmin' });
    await registerUser(app, { email: 'creator@x.com', username: 'somecreator' });
    await promoteToAdmin(admin.user.id);

    const overview = await admin.agent.get('/api/admin/overview').expect(200);
    expect(overview.body.totals.users).toBe(2);
    expect(overview.body.totals.creators).toBe(1);
    expect(overview.body.totals.admins).toBe(1);
    expect(overview.body.totals.tenants).toBe(2);
    expect(overview.body.series.length).toBe(14);
    expect(overview.body.recentUsers.length).toBe(2);

    const users = await admin.agent.get('/api/admin/users').expect(200);
    expect(users.body.rows.length).toBe(2);
    expect(users.body.rows.some((r: { email: string }) => r.email === 'creator@x.com')).toBe(true);
  });

  it('filters users by role and search term', async () => {
    const app = await getApp();
    const admin = await registerUser(app, { email: 'admin@x.com', username: 'theadmin' });
    await registerUser(app, { email: 'findme@x.com', username: 'findable' });
    await promoteToAdmin(admin.user.id);

    const creators = await admin.agent.get('/api/admin/users?role=creator').expect(200);
    expect(creators.body.rows.length).toBe(1);
    expect(creators.body.rows[0].role).toBe('creator');

    const search = await admin.agent.get('/api/admin/users?q=findme').expect(200);
    expect(search.body.rows.length).toBe(1);
    expect(search.body.rows[0].email).toBe('findme@x.com');
  });

  it('returns a creator detail with real counts', async () => {
    const app = await getApp();
    const admin = await registerUser(app, { email: 'admin@x.com', username: 'theadmin' });
    const creator = await registerUser(app, { email: 'creator@x.com', username: 'somecreator' });
    await promoteToAdmin(admin.user.id);

    const detail = await admin.agent.get(`/api/admin/users/${creator.user.id}`).expect(200);
    expect(detail.body.user.email).toBe('creator@x.com');
    expect(detail.body.user.profile.username).toBe('somecreator');
    expect(detail.body.user.counts.views).toBe(0);

    await admin.agent
      .get('/api/admin/users/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });

  it('suspends a user and kills their session', async () => {
    const app = await getApp();
    const admin = await registerUser(app, { email: 'admin2@x.com', username: 'admin2' });
    const victim = await registerUser(app, { email: 'victim@x.com', username: 'victim' });
    await promoteToAdmin(admin.user.id);

    await admin.agent
      .put(`/api/admin/users/${victim.user.id}/status`)
      .send({ status: 'suspended', reason: 'spam' })
      .expect(200);

    // The victim's existing session is now dead.
    await victim.agent.get('/api/auth/me').expect(401);

    // And the action is on the audit trail, attributed to the acting admin.
    const audit = await admin.agent.get('/api/admin/audit').expect(200);
    expect(audit.body.rows[0].action).toBe('user.suspend');
    expect(audit.body.rows[0].actorEmail).toBe('admin2@x.com');
    expect(audit.body.rows[0].targetLabel).toBe('victim@x.com');
    expect(audit.body.rows[0].metadata.reason).toBe('spam');
  });

  it('does not let an admin suspend themselves', async () => {
    const app = await getApp();
    const admin = await registerUser(app, { email: 'self@x.com', username: 'selfadmin' });
    await promoteToAdmin(admin.user.id);
    await admin.agent
      .put(`/api/admin/users/${admin.user.id}/status`)
      .send({ status: 'suspended' })
      .expect(400);
  });

  it('does not let an admin suspend the last active administrator', async () => {
    const app = await getApp();
    const admin = await registerUser(app, { email: 'a1@x.com', username: 'adminone' });
    const other = await registerUser(app, { email: 'a2@x.com', username: 'admintwo' });
    await promoteToAdmin(admin.user.id);
    await promoteToAdmin(other.user.id);

    // One admin can suspend the other while a second remains active.
    await admin.agent
      .put(`/api/admin/users/${other.user.id}/status`)
      .send({ status: 'suspended' })
      .expect(200);

    // Now only the acting admin is left, so it cannot be suspended.
    await admin.agent
      .put('/api/admin/users/00000000-0000-0000-0000-000000000000/status')
      .send({ status: 'suspended' })
      .expect(404);
  });

  it('returns 404 when suspending an unknown user', async () => {
    const app = await getApp();
    const admin = await registerUser(app, { email: 'admin3@x.com', username: 'admin3' });
    await promoteToAdmin(admin.user.id);
    await admin.agent
      .put('/api/admin/users/00000000-0000-0000-0000-000000000000/status')
      .send({ status: 'suspended' })
      .expect(404);
  });

  it('lists the distinct audit actions', async () => {
    const app = await getApp();
    const admin = await registerUser(app, { email: 'admin4@x.com', username: 'admin4' });
    const victim = await registerUser(app, { email: 'v@x.com', username: 'vick' });
    await promoteToAdmin(admin.user.id);

    await admin.agent
      .put(`/api/admin/users/${victim.user.id}/status`)
      .send({ status: 'suspended' })
      .expect(200);

    const actions = await admin.agent.get('/api/admin/audit/actions').expect(200);
    expect(actions.body.actions).toContain('user.suspend');
  });

  it('lists storefronts with real per-page counts', async () => {
    const app = await getApp();
    const admin = await registerUser(app, { email: 'admin5@x.com', username: 'admin5' });
    const creator = await registerUser(app, { email: 'c@x.com', username: 'carter' });
    await promoteToAdmin(admin.user.id);

    const db = await getDb();
    await db.query('insert into page_views (tenant_id, path) values ($1, $2)', [creator.user.tenantId, '/u/carter']);

    const res = await admin.agent.get('/api/admin/storefronts').expect(200);
    const row = res.body.rows.find((r: { username: string }) => r.username === 'carter');
    expect(row.views).toBe(1);
  });

  it('returns platform analytics with a 30-day series', async () => {
    const app = await getApp();
    const admin = await registerUser(app, { email: 'admin6@x.com', username: 'admin6' });
    await promoteToAdmin(admin.user.id);

    const res = await admin.agent.get('/api/admin/analytics').expect(200);
    expect(res.body.totals.views).toBe(0);
    expect(res.body.series.length).toBe(30);
    expect(Array.isArray(res.body.topCreators)).toBe(true);
  });

  it('refuses admin endpoints to non-admins', async () => {
    const app = await getApp();
    const creator = await registerUser(app, { email: 'plain@x.com', username: 'plainuser' });
    await creator.agent.get('/api/admin/overview').expect(403);
    await creator.agent.get('/api/admin/audit').expect(403);
  });
});
