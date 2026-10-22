# Build log: Pehchaan

A chronological record of how this build was made, the decisions behind it, and
the evidence that each phase worked. Companion docs: `recon.md`, `features.csv`,
`schema.sql`, `002_rls.sql`, `architecture.md`, `design/`, `test-plan.md`,
`bugs.md`, `parity.md`.

Product: **Pehchaan** — a multi-tenant link-in-bio SaaS for Indian creators.
Working name; chosen for meaning (“identity”, पहचान / ಗುರುತು) and originality.

---

## Phase 0 — Ground rules

- Original work only: no code, copy, assets or trademarks from any other
  product. The category (link-in-bio) is the inspiration, not a specific app's
  implementation.
- The existing static site in the repo root (`index.html`, `css/`, `js/`, …) is
  **left untouched**; Pehchaan is a separate workspace (`server/`, `web/`).
- Constraints discovered and honoured: no Docker, no local Postgres, no `psql`,
  Python available as `python` (not `python3`), Node 20 / npm 10.

## Phase 1 — Recon & plan

- `recon.md` — screens, flows, inferred data model, feature matrix for the
  category.
- `features.csv` — 43 rows tagged must / should / could / skip with a `clone`
  column used later for the parity score.
- `architecture.md` — chosen stack and the reasoning.
- `schema.sql` + `002_rls.sql` — the data model with indexes, uniqueness and RLS
  policies; kept in sync with `server/migrations/`.
- `design/tokens.json` + `design/components.md` — colour roles, type scale,
  spacing, radius, shadows and component states. Contrast checked with the
  design skill's `contrast.py`: **15 pairs, 0 AA failures.**

**Key decisions**

- Web: React 18 + TypeScript + Vite + Tailwind. API: Node 20 + TypeScript +
  Express. Boring, easy to host, small dependency surface.
- Database: **PGlite** locally (embedded Postgres/WASM) and **Postgres** in prod
  — identical SQL, so no local server is needed and prod is a one-variable switch.
- Auth: first-party. scrypt password hashing; random session tokens stored only
  as sha256 hashes; httpOnly SameSite cookie. No third-party auth dependency.
