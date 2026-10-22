import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { getDb } from '../src/db/index.js';
import { migrate } from '../src/db/migrate.js';
import { resetDb } from './helpers.js';

/**
 * Proves the Postgres row-level-security policies isolate tenants even when a
 * query forgets its WHERE clause. This is the defence-in-depth layer, separate
 * from the application's data-layer scoping (covered by isolation.test.ts).
 *
 * PGlite runs as a superuser, and RLS is bypassed for table owners/superusers,
 * so we create a plain `pehchaan_app` role, SET ROLE to it and set the
 * per-request `app.user_id`, exactly as production does behind a non-owner role.
 */

const APP_ROLE = 'pehchaan_app';

async function setupRole() {
  const db = await getDb();
  await db.exec(`
    do $$ begin
      if not exists (select 1 from pg_roles where rolname = '${APP_ROLE}') then
        create role ${APP_ROLE} nologin;
      end if;
    end $$;
    grant usage on schema public to ${APP_ROLE};
    grant select, insert, update, delete on
      users, tenants, profiles, links, products, sessions, page_views to ${APP_ROLE};
    grant usage, select on all sequences in schema public to ${APP_ROLE};
    grant select on public_pages, public_links, public_products to ${APP_ROLE};
  `);
}

async function makeUser(username: string): Promise<{ userId: string; tenantId: string }> {
  const db = await getDb();
  const u = await db.query<{ id: string }>(
    `insert into users (email, password_hash) values ($1, 'x') returning id`,
    [`${username}@rls.test`],
  );
  const userId = u.rows[0]!.id;
  const t = await db.query<{ id: string }>(
    `insert into tenants (owner_user_id, name) values ($1, $2) returning id`,
    [userId, username],
  );
  const tenantId = t.rows[0]!.id;
  await db.query(
    `insert into profiles (tenant_id, username, display_name) values ($1, $2, $3)`,
    [tenantId, username, username],
  );
  await db.query(
    `insert into links (tenant_id, title, url) values ($1, $2, $3)`,
    [tenantId, `${username} link`, 'https://example.com'],
  );
  return { userId, tenantId };
}

beforeAll(async () => {
  await migrate();
  await setupRole();
});

beforeEach(resetDb);

describe('row level security', () => {
  it('shows a tenant only its own profile and links', async () => {
    const db = await getDb();
    const a = await makeUser('rlalpha');
    const b = await makeUser('rlbravo');

    // Act as user A.
    await db.exec(`set role ${APP_ROLE}`);
    await db.query(`select set_config('app.user_id', $1, false)`, [a.userId]);

    const aProfiles = await db.query<{ username: string }>('select username from profiles');
    expect(aProfiles.rows.map((r) => r.username)).toEqual(['rlalpha']);

    const aLinks = await db.query<{ title: string }>('select title from links');
    expect(aLinks.rows.map((r) => r.title)).toEqual(['rlalpha link']);

    // Switch to user B.
    await db.query(`select set_config('app.user_id', $1, false)`, [b.userId]);
    const bProfiles = await db.query<{ username: string }>('select username from profiles');
    expect(bProfiles.rows.map((r) => r.username)).toEqual(['rlbravo']);

    const bLinks = await db.query<{ title: string }>('select title from links');
    expect(bLinks.rows.map((r) => r.title)).toEqual(['rlbravo link']);

    await db.exec('reset role');
  });

  it('blocks cross-tenant writes even with the real tenant id', async () => {
    const db = await getDb();
    const a = await makeUser('rwalpha');
    const b = await makeUser('rwbravo');

    await db.exec(`set role ${APP_ROLE}`);
    await db.query(`select set_config('app.user_id', $1, false)`, [b.userId]);

    // B tries to update A's profile and links using A's tenant id.
    const updProfile = await db.query<{ id: string }>(
      `update profiles set display_name = 'hacked' where tenant_id = $1 returning id`,
      [a.tenantId],
    );
    expect(updProfile.rows).toHaveLength(0);

    const updLink = await db.query<{ id: string }>(
      `update links set title = 'hacked' where tenant_id = $1 returning id`,
      [a.tenantId],
    );
    expect(updLink.rows).toHaveLength(0);

    // And B cannot even see A's rows with a raw unfiltered select.
    const seen = await db.query<{ n: number }>(
      `select count(*)::int as n from links where tenant_id = $1`,
      [a.tenantId],
    );
    expect(seen.rows[0]!.n).toBe(0);

    await db.exec('reset role');
  });

  it('lets anonymous readers see only published pages through the public views', async () => {
    const db = await getDb();
    const a = await makeUser('pubalpha');
    // Not published yet.
    await db.exec(`set role ${APP_ROLE}`);
    const before = await db.query('select * from public_pages');
    expect(before.rows).toHaveLength(0);
    await db.exec('reset role');

    await db.query('update profiles set is_published = true where tenant_id = $1', [a.tenantId]);

    await db.exec(`set role ${APP_ROLE}`);
    const after = await db.query<{ username: string }>('select username from public_pages');
    expect(after.rows.map((r) => r.username)).toContain('pubalpha');
    // The public view never exposes private columns.
    const cols = Object.keys(after.rows[0]!);
    expect(cols).not.toContain('email');
    await db.exec('reset role');
  });
});
