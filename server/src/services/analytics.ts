import { getDb } from '../db/index.js';

export async function recordView(tenantId: string, path: string, referrer?: string): Promise<void> {
  const db = await getDb();
  await db.query(
    'insert into page_views (tenant_id, path, referrer) values ($1, $2, $3)',
    [tenantId, path, referrer ?? null],
  );
}

export async function recordViewByUsername(
  username: string,
  path: string,
  referrer?: string,
): Promise<boolean> {
  const db = await getDb();
  const { rows } = await db.query<{ tenant_id: string }>(
    'select tenant_id from public_pages where lower(username) = lower($1)',
    [username],
  );
  const page = rows[0];
  if (!page) return false;
  await recordView(page.tenant_id, path, referrer);
  return true;
}

export async function recordLinkClickByUsername(
  username: string,
  linkId: string,
): Promise<boolean> {
  const db = await getDb();
  const { rows } = await db.query<{ tenant_id: string }>(
    `select pl.tenant_id
       from public_links pl
       join public_pages pp on pp.tenant_id = pl.tenant_id
      where lower(pp.username) = lower($1) and pl.id = $2`,
    [username, linkId],
  );
  const link = rows[0];
  if (!link) return false;
  await db.query(
    'update links set click_count = click_count + 1 where id = $1 and tenant_id = $2',
    [linkId, link.tenant_id],
  );
  return true;
}

export async function getOwnerStats(tenantId: string) {
  const db = await getDb();
  const totals = await db.query<{
    views: number;
    views_7d: number;
    clicks: number;
    links: number;
    products: number;
  }>(
    `select
       (select count(*)::int from page_views where tenant_id = $1) as views,
       (select count(*)::int from page_views
          where tenant_id = $1 and created_at >= now() - interval '7 days') as views_7d,
       (select coalesce(sum(click_count), 0)::int from links where tenant_id = $1) as clicks,
       (select count(*)::int from links where tenant_id = $1) as links,
       (select count(*)::int from products where tenant_id = $1) as products`,
    [tenantId],
  );
  const series = await db.query<{ day: string; count: number }>(
    `select to_char(created_at::date, 'YYYY-MM-DD') as day, count(*)::int as count
     from page_views
     where tenant_id = $1 and created_at >= now() - interval '13 days'
     group by 1 order by 1`,
    [tenantId],
  );
  return { ...totals.rows[0]!, series: series.rows };
}
