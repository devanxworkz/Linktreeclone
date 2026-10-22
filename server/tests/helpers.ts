import request from 'supertest';
import type { Express } from 'express';
import { createApp } from '../src/app.js';
import { getDb } from '../src/db/index.js';
import { migrate } from '../src/db/migrate.js';

let app: Express | null = null;

export async function getApp(): Promise<Express> {
  if (!app) {
    await migrate();
    app = createApp();
  }
  return app;
}

export async function resetDb(): Promise<void> {
  const db = await getDb();
  await migrate();
  await db.exec(
    `truncate table admin_audit_log, page_views, sessions, products, links, profiles, tenants, users
     restart identity cascade`,
  );
}

export function agent(a: Express) {
  return request.agent(a);
}

export interface SeededUser {
  email: string;
  password: string;
  username: string;
  id: string;
  tenantId: string;
}

export async function registerUser(
  a: Express,
  opts: { email?: string; password?: string; username?: string; displayName?: string } = {},
): Promise<{ agent: ReturnType<typeof agent>; user: SeededUser }> {
  const email = opts.email ?? `user${Math.random().toString(36).slice(2, 9)}@example.com`;
  const password = opts.password ?? 'Password@123';
  const username = opts.username ?? `user${Math.random().toString(36).slice(2, 8)}`;
  const displayName = opts.displayName ?? 'Test Creator';

  const ag = agent(a);
  const res = await ag
    .post('/api/auth/register')
    .send({ email, password, username, displayName })
    .expect(201);

  return {
    agent: ag,
    user: { email, password, username, id: res.body.user.id, tenantId: res.body.tenant.id },
  };
}
