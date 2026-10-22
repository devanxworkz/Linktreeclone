import { mkdirSync } from 'node:fs';
import type { PGlite } from '@electric-sql/pglite';
import { config } from '../config.js';

export interface QueryResult<T> {
  rows: T[];
}

export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
  readonly kind: 'pglite' | 'pg';
}

let instance: Db | null = null;

async function createPglite(): Promise<Db> {
  const { PGlite } = await import('@electric-sql/pglite');
  const dir = config.pgliteDataDir;
  let client: PGlite;
  if (dir === ':memory' || dir === ':memory:' || dir === 'memory') {
    client = new PGlite();
  } else {
    mkdirSync(dir, { recursive: true });
    client = new PGlite(dir);
  }
  await client.waitReady;

  return {
    kind: 'pglite',
    async query<T>(sql: string, params?: unknown[]) {
      const res = await client.query<T>(sql, params as unknown[] | undefined);
      return { rows: res.rows };
    },
    async exec(sql: string) {
      await client.exec(sql);
    },
    async close() {
      await client.close();
    },
  };
}

async function createPg(): Promise<Db> {
  const { default: pg } = await import('pg');
  const pool = new pg.Pool({
    connectionString: config.databaseUrl,
    ssl: config.databaseUrl.includes('sslmode=require') || config.isProd
      ? { rejectUnauthorized: false }
      : undefined,
    max: 10,
  });

  return {
    kind: 'pg',
    async query<T>(sql: string, params?: unknown[]) {
      const res = await pool.query(sql, params as unknown[] | undefined);
      return { rows: res.rows as T[] };
    },
    async exec(sql: string) {
      await pool.query(sql);
    },
    async close() {
      await pool.end();
    },
  };
}

export async function getDb(): Promise<Db> {
  if (instance) return instance;
  instance = config.databaseUrl.startsWith('postgres') ? await createPg() : await createPglite();
  return instance;
}

export async function closeDb(): Promise<void> {
  if (!instance) return;
  await instance.close();
  instance = null;
}

/** Test helper: point the singleton at a fresh in-memory database. */
export function setDb(db: Db | null): void {
  instance = db;
}
