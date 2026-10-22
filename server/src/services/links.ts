import { getDb } from '../db/index.js';
import { notFound } from '../http/errors.js';
import { toLinkDto } from './mappers.js';
import type { LinkRow } from './types.js';
import type { LinkInput } from '../validation/schemas.js';

export async function listLinks(tenantId: string) {
  const db = await getDb();
  const { rows } = await db.query<LinkRow>(
    `select * from links where tenant_id = $1 order by position asc, created_at asc`,
    [tenantId],
  );
  return rows.map(toLinkDto);
}

export async function createLink(tenantId: string, input: LinkInput) {
  const db = await getDb();
  const { rows } = await db.query<LinkRow>(
    `insert into links (tenant_id, title, url, icon, is_active, position)
     values ($1, $2, $3, $4, $5,
             (select coalesce(max(position), -1) + 1 from links where tenant_id = $1))
     returning *`,
    [tenantId, input.title, input.url, input.icon, input.isActive],
  );
  return toLinkDto(rows[0]!);
}

export async function updateLink(
  tenantId: string,
  id: string,
  input: Partial<LinkInput>,
) {
  const db = await getDb();
  const current = await db.query<LinkRow>(
    'select * from links where id = $1 and tenant_id = $2',
    [id, tenantId],
  );
  if (!current.rows[0]) throw notFound('Link not found.');
  const c = current.rows[0];
  const { rows } = await db.query<LinkRow>(
    `update links set title = $3, url = $4, icon = $5, is_active = $6
     where id = $1 and tenant_id = $2 returning *`,
    [
      id,
      tenantId,
      input.title ?? c.title,
      input.url ?? c.url,
      input.icon ?? c.icon,
      input.isActive ?? c.is_active,
    ],
  );
  return toLinkDto(rows[0]!);
}

export async function deleteLink(tenantId: string, id: string): Promise<void> {
  const db = await getDb();
  const { rows } = await db.query<{ id: string }>(
    'delete from links where id = $1 and tenant_id = $2 returning id',
    [id, tenantId],
  );
  if (!rows[0]) throw notFound('Link not found.');
}

export async function reorderLinks(tenantId: string, ids: string[]) {
  const db = await getDb();
  const existing = await db.query<{ id: string }>('select id from links where tenant_id = $1', [
    tenantId,
  ]);
  const owned = new Set(existing.rows.map((r) => r.id));
  let pos = 0;
  for (const id of ids) {
    if (!owned.has(id)) continue;
    await db.query('update links set position = $3 where id = $1 and tenant_id = $2', [
      id,
      tenantId,
      pos++,
    ]);
  }
  return listLinks(tenantId);
}

export async function incrementLinkClick(tenantId: string, id: string): Promise<void> {
  const db = await getDb();
  await db.query(
    'update links set click_count = click_count + 1 where id = $1 and tenant_id = $2',
    [id, tenantId],
  );
}
