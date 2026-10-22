# Pehchaan

A multi-tenant **link-in-bio SaaS for Indian creators** — one fast, mobile-first
page for a creator's links, products, WhatsApp and UPI. This is an **original
build**: it takes inspiration from the *category* (Beacons-style link-in-bio) but
no code, assets, copy or trademarks from any other product were used.

> **Status:** working local build. API, database, web app, server-rendered test
> coverage and end-to-end tests all pass locally. See
> [What's done and what's not](#whats-done-and-whats-not).

---

## Contents

- [What it is](#what-it-is)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick start (Windows PowerShell)](#quick-start-windows-powershell)
- [Environment variables](#environment-variables)
- [Everyday commands](#everyday-commands)
- [Project structure](#project-structure)
- [Testing](#testing)
- [What's done and what's not](#whats-done-and-whats-not)
- [Security notes](#security-notes)
- [Deployment](#deployment)

---

## What it is

A creator signs up, claims a username, and gets a public page at `/u/<username>`
containing:

- a profile (name, bio, avatar) with share metadata,
- **links** they can add, edit, reorder, hide and delete,
- **products** with a price in ₹ and a destination link,
- a **WhatsApp** button (`wa.me` deep link),
- a **UPI** id and an optional QR image,
- a choice of **theme** (5 colour presets + custom accent) and **layout**
  (classic / grid / feature), previewed live before publishing.

There is also a **super admin panel** for a platform operator: a live overview,
searchable/filterable creator management (account details + suspend/reactivate
with confirmation), storefronts, platform analytics, a moderation queue,
plans/billing status, and an append-only audit log of every admin action. Access
is enforced in the backend by role; there is no public admin registration — the
first admin is bootstrapped from `ADMIN_EMAIL`/`ADMIN_PASSWORD` via the seed.

Payments (UPI) are shown as a **link only** — the app never claims to confirm a
payment. Online subscription billing is **not** wired up in this build (see
[pricing](./web/src/pages/marketing/Pricing.tsx) for the honest note shown to
users).

## Tech stack

| Layer     | Choice | Why |
|-----------|--------|-----|
| Web app   | React 18 + TypeScript + Vite + Tailwind CSS | Fast dev, static build, tiny runtime deps |
| API       | Node 20 + TypeScript + Express | Boring, well-understood, easy to host |
| Database  | **PGlite** locally (embedded Postgres/WASM) → **Postgres** in prod | Real Postgres SQL in both, no local server needed |
| Auth      | First-party sessions: scrypt password hashing, sha256-hashed tokens, httpOnly cookie | No third-party dependency, small surface |
| Validation| Zod (server-side, source of truth) | One schema for API + UI hints |
| Tests     | Vitest + supertest (API) and Playwright (e2e) | Fast unit/API + real browser flows |
| i18n      | Tiny `t(key, fallback)` dictionary (en complete, hi/kn scaffolded) | Translation-ready without a framework |

The **same SQL** runs against PGlite and Postgres, so `server/migrations/*.sql`
is the single source of truth. Set `DATABASE_URL` and the API switches to `pg`.

## Prerequisites

- **Node.js 20 or newer** and npm 10+. (Verified on Node 20.19.0 / npm 10.8.2.)
- Nothing else. **No Docker, no local Postgres, no Python required** to run the app.
  - Python 3 is only needed if you want to re-run the design contrast checker
    (`replica/design/`), and Playwright's browser download if you run e2e tests.

## Quick start (Windows PowerShell)

```powershell
# 1. Install dependencies (workspaces: server + web)
npm install

# 2. Create your local env for the API
Copy-Item server\.env.example server\.env

# 3. Create the database and load demo content
npm run migrate
npm run seed          # creates demo creators /u/aarti and /u/cafe-mocha

# 4. Run the API and the web app together
npm run dev
```

Then open:

- Web app: <http://localhost:5173>
- API health: <http://localhost:4000/api/health>
- Demo creator page: <http://localhost:5173/u/aarti>

Registration is open in the app — create your own creator to try the full flow.

## Environment variables

### API — `server/.env` (copy from `server/.env.example`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `development` | `production` enables secure cookies / prod behaviour |
| `PORT` | `4000` | API port |
| `DATABASE_URL` | *(empty)* | **Empty = PGlite** (local file DB). Set a Postgres URL for prod |
| `PGLITE_DATA_DIR` | `.data/pgdata` | Where the local PGlite database is stored (`:memory:` for ephemeral) |
| `SESSION_COOKIE_NAME` | `pehchaan_session` | Session cookie name |
| `SESSION_TTL_MS` | `2592000000` | Session lifetime (30 days) |
| `PUBLIC_BASE_URL` | `http://localhost:5173` | Base used to build the shareable `/u/<username>` link |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:4000` | Allowed browser origins in dev |
| `TRUST_PROXY` | `0` | Set `1` when behind a reverse proxy (Render/Fly/nginx) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | *(empty)* | If set, `npm run seed` creates an admin account |
| `SEED_ON_BOOT` | *(empty)* | Dev/e2e only: `1` runs the seed once at server start (ignored in production) |

### Web — `web/.env.local` (optional)

In dev, Vite proxies `/api` to the API, so you usually need nothing. To point at
a different API: `VITE_API_BASE_URL=https://api.example.com` (see
`web/.env.example`).

## Everyday commands

Run these from the project root:

| Command | Does |
|---------|------|
| `npm run dev` | Run API + web together (hot reload) |
| `npm run dev:api` / `npm run dev:web` | Run just one side |
| `npm run migrate` | Apply SQL migrations |
| `npm run seed` | Insert demo creators (and an admin if `ADMIN_EMAIL` is set) |
| `npm run build` | Type-check + build the web app and compile the API |
| `npm start` | Run the production build (API serves the built SPA) |
| `npm test` | Run the server test suite (Vitest + supertest) |
| `npm run test:e2e` | Build, then run the Playwright end-to-end suite |
| `npm run typecheck` | Type-check server and web |

## Project structure

```
OpenIQWeb/
├─ server/                     # Node + Express API
│  ├─ migrations/              # 001_init.sql, 002_rls.sql, 003_appearance.sql  (source of truth)
│  ├─ src/
│  │  ├─ auth/                 # password hashing, session tokens
│  │  ├─ db/                   # PGlite/pg adapter, migrate, seed
│  │  ├─ http/                 # errors, async wrapper, cookies
│  │  ├─ middleware/           # attachAuth, error handler
│  │  ├─ routes/               # auth, profile, links, products, stats, admin, public
│  │  ├─ services/             # data layer (tenant-scoped)
│  │  ├─ validation/           # Zod schemas
│  │  ├─ app.ts                # express app factory (also serves web/dist in prod)
│  │  └─ index.ts              # migrate + listen
│  └─ tests/                   # Vitest + supertest
├─ web/                        # React + Vite SPA
│  └─ src/
│     ├─ components/           # ui primitives, layouts, PublicView, toasts, i18n
│     ├─ context/              # AuthProvider
│     ├─ lib/                  # api client, formatting, theme, i18n, useAsync
│     └─ pages/                # marketing, auth, dashboard, admin, public
├─ e2e/                        # Playwright specs
├─ replica/                    # recon, feature matrix, schema, architecture, design, logs
└─ playwright.config.ts
```

The existing static site at the repo root (`index.html`, `css/`, `js/`, etc.) is
**not part of Pehchaan** and is left untouched.

## Testing

```powershell
npm test          # 47 API tests (Vitest): auth, isolation, public page, validation, admin, RLS
npm run test:e2e  # 19 browser tests (Playwright): landing, pricing, register→link→publish→public, login, 404, appearance, social icons, admin
```

- API tests run against an **in-memory PGlite** database and cover the
  multi-tenant isolation guarantees directly (including cross-tenant 404s).
- `server/tests/rls.test.ts` additionally proves the Postgres **row-level
  security** policies work by switching to a restricted `pehchaan_app` role.
- e2e tests build the app, serve the real compiled API + SPA on one origin, and
  drive a real Chromium browser.

See [`replica/test-plan.md`](./replica/test-plan.md) for the full plan and
[`replica/bugs.md`](./replica/bugs.md) for bugs found and fixed.

## What's done and what's not

**Done (Must-have + most Should-have, from `replica/features.csv`):**
auth (signup/login/logout/sessions), per-creator tenancy with strict ownership,
profile + username + public URL, links CRUD + reorder + active toggle, products
CRUD + reorder, themes/layouts + live preview, publish/unpublish, public page
with links/products/WhatsApp/UPI, INR formatting, share metadata, super admin
panel (live overview, creator management, storefronts, analytics, moderation,
billing status, audit log), server-side validation, 401/403/404 handling,
link-click and page-view analytics, empty/loading/error states, icon per link,
admin role.

**Partial / deliberately out of scope in this build:**

- **Hindi & Kannada**: architecture is in place (locale switch, `t()` lookup);
  only key marketing/public strings are translated. English is complete.
- **Billing**: Pro plan is presented but no payment gateway is connected; nothing
  is charged. The pricing page says so plainly.
- **Password reset email**: the forgot-password screen exists and tells the
  truth — email delivery is not configured, so no mail is sent.
- **Custom domains, email newsletters, native apps, AI tools, NFC, brand-deal
  marketplace**: out of phase-1 scope (see the `could`/`skip` rows in the matrix).

## Security notes

- Passwords are hashed with **scrypt** (N=16384, r=8, p=1) and a random salt.
  Session tokens are random 32-byte values; only their **sha256 hash** is stored.
  The session cookie is `httpOnly`, `SameSite=Lax`, and `Secure` in production.
- **Tenant isolation is enforced in the data layer** (every query is scoped by
  the caller's `tenant_id` from the session) and is covered by tests. Postgres
  **RLS** is applied as defence-in-depth — see the note in
  [`replica/architecture.md`](./replica/architecture.md) about connecting as a
  non-owner role in production.
- ⚠️ **Pre-existing file:** the repository already contained a root
  `.env.example` (from an unrelated static site) that appears to hold **real
  Supabase keys**. It was left untouched, but those keys should be **rotated**
  and the file removed from version control.

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for a production checklist: Postgres,
environment variables, building, running behind a proxy, enabling RLS as a
non-owner role, and the remaining production requirements.

---

_This is a demonstration product. Branding, copy and assets are original. Names
in sample data are fictional._
