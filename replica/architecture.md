# Architecture: Pehchaan (a rebuild of Beacons.ai's core link-in-bio loop)

Reads `replica/recon.md` and `replica/features.csv`.
SQL: `replica/schema.sql` + `replica/002_rls.sql`.

## Stack

| layer | choice | why |
| --- | --- | --- |
| web | React 18 + TypeScript + Tailwind (Vite) | the required stack; Vite keeps the toolchain small and fast |
| server | Node 20 + TypeScript + Express | maintainable, typed TS API; one process serves the API and (in prod) the built SPA |
| database | PostgreSQL. Local dev/tests: **PGlite** (embedded Postgres/WASM). Prod: Supabase/Neon/RDS via `DATABASE_URL` | real Postgres semantics (RLS, triggers, constraints) with zero install locally; same SQL in prod. No Docker/psql needed on this machine |
| access rules | data-layer tenant scoping (primary) + Postgres RLS (defence in depth) | isolation must not rely on the frontend; RLS is enforced as a non-owner role in prod and tested via `SET ROLE` under PGlite |
| auth | first-party sessions: `scrypt` password hashing + random session token (hashed at rest) in an httpOnly, SameSite=Lax cookie | no native deps, no third party needed to run/test locally; OAuth/Google is a documented swap-in |
| validation | Zod schemas on every request body/params | one schema per shape, server-side, reused for types |
| tests | Vitest (unit + API/security) and Playwright (e2e) | unit/API run with no browser; e2e drives the real built app |
| hosting | any Node host (Render/Fly/Railway) + managed Postgres | boring and cheap |

One database, no microservices. The clone needs Beacons' features, not its
architecture.

## Schema

Tables: 8 private (`users`, `tenants`, `profiles`, `links`, `products`,
`sessions`, `page_views`, `admin_audit_log`) + 3 public read views. Access
rules: **both** — data-layer scoping is primary, RLS (`002_rls.sql`) is defence
in depth. Full DDL in `replica/schema.sql`; RLS in `replica/002_rls.sql`.

Ownership boundary: `tenant_id` on `profiles`, `links`, `products`,
`page_views`; `user_id` on `sessions`; `owner_user_id` on `tenants`.

Hard constraints the recon found:
- **username is unique case-insensitively** — `unique index on lower(username)`,
  not a UI check (F01 edge "username taken", race between two sign-ups).
- **username format** enforced by a CHECK (`[a-z0-9_-]`, 3–30 chars) and a
  reserved-word list (`admin`, `login`, `u`, ...).
- money in **paise** (integer) + `currency`, never float.
- `times` are `timestamptz` (UTC).
- one profile per tenant (`unique`), links/products ordered by `position`.
- the storefront design lives in `profiles.appearance` (nullable jsonb, added by
  `003_appearance.sql`); a public view exposes it only for published pages.
- `users.last_login_at` (nullable) and the append-only `admin_audit_log`
  (actor email snapshotted, target + jsonb metadata) are added by
  `004_admin.sql` to power the admin console.

## API

All under `/api`. Auth via session cookie. `401` = not logged in, `403` =
logged in but not allowed, `404` = missing **or not yours** (we return 404,
not 403, for cross-tenant ids so we never confirm a row exists).

