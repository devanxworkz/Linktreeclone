import { createApp } from './app.js';
import { config } from './config.js';
import { getDb } from './db/index.js';
import { migrate } from './db/migrate.js';

const db = await getDb();
console.log(`[server] database backend: ${db.kind}`);
const applied = await migrate();
if (applied.length) console.log(`[server] migrations applied: ${applied.join(', ')}`);

// Create/repair the bootstrap admin from ADMIN_EMAIL / ADMIN_PASSWORD.
// Runs in production too (a deploy has no shell to run `npm run seed`).
const { ensureBootstrapAdmin } = await import('./db/bootstrap-admin.js');
await ensureBootstrapAdmin();

// Opt-in seed (used by local setup and end-to-end tests). Never runs in prod.
if (!config.isProd && process.env.SEED_ON_BOOT === '1') {
  const { seed } = await import('./db/seed.js');
  await seed();
}

const app = createApp();
app.listen(config.port, () => {
  console.log(`[server] Pehchaan API listening on http://localhost:${config.port}`);
  console.log(`[server] public base URL: ${config.publicBaseUrl}`);
});
