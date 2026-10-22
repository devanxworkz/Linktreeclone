import { getDb } from '../db/index.js';
import { notFound } from '../http/errors.js';
import { toProductDto } from './mappers.js';
import type { ProductRow } from './types.js';
import type { ProductInput } from '../validation/schemas.js';

export async function listProducts(tenantId: string) {
  const db = await getDb();
  const { rows } = await db.query<ProductRow>(
    `select * from products where tenant_id = $1 order by position asc, created_at asc`,
    [tenantId],
  );
  return rows.map(toProductDto);
}

export async function createProduct(tenantId: string, input: ProductInput) {
  const db = await getDb();
  const { rows } = await db.query<ProductRow>(
    `insert into products
       (tenant_id, title, description, image_url, price_paise, destination_url, is_active, position)
     values ($1, $2, $3, $4, $5, $6, $7,
             (select coalesce(max(position), -1) + 1 from products where tenant_id = $1))
     returning *`,
    [
      tenantId,
      input.title,
      input.description,
      input.imageUrl,
      input.pricePaise,
      input.destinationUrl,
      input.isActive,
    ],
  );
  return toProductDto(rows[0]!);
}

export async function updateProduct(
  tenantId: string,
  id: string,
  input: Partial<ProductInput>,
) {
  const db = await getDb();
  const current = await db.query<ProductRow>(
    'select * from products where id = $1 and tenant_id = $2',
    [id, tenantId],
  );
  if (!current.rows[0]) throw notFound('Product not found.');
  const c = current.rows[0];

  // pricePaise is a tri-state: undefined = keep, null = clear, number = set.
  const price =
    input.pricePaise === undefined ? c.price_paise : input.pricePaise;

  const { rows } = await db.query<ProductRow>(
    `update products set
       title = $3, description = $4, image_url = $5, price_paise = $6,
       destination_url = $7, is_active = $8
     where id = $1 and tenant_id = $2 returning *`,
    [
      id,
      tenantId,
      input.title ?? c.title,
      input.description ?? c.description,
      input.imageUrl === undefined ? c.image_url : input.imageUrl,
      price,
      input.destinationUrl ?? c.destination_url,
      input.isActive ?? c.is_active,
    ],
  );
  return toProductDto(rows[0]!);
}

export async function deleteProduct(tenantId: string, id: string): Promise<void> {
  const db = await getDb();
  const { rows } = await db.query<{ id: string }>(
    'delete from products where id = $1 and tenant_id = $2 returning id',
    [id, tenantId],
  );
  if (!rows[0]) throw notFound('Product not found.');
}

export async function reorderProducts(tenantId: string, ids: string[]) {
  const db = await getDb();
  const existing = await db.query<{ id: string }>(
    'select id from products where tenant_id = $1',
    [tenantId],
  );
  const owned = new Set(existing.rows.map((r) => r.id));
  let pos = 0;
  for (const id of ids) {
    if (!owned.has(id)) continue;
    await db.query('update products set position = $3 where id = $1 and tenant_id = $2', [
      id,
      tenantId,
      pos++,
    ]);
  }
  return listProducts(tenantId);
}
