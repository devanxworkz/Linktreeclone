import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    hookTimeout: 60_000,
    testTimeout: 30_000,
    env: {
      NODE_ENV: 'test',
      PGLITE_DATA_DIR: ':memory:',
      DATABASE_URL: '',
      PUBLIC_BASE_URL: 'http://localhost:5173',
    },
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
  },
});