| method path | does | who | input | output | flow |
| --- | --- | --- | --- | --- | --- |
| POST `/api/auth/register` | create user + tenant + empty profile + session | anon | email, password, name, username | user + set-cookie | F01 |
| POST `/api/auth/login` | verify + create session | anon | email, password | user + set-cookie | F02, F06 |
| POST `/api/auth/logout` | destroy session | any | – | 204 | – |
| GET `/api/auth/me` | current user + tenant + profile | auth | – | user/tenant/profile | all |
| POST `/api/auth/change-password` | rotate password, invalidate other sessions | auth | current, new | 204 | S17 |
| GET `/api/profile` | own profile | auth | – | profile | S08 |
| PUT `/api/profile` | update own profile fields | auth | displayName, bio, avatarUrl, whatsapp, upi, meta | profile | F01, S08 |
| PUT `/api/profile/username` | change username (unique) | auth | username | profile | S08 |
| PUT `/api/profile` (theme via `/theme`) | **PUT** `/api/profile/theme` set theme/layout/accent | auth | themeKey, layout, accent | profile | F05, S11 |
| PUT `/api/profile/appearance` | save the storefront design (template + customisation) | auth | full `appearance` document | profile | F06, S11 |
| POST `/api/profile/publish` | publish / unpublish | auth | isPublished | profile | F01, S12 |
| GET `/api/links` | list own links | auth | – | link[] | S09 |
| POST `/api/links` | create | auth | title, url, icon | link | S09 |
| PUT `/api/links/:id` | update (scoped) | auth | fields | link | S09 |
| DELETE `/api/links/:id` | delete (scoped) | auth | – | 204 | S09 |
| PUT `/api/links/reorder` | set order | auth | ordered ids | link[] | F02 |
| GET `/api/products` | list own products | auth | – | product[] | S10 |
| POST `/api/products` | create | auth | title, desc, image, price, url | product | F04 |
| PUT `/api/products/:id` | update (scoped) | auth | fields | product | F04 |
| DELETE `/api/products/:id` | delete (scoped) | auth | – | 204 | F04 |
| PUT `/api/products/reorder` | set order | auth | ordered ids | product[] | F04 |
| GET `/api/stats` | own views/clicks | auth | – | counts + series | F07 |
| GET `/api/public/:username` | public page payload | **anon** | – | page (published only) | F03 |
| POST `/api/public/:username/view` | record a page view | **anon** | referrer | 204 | F03 |
| GET `/api/admin/overview` | platform metrics + growth + 14-day series + recent activity | admin | – | totals, activity, series, recentUsers, recentAudit | S14 |
| GET `/api/admin/users` | users + tenants | admin | q, status, role, published, page | paginated rows | S15 |
| GET `/api/admin/users/:id` | one account with real counts | admin | – | user, tenant, profile, counts | S15 |
| PUT `/api/admin/users/:id/status` | suspend / reactivate (writes audit) | admin | status, reason? | user | F06, S15 |
| GET `/api/admin/storefronts` | every creator page, ranked by views | admin | q, published, page | paginated rows | S16 |
| GET `/api/admin/analytics` | platform reach | admin | – | totals + 30-day series + top creators | S16 |
| GET `/api/admin/audit` | audit trail | admin | q, action, page | paginated rows | S18 |
| GET `/api/admin/audit/actions` | distinct action names | admin | – | actions | S18 |
| GET `/api/admin/stats` | usage per tenant (alias of storefronts) | admin | – | rows | S16 |

Admin RBAC is enforced in the backend (`requireAuth` + `requireAdmin`) — the
browser role is never trusted for authorisation, only for showing/hiding UI.
Guards on status changes: an admin cannot change their own status, and the last
active administrator cannot be suspended. Every status change is written to
`admin_audit_log` with the actor taken from the session. There is **no public
admin registration**; the first administrator is bootstrapped from
`ADMIN_EMAIL`/`ADMIN_PASSWORD` via the opt-in seed.

Webhooks in/out: none in phase 1. Jobs: none in phase 1 (a page-view rollup
job is noted for phase 2). UPI is a link/QR only — no gateway, no
"payment confirmed" claim.

## The parts that bite

- **Multi-tenancy**: every private query takes `tenant_id` from the session,
  never from the request. Cross-tenant ids resolve to 404. RLS is the backstop.
- **Username race**: `unique index on lower(username)`; the create path maps the
  unique violation (SQLSTATE `23505`) to a 409 with a friendly message.
- **Publishing/caching**: the public endpoint reads only the *views*/published
  rows, so unpublishing is immediate. No CDN cache in phase 1.
- **Sessions**: token stored only as a SHA-256 hash; cookie is httpOnly +
  SameSite=Lax + Secure in prod; changing a password deletes other sessions.
- **UPI honesty**: the UI labels UPI as "pay via UPI — you pay in your own app";
  it never shows a success state and never records a transaction.
- **i18n**: all UI strings flow through a tiny `t()` dictionary (en shipped,
  hi/kn stubbed) so translation is a data change, not a rewrite.
- **Time/limits**: `timestamptz` UTC; avatar/product image are URLs (no upload
  in phase 1, so no file-size limits yet — documented).

## Build order

1. **Vertical slice** (S04, S08, S13): register → set profile → publish →
   public page. Tables: users, tenants, profiles, sessions. Routes: auth*,
   profile, public. Proves the stack end to end.
2. **Must-haves by area**: links (S09), products (S10), appearance (S11),
   preview/publish (S12), overview (S07), marketing (S01–S03), admin
   (S14–S16), legal (S19).
3. **Should-haves**: analytics counts (F07/S16), social row, icon per link,
   empty/loading/error states, a11y pass.
4. **Could-haves / phase 2**: custom domains, email/newsletter, paid plans
   (billing), i18n hi/kn, image uploads.
