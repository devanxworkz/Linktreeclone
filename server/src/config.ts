import 'dotenv/config';

function bool(v: string | undefined, fallback: boolean): boolean {
  if (v === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
}

const NODE_ENV = process.env.NODE_ENV ?? 'development';

export const config = {
  nodeEnv: NODE_ENV,
  isProd: NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 4000),

  // Postgres connection string. When empty we run on PGlite (embedded
  // Postgres/WASM) — real Postgres semantics, no server needed locally.
  databaseUrl: process.env.DATABASE_URL ?? '',
  // Where PGlite keeps its data. ':memory:' means ephemeral (tests/dev).
  pgliteDataDir: process.env.PGLITE_DATA_DIR ?? '.data/pgdata',

  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? 'pehchaan_session',
  // 30 days.
  sessionTtlMs: Number(process.env.SESSION_TTL_MS ?? 1000 * 60 * 60 * 24 * 30),

  // Public base URL, used to build the shareable creator URL.
  publicBaseUrl: (process.env.PUBLIC_BASE_URL ?? 'http://localhost:5173').replace(/\/$/, ''),

  // Comma-separated list of allowed browser origins for CORS in dev.
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:4000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  // Optional bootstrap admin. If set and no admin exists, seed creates one.
  adminEmail: process.env.ADMIN_EMAIL ?? '',
  adminPassword: process.env.ADMIN_PASSWORD ?? '',

  trustProxy: bool(process.env.TRUST_PROXY, false),
};

export type Config = typeof config;
