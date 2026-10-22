import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4173);
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Build first (`npm run test:e2e` does this via the pretest hook), then
    // serve the compiled API and the built SPA from a single origin, exactly
    // as production runs. An in-memory database is used and is migrated on
    // boot, so every run starts clean.
    command: 'node server/dist/index.js',
    url: `${BASE_URL}/api/health`,
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      PORT: String(PORT),
      NODE_ENV: 'test',
      PGLITE_DATA_DIR: ':memory:',
      PUBLIC_BASE_URL: BASE_URL,
      SESSION_COOKIE_NAME: 'pehchaan_e2e',
      // Seed a bootstrap admin (and demo creators) so the admin-console flows
      // can be exercised end-to-end. Never used in production.
      SEED_ON_BOOT: '1',
      ADMIN_EMAIL: 'admin@e2e.test',
      ADMIN_PASSWORD: 'Admin@12345',
    },
  },
});
