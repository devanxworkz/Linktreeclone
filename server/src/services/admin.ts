import { getDb } from '../db/index.js';
import { badRequest, notFound } from '../http/errors.js';
import type { Role, UserStatus } from './types.js';

/* -------------------------------------------------------------------------- */
/* Audit trail                                                                */
/* -------------------------------------------------------------------------- */

export interface AuditEntryInput {
  actorUserId: string | null;
  actorEmail: string;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  targetLabel?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function recordAudit(entry: AuditEntryInput): Promise<void> {
  const db = await getDb();
  await db.query(
    `insert into admin_audit_log
       (actor_user_id, actor_email, action, target_type, target_id, target_label, metadata)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [
      entry.actorUserId,
      entry.actorEmail,
      entry.action,
      entry.targetType ?? null,
      entry.targetId ?? null,
      entry.targetLabel ?? null,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
    ],
  );
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return value as Record<string, unknown>;
}

/* -------------------------------------------------------------------------- */
/* Overview                                                                   */
/* -------------------------------------------------------------------------- */

export async function adminOverview() {
  const db = await getDb();

  const totals = await db.query<{
    users: number;
    creators: number;
    admins: number;
    suspended: number;
    tenants: number;
    published: number;
    drafts: number;
    views: number;
    links: number;
    products: number;
    new_users_7d: number;
    new_users_30d: number;
    views_7d: number;
  }>(
    `select
       (select count(*)::int from users) as users,
       (select count(*)::int from users where role = 'creator') as creators,
       (select count(*)::int from users where role = 'admin') as admins,
       (select count(*)::int from users where status = 'suspended') as suspended,
       (select count(*)::int from tenants) as tenants,
       (select count(*)::int from profiles where is_published = true) as published,
       (select count(*)::int from profiles where is_published = false) as drafts,
       (select count(*)::int from page_views) as views,
       (select count(*)::int from links) as links,
       (select count(*)::int from products) as products,
       (select count(*)::int from users where created_at >= now() - interval '7 days') as new_users_7d,
       (select count(*)::int from users where created_at >= now() - interval '30 days') as new_users_30d,
       (select count(*)::int from page_views where created_at >= now() - interval '7 days') as views_7d`,
  );

  const series = await db.query<{ day: string; count: number }>(
    `select to_char(d::date, 'YYYY-MM-DD') as day,
            (select count(*)::int from page_views v where v.created_at::date = d::date) as count
       from generate_series(now()::date - interval '13 days', now()::date, interval '1 day') d
      order by 1`,
  );

  const recent = await db.query<{
    id: string;
    email: string;
    role: Role;
    status: UserStatus;
    created_at: string;
    username: string | null;
    display_name: string | null;
  }>(
    `select u.id, u.email, u.role, u.status, u.created_at, p.username, p.display_name
       from users u
       left join tenants t on t.owner_user_id = u.id
       left join profiles p on p.tenant_id = t.id
      order by u.created_at desc
      limit 8`,
  );

  const audit = await db.query<AuditRow>(
    `select id::text as id, action, actor_email, target_type, target_label, created_at
       from admin_audit_log
      order by created_at desc
      limit 8`,
  );

  const t = totals.rows[0]!;
  return {
    totals: {
      users: t.users,
      creators: t.creators,
      admins: t.admins,
      suspended: t.suspended,
      tenants: t.tenants,
      published: t.published,
      drafts: t.drafts,
      links: t.links,
      products: t.products,
    },
    activity: {
      views: t.views,
      views7d: t.views_7d,
      newUsers7d: t.new_users_7d,
      newUsers30d: t.new_users_30d,
    },
    series: series.rows,
    recentUsers: recent.rows.map((r) => ({
      id: r.id,
      email: r.email,
      role: r.role,
      status: r.status,
      createdAt: r.created_at,
      username: r.username,
      displayName: r.display_name,
    })),
    recentAudit: audit.rows.map(mapAudit),
  };
}

/* -------------------------------------------------------------------------- */
/* Users                                                                      */
/* -------------------------------------------------------------------------- */

export interface AdminUserFilter {
  q?: string;
  status?: UserStatus;
  role?: Role;
  published?: boolean;
  page: number;
  pageSize?: number;
}

interface AdminUserDbRow {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  created_at: string;
  last_login_at: string | null;
  tenant_id: string | null;
  username: string | null;
  display_name: string | null;
  is_published: boolean | null;
  views: number;
  links: number;
  products: number;
}

function mapUser(r: AdminUserDbRow) {
  return {
    id: r.id,
    email: r.email,
    role: r.role,
    status: r.status,
    createdAt: r.created_at,
    lastLoginAt: r.last_login_at,
    tenantId: r.tenant_id,
    username: r.username,
    displayName: r.display_name,
    isPublished: r.is_published,
    views: r.views,
    links: r.links,
    products: r.products,
  };
}

export async function adminListUsers(filter: AdminUserFilter) {
  const db = await getDb();
  const pageSize = filter.pageSize ?? 20;
  const offset = (filter.page - 1) * pageSize;
  const like = filter.q ? `%${filter.q.toLowerCase()}%` : null;
  const status = filter.status ?? null;
  const role = filter.role ?? null;
  const published = filter.published ?? null;

  const where = `
    where ($1::text is null or lower(u.email) like $1
            or lower(p.username) like $1 or lower(p.display_name) like $1)
      and ($2::text is null or u.status = $2)
      and ($3::text is null or u.role = $3)
      and ($4::boolean is null or p.is_published = $4)`;
  const params = [like, status, role, published];

  const countRes = await db.query<{ n: number }>(
    `select count(*)::int as n
       from users u
       left join tenants t on t.owner_user_id = u.id
       left join profiles p on p.tenant_id = t.id
      ${where}`,
    params,
  );

  const { rows } = await db.query<AdminUserDbRow>(
    `select u.id, u.email, u.role, u.status, u.created_at, u.last_login_at,
            t.id as tenant_id, p.username, p.display_name, p.is_published,
            (select count(*)::int from page_views v where v.tenant_id = t.id) as views,
            (select count(*)::int from links l where l.tenant_id = t.id) as links,
            (select count(*)::int from products pr where pr.tenant_id = t.id) as products
       from users u
       left join tenants t on t.owner_user_id = u.id
       left join profiles p on p.tenant_id = t.id
      ${where}
      order by u.created_at desc
      limit $5 offset $6`,
    [...params, pageSize, offset],
  );

  return {
    total: countRes.rows[0]!.n,
    page: filter.page,
    pageSize,
    rows: rows.map(mapUser),
  };
}

export async function adminUserDetail(id: string) {
  const db = await getDb();
  const { rows } = await db.query<{
    id: string;
    email: string;
    role: Role;
    status: UserStatus;
    created_at: string;
    last_login_at: string | null;
    tenant_id: string | null;
    tenant_name: string | null;
    tenant_created_at: string | null;
    username: string | null;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    is_published: boolean | null;
    published_at: string | null;
  }>(
    `select u.id, u.email, u.role, u.status, u.created_at, u.last_login_at,
            t.id as tenant_id, t.name as tenant_name, t.created_at as tenant_created_at,
            p.username, p.display_name, p.bio, p.avatar_url, p.is_published, p.published_at
       from users u
       left join tenants t on t.owner_user_id = u.id
       left join profiles p on p.tenant_id = t.id
      where u.id = $1`,
    [id],
  );
  const r = rows[0];
  if (!r) throw notFound('User not found.');

  const counts = await db.query<{
    views: number;
    clicks: number;
    links: number;
    products: number;
    sessions: number;
  }>(
    `select
       (select count(*)::int from page_views where tenant_id = $1) as views,
       (select coalesce(sum(click_count), 0)::int from links where tenant_id = $1) as clicks,
       (select count(*)::int from links where tenant_id = $1) as links,
       (select count(*)::int from products where tenant_id = $1) as products,
       (select count(*)::int from sessions where user_id = $2) as sessions`,
    [r.tenant_id, r.id],
  );

  return {
    id: r.id,
    email: r.email,
    role: r.role,
    status: r.status,
    createdAt: r.created_at,
    lastLoginAt: r.last_login_at,
    tenant: r.tenant_id
      ? { id: r.tenant_id, name: r.tenant_name, createdAt: r.tenant_created_at }
      : null,
    profile: r.username
      ? {
          username: r.username,
          displayName: r.display_name,
          bio: r.bio,
          avatarUrl: r.avatar_url,
          isPublished: r.is_published,
          publishedAt: r.published_at,
        }
      : null,
    counts: counts.rows[0]!,
  };
}

export interface AdminActor {
  id: string;
  email: string;
}

export async function adminSetUserStatus(
  actor: AdminActor,
  userId: string,
  status: UserStatus,
  reason?: string,
) {
  const db = await getDb();

  if (actor.id === userId) {
    throw badRequest('You cannot change your own account status.');
  }

  const target = await db.query<{
    id: string;
    email: string;
    role: Role;
    status: UserStatus;
  }>('select id, email, role, status from users where id = $1', [userId]);
  const t = target.rows[0];
  if (!t) throw notFound('User not found.');

  if (t.role === 'admin' && status === 'suspended') {
    const others = await db.query<{ n: number }>(
      "select count(*)::int as n from users where role = 'admin' and status = 'active' and id <> $1",
      [userId],
    );
    if (others.rows[0]!.n < 1) {
      throw badRequest('You cannot suspend the last active administrator.');
    }
  }

  const { rows } = await db.query<{
    id: string;
    email: string;
    role: Role;
    status: UserStatus;
  }>(
    'update users set status = $2 where id = $1 returning id, email, role, status',
    [userId, status],
  );

  if (status === 'suspended') {
    await db.query('delete from sessions where user_id = $1', [userId]);
  }

  await recordAudit({
    actorUserId: actor.id,
    actorEmail: actor.email,
    action: status === 'suspended' ? 'user.suspend' : 'user.reactivate',
    targetType: 'user',
    targetId: t.id,
    targetLabel: t.email,
    metadata: reason ? { reason } : null,
  });

  return rows[0]!;
}

/* -------------------------------------------------------------------------- */
/* Audit log                                                                  */
/* -------------------------------------------------------------------------- */

interface AuditRow {
  id: string;
  action: string;
  actor_email: string;
  target_type: string | null;
  target_label: string | null;
  metadata?: unknown;
  created_at: string;
}

function mapAudit(r: AuditRow) {
  return {
    id: r.id,
    action: r.action,
    actorEmail: r.actor_email,
    targetType: r.target_type,
    targetLabel: r.target_label,
    metadata: asObject(r.metadata),
    createdAt: r.created_at,
  };
}

export interface AuditFilter {
  q?: string;
  action?: string;
  page: number;
  pageSize?: number;
}

export async function adminListAudit(filter: AuditFilter) {
  const db = await getDb();
  const pageSize = filter.pageSize ?? 25;
  const offset = (filter.page - 1) * pageSize;
  const like = filter.q ? `%${filter.q.toLowerCase()}%` : null;
  const action = filter.action ?? null;

  const where = `
    where ($1::text is null or lower(a.action) like $1 or lower(a.actor_email) like $1
            or lower(coalesce(a.target_label, '')) like $1)
      and ($2::text is null or a.action = $2)`;

  const countRes = await db.query<{ n: number }>(
    `select count(*)::int as n from admin_audit_log a ${where}`,
    [like, action],
  );

  const { rows } = await db.query<AuditRow>(
    `select id::text as id, action, actor_email, target_type, target_label, metadata, created_at
       from admin_audit_log a
      ${where}
      order by created_at desc
      limit $3 offset $4`,
    [like, action, pageSize, offset],
  );

  return {
    total: countRes.rows[0]!.n,
    page: filter.page,
    pageSize,
    rows: rows.map(mapAudit),
  };
}

export async function adminAuditActions(): Promise<string[]> {
  const db = await getDb();
  const { rows } = await db.query<{ action: string }>(
    'select distinct action from admin_audit_log order by action',
  );
  return rows.map((r) => r.action);
}

/* -------------------------------------------------------------------------- */
/* Analytics                                                                  */
/* -------------------------------------------------------------------------- */

export async function adminAnalytics() {
  const db = await getDb();

  const totals = await db.query<{
    views: number;
    views_7d: number;
    views_30d: number;
    clicks: number;
    links: number;
    products: number;
    published: number;
  }>(
    `select
       (select count(*)::int from page_views) as views,
       (select count(*)::int from page_views where created_at >= now() - interval '7 days') as views_7d,
       (select count(*)::int from page_views where created_at >= now() - interval '30 days') as views_30d,
       (select coalesce(sum(click_count), 0)::int from links) as clicks,
       (select count(*)::int from links) as links,
       (select count(*)::int from products) as products,
       (select count(*)::int from profiles where is_published = true) as published`,
  );

  const series = await db.query<{ day: string; count: number }>(
    `select to_char(d::date, 'YYYY-MM-DD') as day,
            (select count(*)::int from page_views v where v.created_at::date = d::date) as count
       from generate_series(now()::date - interval '29 days', now()::date, interval '1 day') d
      order by 1`,
  );

  const top = await db.query<{
    tenant_id: string;
    username: string | null;
    display_name: string | null;
    is_published: boolean | null;
    views: number;
    links: number;
    products: number;
    clicks: number;
  }>(
    `select t.id as tenant_id, p.username, p.display_name, p.is_published,
            (select count(*)::int from page_views v where v.tenant_id = t.id) as views,
            (select count(*)::int from links l where l.tenant_id = t.id) as links,
            (select count(*)::int from products pr where pr.tenant_id = t.id) as products,
            (select coalesce(sum(l.click_count), 0)::int from links l where l.tenant_id = t.id) as clicks
       from tenants t
       left join profiles p on p.tenant_id = t.id
      order by views desc
      limit 10`,
  );

  return {
    totals: totals.rows[0]!,
    series: series.rows,
    topCreators: top.rows.map((r) => ({
      tenantId: r.tenant_id,
      username: r.username,
      displayName: r.display_name,
      isPublished: r.is_published,
      views: r.views,
      links: r.links,
      products: r.products,
      clicks: r.clicks,
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Storefronts                                                                */
/* -------------------------------------------------------------------------- */

export interface StorefrontFilter {
  q?: string;
  published?: boolean;
  page: number;
  pageSize?: number;
}

export async function adminStorefronts(filter: StorefrontFilter) {
  const db = await getDb();
  const pageSize = filter.pageSize ?? 20;
  const offset = (filter.page - 1) * pageSize;
  const like = filter.q ? `%${filter.q.toLowerCase()}%` : null;
  const published = filter.published ?? null;

  const where = `
    where ($1::text is null or lower(p.username) like $1 or lower(p.display_name) like $1)
      and ($2::boolean is null or p.is_published = $2)`;

  const countRes = await db.query<{ n: number }>(
    `select count(*)::int as n
       from tenants t
       left join profiles p on p.tenant_id = t.id
      ${where}`,
    [like, published],
  );

  const { rows } = await db.query<{
    tenant_id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    is_published: boolean | null;
    published_at: string | null;
    views: number;
    links: number;
    products: number;
  }>(
    `select t.id as tenant_id, p.username, p.display_name, p.avatar_url, p.is_published, p.published_at,
            (select count(*)::int from page_views v where v.tenant_id = t.id) as views,
            (select count(*)::int from links l where l.tenant_id = t.id) as links,
            (select count(*)::int from products pr where pr.tenant_id = t.id) as products
       from tenants t
       left join profiles p on p.tenant_id = t.id
      ${where}
      order by views desc
      limit $3 offset $4`,
    [like, published, pageSize, offset],
  );

  return {
    total: countRes.rows[0]!.n,
    page: filter.page,
    pageSize,
    rows: rows.map((r) => ({
      tenantId: r.tenant_id,
      username: r.username,
      displayName: r.display_name,
      avatarUrl: r.avatar_url,
      isPublished: r.is_published,
      publishedAt: r.published_at,
      views: r.views,
      links: r.links,
      products: r.products,
    })),
  };
}