- Multi-tenancy: one tenant per creator. **Isolation enforced in the data
  layer** (every query scoped by the session's `tenant_id`), with RLS as
  defence-in-depth. Cross-tenant ids return **404**, never 403 or data.
- India-first: WhatsApp deep links, UPI as a link/QR only (never shown as a
  confirmed payment), money in **paise** (integer), times in `timestamptz`,
  rupees via `Intl` `en-IN`.

## Phase 2 — Scaffolding

- npm workspaces at the root: `server`, `web`. Root scripts orchestrate
  dev/build/start/migrate/seed/test/test:e2e/typecheck.
- Server: Express app factory (`createApp`) that mounts `/api/*` and, in
  production, serves the built SPA from `web/dist` — one origin, no CORS needed.
- Web: Vite + Tailwind with design tokens wired as CSS variables.

## Phase 3 — API, database, tests

Implemented in order: config → db adapter (PGlite/pg) → migrations → seed →
auth (password/tokens) → http helpers → middleware (auth/error) → Zod schemas →
services (account, sessions, profile, links, products, analytics) → routes
(auth, profile, links, products, stats, admin, public).

**Verification**

- `npm --workspace server run migrate` → applied `001_init.sql`, `002_rls.sql`.
- `npm --workspace server run seed` → demo creators `/u/aarti`, `/u/cafe-mocha`
  (admin skipped without `ADMIN_EMAIL`).
- `npm test` → **31 tests passing** across auth, isolation, public page,
  validation, admin, and RLS (`SET ROLE pehchaan_app` proofs).

Bugs found and fixed in this phase are logged in `bugs.md` (BUG-001 … BUG-006).

## Phase 4–5 — Web app

- Foundations: `styles/tokens.css`, `styles/index.css`, `lib/api.ts` (typed
  fetch client with `ApiError` + field errors), `lib/format.ts` (INR, WhatsApp,
  UPI, numbers), `lib/i18n.ts`, `lib/theme.ts`, `lib/useAsync.ts`, and
  `components/ui.tsx` (Button, Input, Field, Card, Badge, Toggle, Dialog,
  Spinner, Skeleton, EmptyState, StatCard, Avatar).
- Providers: `I18nProvider`, `ToastProvider`, `AuthProvider`.
- Marketing: Landing, Features, Pricing, and a shared StaticPage for
  about/contact/privacy/terms, inside `MarketingLayout` (nav + footer + locale
  switch).
- Auth: Login, Register (live username slug + per-field errors), ForgotPassword
  (honest about no mail transport).
- Dashboard: Overview (stats + 14-day bar chart + publish/copy), ProfileEditor
  (profile + username + meta), LinksManager and ProductsManager (CRUD, reorder,
  active toggle, dialogs), Appearance (theme/layout/accent with live preview),
  PreviewPublish (full public-frame preview + publish), Account (password change,
  language, logout).
- Admin: Overview, Users (search + pagination + suspend/reactivate), Usage.
- Public: a shared `PublicView` renders the creator page (classic/grid/feature
  layouts, WhatsApp, UPI + QR, products, share metadata); `PublicPage` loads
  `/api/public/:username`, records a single view, tracks link clicks, and shows
  a clean not-available state on 404.

**Verification**

- `npm --workspace web run typecheck` → clean.
- `npm --workspace web run build` → `dist` built (JS ≈ 265 kB / 79 kB gzip).
- Bugs fixed here: BUG-007 … BUG-010 in `bugs.md`.

## Phase 6 — Integration & end-to-end

**Smoke test (built artifacts, one origin):**

- `GET /api/health` → `{"ok":true}`.
- `GET /` → 200, SPA served by the API.
- `GET /api/public/aarti` → seeded page with links + products.
- register → 201; public page **404 before publish → 200 after publish**;
  `GET /api/links` without a session → 401.

**Playwright e2e** (`e2e/happy-path.spec.ts`, Chromium):

1. landing hero + CTAs
2. pricing + privacy pages
3. register → add link → publish → public page shows the link
4. log out → log back in
5. unknown creator page shows the not-available state

- `npm run test:e2e` → **5 passed**.

BUG-011 (loose locators) was a test-only fix.

## Phase 7 — Parity & docs

- Filled the `clone` column of `features.csv` and ran the diff skill's
  `parity.py`: **96.4 / 100, all 27 must-haves done.** Remaining gaps are
  non-must and intentional (custom domains, email newsletter, billing gateway,
  full a11y audit). Output saved to `parity.md`.
- Wrote `README.md` (setup, env, commands, structure, testing, status, security),
  `DEPLOYMENT.md` (host, Postgres, RLS as a non-owner role, remaining production
  requirements), `test-plan.md`, `bugs.md`, and this log.

## Phase 8 — Storefront design upgrade (templates + appearance editor)

Goal: make the public creator page genuinely customisable (not just a theme
preset) with six original templates, a live editor and server persistence.

- **Data.** `003_appearance.sql` adds a nullable `profiles.appearance jsonb` and
  re-creates the `public_pages` view with `p.appearance` appended (new column at
  the end so `create or replace view` keeps existing columns). Nullable so
  accounts created earlier keep working; the client falls back to template
  defaults on read. `appearanceSchema` in `server/src/validation/schemas.ts` is
  the source of truth and mirrors `web/src/lib/appearance.ts`.
- **API.** `PUT /api/profile/appearance` (auth required) validates and stores the
  document; `toProfileDto` and `getPublicPage` expose it. Extra keys are stripped,
  out-of-range values and non-hex colours are rejected with 422, and a background
  image must be an `http(s)` URL (no `javascript:` / `data:`).
- **Design system.** `web/src/lib/appearance.ts` defines six templates
  (Minimal Luxe, Midnight Pro, Soft Pastel, Editorial Fashion, Vibrant Creator,
  Indian Boutique), a `Appearance` document (background, avatar, typography,
  button, products, section), font stacks, `normalizeAppearance()` and contrast
  helpers (`ensureContrast*`, `readableOn`, `withAlpha`) so text stays AA against
  whatever the creator picks.
- **Renderer.** `PublicView.tsx` was rebuilt template-first: centred header,
  larger consistent product images (list/grid, 1:1 / 3:4 / 4:3), card styles,
  Buy/View actions, a WhatsApp CTA and the UPI panel, with hover transitions and
  a global `prefers-reduced-motion` rule.
- **Editor.** `web/src/pages/dashboard/Appearance.tsx`: template gallery with
  visual thumbnails and `aria-pressed`, grouped controls, a sticky live preview
  badged "Editor preview" (not the published page), save + discard. Saving also
  writes the legacy theme row (themeKey, layout, accent) so the two stay coherent.
- **Bug found while building.** `ColorRow` used `useState`/`useEffect` but was
  called conditionally as a plain function, which would have changed hook order
  between renders. Fixed by making it a real component (`<ColorRow />`), so
  conditional mounting is safe.
- **Tests.** +9 API tests (`server/tests/appearance.test.ts`) and +4 e2e
  (`e2e/appearance.spec.ts`): live preview repaint without reload, persistence
  across reload, published page wearing the design at 375px/1280px with no
  horizontal overflow, and per-tenant isolation. Full run green:
  **40/40 API, 13/13 e2e**, typecheck and production build clean.

## Phase 9 — Social icon row on the public page

Goal: social links should read as a creator's presence row, not as five more
full-width buttons with domain names.

- **Detection.** `socialIconFor()` in `web/src/components/LinkIcon.tsx` resolves
  a platform from the link's `icon` first, then from its destination host
  (instagram.com, linkedin.com, facebook.com/fb.me, tiktok.com, youtube.com/
  youtu.be, x.com/twitter.com, wa.me/whatsapp.com). So a link saved before
  platform icons existed — or with the generic `link` icon — is still recognised.
- **New icons.** Added original stroke-style `IconLinkedin`, `IconFacebook` and
  `IconTiktok` to `icons.tsx` and to `ICON_KEYS`, so they are also selectable in
  the dashboard link editor. No third-party brand assets are used.
- **Renderer.** `PublicView.tsx` splits links into socials and everything else.
  Socials render as a centred, wrapping row of round icon buttons under the
  profile and the WhatsApp CTA; each is an `<a>` with `target="_blank"`,
  `rel="noreferrer noopener"`, an `aria-label` that names the platform (plus the
  creator's title), and a `title` tooltip. The other links keep the existing
  titled button treatment, and their domain text. Data and URLs are untouched —
  this is a render-only change.
- **Styling.** `.public-social-icon` in `styles/index.css` draws a 40px circle
  tinted with a contrast-checked accent (`--soc`, set by the renderer from the
  theme), with a subtle hover/focus lift. Respects the global reduced-motion rule.
- **Tests.** +4 e2e (`e2e/social-icons.spec.ts`) plus an updated happy-path
  assertion: correct hrefs and safe new-tab attributes for each platform, a real
  new-tab open, no empty row when there are no socials, and a wrapping row with
  no horizontal overflow at 375px. Full run green: **40/40 API, 17/17 e2e**,
  typecheck and production build clean.

---

## Phase 10 — Super Admin Panel (phase 1)

Goal: turn the thin three-screen admin area into a real, trustworthy platform
console — backed entirely by live data, with backend-enforced access control and
an audit trail. No placeholders, no invented figures.

- **Data.** `004_admin.sql` adds `users.last_login_at` and an append-only
  `admin_audit_log` (actor email snapshotted, target + jsonb metadata) with
  indexes on created time, actor and action.
- **Service.** New `server/src/services/admin.ts` holds every admin query:
  overview (totals, 7/30-day growth, a 14-day view series, recent signups),
  filtered/paginated users, one-account detail (tenant, profile and real counts),
  a status change that writes the audit row, the audit log with distinct actions,
  platform analytics (30-day series + top storefronts) and storefront listing.
  The old admin helpers were removed from `analytics.ts`, which now only records
  and reads creator analytics.
- **API.** `adminRouter` (guarded by `requireAuth` + `requireAdmin`) gained
  `/overview`, `/users` (q/status/role/published/page), `/users/:id`,
  `/users/:id/status` (now with an optional reason), `/storefronts`, `/analytics`,
  `/audit` and `/audit/actions`; `/stats` is kept as a storefront alias. The
  actor is always taken from the session, never the request body.
- **Guardrails.** An admin cannot change their own status, and the last active
  administrator cannot be suspended. Suspending kills the target's sessions
  immediately. There is no public admin registration; the first admin is
  bootstrapped from `ADMIN_EMAIL`/`ADMIN_PASSWORD` via the opt-in seed.
- **Frontend.** `AppShell` now carries the full eleven-item admin nav and an
  admin search that deep-links into Creators & Users. Rebuilt: Overview (live
  KPIs, 14-day bars, newest accounts, recent admin activity), Creators & Users
  (search + status/role/page filters, pagination, an account-detail dialog, and
  suspend/reactivate behind a confirmation dialog with a recorded reason). New:
  Storefronts, Analytics, Reports & Moderation (real suspended + draft queues),
  Plans & Billing (states plainly that no payment provider is connected), and
  Admin Roles & Audit Logs (administrator roster + searchable, filterable audit
  table). Explicit, honest "not switched on yet" panels stand in for Templates &
  Themes, Products & Content, Announcements and Settings — no fake buttons.
- **Tests.** `server/tests/admin.test.ts` grew to 11 tests (filters, detail,
  audit attribution, last-admin guard, storefront counts, analytics series, RBAC
  403s). New `e2e/admin.spec.ts` proves a creator cannot reach `/admin` and that
  an admin can sign in, suspend a creator and see the audited entry. `index.ts`
  gained an opt-in `SEED_ON_BOOT` used only by the e2e server. Full run green:
  **47/47 API, 19/19 e2e**, typecheck and production build clean.

---

## What worked well

- Deriving one SQL schema and running it on both PGlite (dev/test) and Postgres
  (prod) — no drift, no local server, fast tests.
- Putting tenant scoping in the data layer first, then proving it with tests and
  RLS — isolation was correct before any UI existed.
- A single-origin production shape (API serves the SPA) made the e2e tests test
  the real thing rather than a dev-only arrangement.

## What to be careful about

- **RLS is bypassed by the table-owner connection.** It is only a real second
  line of defence when running as a non-owner role with `app.user_id` set per
  request — see `DEPLOYMENT.md` §6. The application-layer scoping is what
  protects users today.
- **No billing, no email transport.** Both are presented honestly in the UI and
  listed as production requirements.
- **`tsx` does not typecheck.** BUG-007 was latent because tests run through
  `tsx`; always run `npm run typecheck` in CI.

## Honest status

Shippable as a functional local/demo product and a solid phase-1 codebase. Not
yet ready for real users until the items in `DEPLOYMENT.md` → *Remaining
production requirements* are done (billing, email, rate limiting, RLS role,
observability, legal).
