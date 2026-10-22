import { migrate } from './migrate.js';
import { seed } from './seed.js';
import { closeDb, getDb } from './index.js';

const db = await getDb();
console.log(`[seed] database backend: ${db.kind}`);
await migrate();
await seed();
console.log('[seed] done');
await closeDb();
