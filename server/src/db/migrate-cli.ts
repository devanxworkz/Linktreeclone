import { migrate } from './migrate.js';
import { closeDb, getDb } from './index.js';

const db = await getDb();
console.log(`[migrate] database backend: ${db.kind}`);
const applied = await migrate();
if (applied.length === 0) {
  console.log('[migrate] nothing to apply; schema is up to date');
} else {
  console.log(`[migrate] applied: ${applied.join(', ')}`);
}
await closeDb();
