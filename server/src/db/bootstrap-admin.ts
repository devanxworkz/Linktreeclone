import { hashPassword } from '../auth/password.js';
import { config } from '../config.js';
import { getDb } from './index.js';
import { createAccount, findUserByEmail, usernameTaken } from '../services/account.js';

/**
 * Creates (or optionally repairs) the bootstrap administrator from
 * ADMIN_EMAIL / ADMIN_PASSWORD. Runs at boot in every environment so a
 * production deploy without shell access still gets an admin account.
 *
 * Safe properties:
 *  - Idempotent: does nothing when the account already has the admin role.
 *  - Never logs the password.
 *  - Never silently elevates an existing creator: promotion requires an
 *    explicit ADMIN_PROMOTE_EXISTING=1, because an attacker could otherwise
 *    pre-register the admin email and be promoted.
 */
export async function ensureBootstrapAdmin(): Promise<void> {
  if (!config.adminEmail || !config.adminPassword) return;

  const existing = await findUserByEmail(config.adminEmail);
  const db = await getDb();

  if (existing) {
    if (existing.role !== 'admin') {
      if (!config.adminPromoteExisting) {
        console.warn(
          `[bootstrap] ${config.adminEmail} already exists with role '${existing.role}'. ` +
            'Set ADMIN_PROMOTE_EXISTING=1 to promote it to admin, or use a different ADMIN_EMAIL.',
        );
        return;
      }
      await db.query("update users set role = 'admin', status = 'active' where id = $1", [existing.id]);
      console.log(`[bootstrap] promoted existing account to admin: ${config.adminEmail}`);
    }

    if (config.adminSyncPassword) {
      await db.query('update users set password_hash = $1 where id = $2', [
        await hashPassword(config.adminPassword),
        existing.id,
      ]);
      console.log(`[bootstrap] updated password for ${config.adminEmail} from ADMIN_PASSWORD`);
    }
    return;
  }

  let username = 'platform-admin';
  if (await usernameTaken(username)) {
    username = `platform-admin-${Math.random().toString(36).slice(2, 8)}`;
  }

  const { user } = await createAccount({
    email: config.adminEmail,
    password: config.adminPassword,
    displayName: 'Platform Admin',
    username,
  });
  await db.query(
    "update users set role = 'admin', email_verified_at = coalesce(email_verified_at, now()) where id = $1",
    [user.id],
  );
  console.log(`[bootstrap] created admin account ${config.adminEmail}`);
}
