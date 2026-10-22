# Deploying Pehchaan

This guide takes the local build to a production host. It is written for a
single-process deployment (the API serves the built web app), which is the
simplest correct setup. Everything below can be done on Render, Fly.io, Railway,
a plain VPS behind nginx, or any Node host.

> Read the **Remaining production requirements** section at the end. Several
> items are intentionally *not done* in this build and must be handled before
> real users arrive.

---

## 1. Prerequisites

- A **Node 20+** host.
- A **Postgres** database. Managed options: Supabase, Neon, Railway, RDS. You
  need the connection string (`DATABASE_URL`).
- A domain (optional but expected) and TLS (most hosts provide it).
- The app is a monorepo (npm workspaces: `server`, `web`). One build command
  produces both artifacts.

## 2. Environment variables

Set these in your host's dashboard (never commit them):

| Variable | Value in production |
|----------|---------------------|
| `NODE_ENV` | `production` |
| `PORT` | the port the host gives you (often injected automatically) |
| `DATABASE_URL` | `postgres://user:pass@host:5432/pehchaan?sslmode=require` |
| `PUBLIC_BASE_URL` | `https://your-domain.com` (no trailing slash) |
| `SESSION_COOKIE_NAME` | `pehchaan_session` (or your choice) |
| `SESSION_TTL_MS` | e.g. `2592000000` (30 days) |
| `CORS_ORIGINS` | `https://your-domain.com` |
| `TRUST_PROXY` | `1` (you are behind a proxy/load balancer) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | optional; creates an admin on first seed |
| `PGLITE_DATA_DIR` | **not used** — leave unset when `DATABASE_URL` is set |

`NODE_ENV=production` makes the session cookie `Secure`, which requires HTTPS.

## 3. Build

```bash
npm ci
npm run build          # type-checks + builds web/dist and server/dist
```

## 4. Migrate and seed

Run migrations once per deploy (idempotent — safe to run every time):

```bash
npm run migrate
```

Optionally create an admin and demo data:

```bash
npm run seed           # requires ADMIN_EMAIL/ADMIN_PASSWORD to create an admin
```

> Prefer running migrations as a **release/one-off command**, not on every web
> process start, especially with more than one instance.

## 5. Start

```bash
npm start              # runs node server/dist/index.js
```

The API listens on `PORT`, serves `/api/*`, and serves the built SPA for all
other routes (`web/dist`). Health check: `GET /api/health`.

Because the SPA is served by the API, **you do not need a separate static host or
CORS in production** — everything is same-origin. Set `PUBLIC_BASE_URL` to the
public URL so shareable creator links are correct.

### Example: Render

- **Build command:** `npm ci && npm run build`
- **Start command:** `npm start`
- **Health check path:** `/api/health`
- Add the environment variables above. Set `TRUST_PROXY=1`.

## 6. Database: connection, RLS and the app role

The migrations create tables and **row-level security (RLS) policies** that key
off a per-request setting `app.user_id`. There are two things to know:

1. **Primary isolation is in the application layer.** Every service query is
   already scoped by the authenticated tenant. RLS is defence-in-depth.
2. **RLS is only effective when the connecting role is not the table owner.**
   Owners bypass RLS in Postgres. In this build the local/dev connection is the
   owner, so RLS is exercised only by `server/tests/rls.test.ts` (which switches
   to a restricted role).

For production, to make RLS real:

1. Create a restricted login role and grant it DML only:

   ```sql
   create role pehchaan_app login password '...';
   grant usage on schema public to pehchaan_app;
   grant select, insert, update, delete on all tables in schema public to pehchaan_app;
   grant usage, select on all sequences in schema public to pehchaan_app;
   ```

2. Point `DATABASE_URL` at `pehchaan_app` (not the owner).
3. In the request path, set the current user before queries run:
   ```sql
   select set_config('app.user_id', $1, true);   -- true = transaction-local
   ```
   Wrap each request's queries in a transaction so the setting is scoped. The
   migrations already read `current_setting('app.user_id', true)` in the
   policies, so no policy changes are needed.

> Not doing the above still leaves you protected by the application-layer
> scoping, but you lose the second line of defence. Do it before onboarding
> untrusted users.

## 7. Domain and TLS

- Point your domain's A/AAAA (or CNAME) record at the host.
- Enable the host's managed TLS.
- Set `PUBLIC_BASE_URL=https://your-domain.com` and redeploy so links are correct.
- Keep `TRUST_PROXY=1` so `X-Forwarded-*` headers and secure cookies behave.

## 8. Backups and operations

- Enable automated **daily backups** on the Postgres provider (and test a restore).
- Watch logs for `[error]` lines (unexpected 500s are logged server-side only).
- Monitor `GET /api/health` for liveness.
- Rotate secrets if they are ever exposed.

## 9. Post-deploy smoke test

With the app live:

1. `GET https://your-domain.com/api/health` → `{"ok":true,...}`.
2. Open the site → landing page renders.
3. Register a throwaway creator → you land on `/dashboard`.
4. Add a link, toggle **Publish**, open `/u/<username>` → the link is visible.
5. Confirm `/u/unknown-user` shows the “not available” state.
6. Log out, log back in.

---

## Remaining production requirements

These are **not** done in this build and are required before real users:

1. **Payment gateway** for the Pro plan (e.g. Razorpay/Stripe). Today the plan is
   cosmetic; nothing is charged. Add webhook-verified subscription state and
   gate features server-side, not just in the UI.
2. **Transactional email**: verification and password reset. The API currently
   has no mail transport; the forgot-password screen says so explicitly.
3. **Rate limiting** on auth and public write endpoints (login, register, view/
   click recording) to blunt abuse and enumeration.
4. **Password reset tokens** with expiry, single-use, and audit logging.
5. **CSRF strategy** if you ever allow cross-site cookies. The current cookie is
   `SameSite=Lax` and the app is same-origin, which mitigates the common cases.
6. **Object storage + image uploads** for avatars, product images and UPI QR.
   Today these are **URLs** the creator pastes; there is no upload endpoint.
7. **Run RLS with a non-owner role** (section 6) and add a request-scoped
   transaction that sets `app.user_id`.
8. **Observability**: structured logging, error tracking (e.g. Sentry), metrics,
   and alerting.
9. **Legal**: real privacy policy, terms, GST/tax handling and a data-processing
   agreement appropriate to your jurisdiction. The in-app pages are placeholders.
10. **Accessibility and i18n polish**: run an automated a11y audit (axe) in CI and
    complete the Hindi/Kannada dictionaries.
11. **Dependency audit**: `npm audit` reports advisories in the dev toolchain;
    review and pin/patch before going live.
12. **Content moderation & abuse tooling** for public pages (reporting, takedown).
