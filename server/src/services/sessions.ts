import { getDb } from '../db/index.js';
import { config } from '../config.js';
import { hashToken, newSessionToken } from '../auth/tokens.js';
import type { Role, UserStatus } from './types.js';

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
}

export async function createSession(userId: string, userAgent?: string): Promise<{
  token: string;
  expiresAt: Date;
}> {
  const db = await getDb();
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + config.sessionTtlMs);
  await db.query(
    `insert into sessions (user_id, token_hash, user_agent, expires_at)
     values ($1, $2, $3, $4)`,
    [userId, hashToken(token), userAgent ?? null, expiresAt],
  );
  return { token, expiresAt };
}

export async function resolveSession(token: string): Promise<SessionUser | null> {
  const db = await getDb();
  const { rows } = await db.query<{
    id: string;
    email: string;
    role: Role;
    status: UserStatus;
    expires_at: Date | string;
  }>(
    `select u.id, u.email, u.role, u.status, s.expires_at
     from sessions s
     join users u on u.id = s.user_id
     where s.token_hash = $1
     limit 1`,
    [hashToken(token)],
  );
  const row = rows[0];
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  if (row.status !== 'active') return null;
  return { id: row.id, email: row.email, role: row.role, status: row.status };
}

export async function deleteSession(token: string): Promise<void> {
  const db = await getDb();
  await db.query('delete from sessions where token_hash = $1', [hashToken(token)]);
}

export async function deleteOtherSessions(userId: string, keepToken: string): Promise<void> {
  const db = await getDb();
  await db.query('delete from sessions where user_id = $1 and token_hash <> $2', [
    userId,
    hashToken(keepToken),
  ]);
}

export async function purgeExpiredSessions(): Promise<void> {
  const db = await getDb();
  await db.query('delete from sessions where expires_at < now()');
}
