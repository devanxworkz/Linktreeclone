import { getDb } from '../db/index.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { conflict } from '../http/errors.js';
import type { ProfileRow, TenantRow, UserRow } from './types.js';

export function isUniqueViolation(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505';
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const db = await getDb();
  const { rows } = await db.query<UserRow>(
    'select id, email, password_hash, role, status, created_at from users where email_lower = lower($1)',
    [email],
  );
  return rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const db = await getDb();
  const { rows } = await db.query<UserRow>(
    'select id, email, password_hash, role, status, created_at from users where id = $1',
    [id],
  );
  return rows[0] ?? null;
}

export async function findTenantByOwner(userId: string): Promise<TenantRow | null> {
  const db = await getDb();
  const { rows } = await db.query<TenantRow>(
    'select id, owner_user_id, name from tenants where owner_user_id = $1 limit 1',
    [userId],
  );
  return rows[0] ?? null;
}

export async function findProfileByTenant(tenantId: string): Promise<ProfileRow | null> {
  const db = await getDb();
  const { rows } = await db.query<ProfileRow>(
    'select * from profiles where tenant_id = $1',
    [tenantId],
  );
  return rows[0] ?? null;
}

export async function usernameTaken(username: string): Promise<boolean> {
  const db = await getDb();
  const { rows } = await db.query<{ n: string }>(
    'select 1 as n from profiles where username_lower = lower($1) limit 1',
    [username],
  );
  return rows.length > 0;
}

export interface CreateAccountInput {
  email: string;
  password: string;
  displayName: string;
  username: string;
}

export async function createAccount(input: CreateAccountInput): Promise<{
  user: UserRow;
  tenant: TenantRow;
  profile: ProfileRow;
}> {
  const db = await getDb();

  if (await usernameTaken(input.username)) {
    throw conflict('That username is already taken.', { field: 'username' });
  }

  const passwordHash = await hashPassword(input.password);

  let userId: string;
  try {
    const { rows } = await db.query<UserRow>(
      `insert into users (email, password_hash, role)
       values ($1, $2, 'creator')
       returning id, email, password_hash, role, status, created_at`,
      [input.email, passwordHash],
    );
    userId = rows[0]!.id;
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw conflict('An account with that email already exists.', { field: 'email' });
    }
    throw err;
  }

  try {
    const tenantRes = await db.query<TenantRow>(
      `insert into tenants (owner_user_id, name) values ($1, $2)
       returning id, owner_user_id, name`,
      [userId, input.displayName],
    );
    const tenant = tenantRes.rows[0]!;

    const profileRes = await db.query<ProfileRow>(
      `insert into profiles (tenant_id, username, display_name)
       values ($1, $2, $3) returning *`,
      [tenant.id, input.username, input.displayName],
    );
    const user = (await findUserById(userId))!;
    return { user, tenant, profile: profileRes.rows[0]! };
  } catch (err) {
    // Roll back the half-created account so a taken username leaves no orphan.
    await db.query('delete from users where id = $1', [userId]);
    if (isUniqueViolation(err)) {
      throw conflict('That username is already taken.', { field: 'username' });
    }
    throw err;
  }
}

export async function verifyCredentials(email: string, password: string): Promise<UserRow | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await verifyPassword(password, user.password_hash);
  return ok ? user : null;
}

export async function updatePassword(userId: string, newPassword: string): Promise<void> {
  const db = await getDb();
  const passwordHash = await hashPassword(newPassword);
  await db.query('update users set password_hash = $1 where id = $2', [passwordHash, userId]);
}

export async function touchLastLogin(userId: string): Promise<void> {
  const db = await getDb();
  await db.query('update users set last_login_at = now() where id = $1', [userId]);
}

export async function deleteUser(userId: string): Promise<void> {
  const db = await getDb();
  await db.query('delete from users where id = $1', [userId]);
}
