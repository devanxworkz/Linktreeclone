import { getDb } from '../db/index.js';
import { hashToken, newResetToken } from '../auth/reset-tokens.js';

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function createPasswordReset(userId: string): Promise<string> {
  const db = await getDb();
  const token = newResetToken();
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);
  // Invalidate previous unused tokens for this user
  await db.query('update password_reset_tokens set used_at = now() where user_id = $1 and used_at is null and expires_at > now()', [userId]);
  await db.query(
    'insert into password_reset_tokens (user_id, token_hash, expires_at) values ($1, $2, $3)',
    [userId, hashToken(token), expiresAt],
  );
  return token;
}

export async function consumePasswordReset(token: string): Promise<string | null> {
  const db = await getDb();
  const tokenHash = hashToken(token);
  const { rows } = await db.query<{ user_id: string }>(
    `select user_id from password_reset_tokens 
     where token_hash = $1 and used_at is null and expires_at > now() 
     limit 1`,
    [tokenHash],
  );
  const row = rows[0];
  if (!row) return null;
  await db.query('update password_reset_tokens set used_at = now() where token_hash = $1', [tokenHash]);
  return row.user_id;
}

export async function invalidateAllUserResetTokens(userId: string): Promise<void> {
  const db = await getDb();
  await db.query('update password_reset_tokens set used_at = now() where user_id = $1 and used_at is null', [userId]);
}
