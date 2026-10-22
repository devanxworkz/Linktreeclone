import { getDb } from '../db/index.js';
import { conflict, notFound } from '../http/errors.js';
import { isUniqueViolation } from './account.js';
import { toLinkDto, toProductDto, toProfileDto } from './mappers.js';
import type { LinkRow, ProductRow, ProfileRow, ThemeKey, Layout } from './types.js';
import type { ProfileUpdateInput, ThemeInput, AppearanceInput } from '../validation/schemas.js';

export async function getProfileByTenant(tenantId: string): Promise<ProfileRow> {
  const db = await getDb();
  const { rows } = await db.query<ProfileRow>('select * from profiles where tenant_id = $1', [
    tenantId,
  ]);
  if (!rows[0]) throw notFound('Profile not found.');
  return rows[0];
}

export async function updateProfile(
  tenantId: string,
  input: ProfileUpdateInput,
): Promise<ProfileRow> {
  const db = await getDb();
  const { rows } = await db.query<ProfileRow>(
    `update profiles set
       display_name = $2,
       bio = $3,
       avatar_url = $4,
       whatsapp_number = $5,
       upi_id = $6,
       upi_qr_url = $7,
       meta_title = $8,
       meta_description = $9
     where tenant_id = $1
     returning *`,
    [
      tenantId,
      input.displayName,
      input.bio ?? '',
      input.avatarUrl,
      input.whatsappNumber,
      input.upiId,
      input.upiQrUrl,
      input.metaTitle,
      input.metaDescription,
    ],
  );
  return rows[0]!;
}

export async function updateUsername(tenantId: string, username: string): Promise<ProfileRow> {
  const db = await getDb();
  try {
    const { rows } = await db.query<ProfileRow>(
      'update profiles set username = $2 where tenant_id = $1 returning *',
      [tenantId, username],
    );
    return rows[0]!;
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw conflict('That username is already taken.', { field: 'username' });
    }
    throw err;
  }
}

export async function updateTheme(tenantId: string, theme: ThemeInput): Promise<ProfileRow> {
  const db = await getDb();
  const { rows } = await db.query<ProfileRow>(
    'update profiles set theme = $2::jsonb where tenant_id = $1 returning *',
    [tenantId, JSON.stringify(theme)],
  );
  return rows[0]!;
}

export async function updateAppearance(
  tenantId: string,
  appearance: AppearanceInput,
): Promise<ProfileRow> {
  const db = await getDb();
  const { rows } = await db.query<ProfileRow>(
    'update profiles set appearance = $2::jsonb where tenant_id = $1 returning *',
    [tenantId, JSON.stringify(appearance)],
  );
  return rows[0]!;
}

export async function setPublished(tenantId: string, isPublished: boolean): Promise<ProfileRow> {
  const db = await getDb();
  const { rows } = await db.query<ProfileRow>(
    `update profiles
       set is_published = $2,
           published_at = case when $2 then coalesce(published_at, now()) else published_at end
     where tenant_id = $1
     returning *`,
    [tenantId, isPublished],
  );
  return rows[0]!;
}

export interface PublicPage {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  whatsappNumber: string | null;
  upiId: string | null;
  upiQrUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  theme: { themeKey: ThemeKey; layout: Layout; accent: string };
  appearance: AppearanceInput | null;
  links: ReturnType<typeof toLinkDto>[];
  products: ReturnType<typeof toProductDto>[];
}

export async function getPublicPage(username: string): Promise<PublicPage | null> {
  const db = await getDb();
  const { rows } = await db.query<{
    username: string;
    display_name: string;
    bio: string;
    avatar_url: string | null;
    whatsapp_number: string | null;
    upi_id: string | null;
    upi_qr_url: string | null;
    meta_title: string | null;
    meta_description: string | null;
    theme: { themeKey: ThemeKey; layout: Layout; accent: string };
    appearance: AppearanceInput | null;
    tenant_id: string;
  }>('select * from public_pages where lower(username) = lower($1)', [username]);

  const page = rows[0];
  if (!page) return null;

  const [links, products] = await Promise.all([
    db.query<Pick<LinkRow, 'id' | 'title' | 'url' | 'icon' | 'position'>>(
      `select id, title, url, icon, position
       from public_links where tenant_id = $1 order by position asc`,
      [page.tenant_id],
    ),
    db.query<
      Pick<
        ProductRow,
        'id' | 'title' | 'description' | 'image_url' | 'price_paise' | 'currency' | 'destination_url' | 'position'
      >
    >(
      `select id, title, description, image_url, price_paise, currency, destination_url, position
       from public_products where tenant_id = $1 order by position asc`,
      [page.tenant_id],
    ),
  ]);

  return {
    username: page.username,
    displayName: page.display_name,
    bio: page.bio,
    avatarUrl: page.avatar_url,
    whatsappNumber: page.whatsapp_number,
    upiId: page.upi_id,
    upiQrUrl: page.upi_qr_url,
    metaTitle: page.meta_title,
    metaDescription: page.meta_description,
    theme: page.theme,
    appearance: page.appearance ?? null,
    links: links.rows.map((l) =>
      toLinkDto({ ...l, tenant_id: page.tenant_id, is_active: true, click_count: 0, created_at: '', updated_at: '' }),
    ),
    products: products.rows.map((p) =>
      toProductDto({ ...p, tenant_id: page.tenant_id, is_active: true, created_at: '', updated_at: '' }),
    ),
  };
}

export { toProfileDto };
