# Bug log: Pehchaan

Bugs found during the build and their status. Severity: S1 blocking, S2 major,
S3 minor, S4 cosmetic/test-only. Format follows the replica-test bug report.

---

### BUG-001: API would not start — PGlite could not create its data directory

- Severity: S1
- Flow / case: app-boot
- Screen: n/a (server)
- Build: early scaffold  Platform: Node 20, Windows

Steps
1. Start the API with the default `PGLITE_DATA_DIR=.data/pgdata`.
2. PGlite tries to create the database.

Expected: database initialises and migrations apply.
Actual: error — the parent directory `.data` did not exist.
Evidence: server startup crash; `server/src/db/index.ts`.
Suspected cause: PGlite creates its own files but not missing parent folders.
Status: fixed — `mkdirSync(recursive)` the data dir before opening PGlite.

---

### BUG-002: `:memory:` was treated as a real directory path

- Severity: S2
- Flow / case: automated tests
- Screen: n/a (server)
- Build: early scaffold

Steps
1. Set `PGLITE_DATA_DIR=:memory:` for ephemeral test databases.
2. Run the suite.

Expected: an in-memory database, nothing written to disk.
Actual: a folder named `:memory:` was created on disk.
Evidence: `server/src/db/index.ts`; stray `:memory:` directory.
Suspected cause: only one memory sentinel variant was checked.
Status: fixed — treat both `:memory:` and `memory://` as in-memory.

---

### BUG-003: Public page query selected a column that does not exist

- Severity: S1
- Flow / case: F07-H1 (view public page)
- Screen: public creator page
- Build: early server

Steps
1. Publish a creator and open their public page.

Expected: page returns profile + links + products.
Actual: 500 — `column "is_active" does not exist` (and other over-selects).
Evidence: `server/src/services/profile.ts` (`getPublicPage`); API tests.
Suspected cause: reusing the full mappers against the `public_*` views, which
expose only publish-safe columns.
Status: fixed — select exactly the view columns; map defensively.

---

### BUG-004: Publish route tested as PUT but implemented as POST

- Severity: S3
- Flow / case: F07-H1
- Screen: n/a (server)
- Build: early server

Steps
1. Call publish with the method the tests used.

Expected: 200 and the page toggles.
Actual: 404 (method not allowed) until the tests were corrected.
Evidence: `server/tests/public.test.ts`; `server/src/routes/profile.ts`.
Status: fixed — route is `POST /api/profile/publish`; tests aligned to it.

---

### BUG-005: Reserved username returned 500 instead of a clean 422

- Severity: S3
- Flow / case: F01-N3
- Screen: register
- Build: early server

Steps
1. Register with username `admin`.

Expected: 422 with a helpful message.
Actual: 500 (constraint violation surfaced as an internal error).
Evidence: `server/src/validation/schemas.ts`.
Suspected cause: reserved words were only enforced by a database constraint.
Status: fixed — a Zod `.refine()` rejects reserved usernames at the edge (422).

---

### BUG-006: `/api/auth/me` did not return the public URL

- Severity: S3
- Flow / case: F07
- Screen: dashboard
- Build: early server

Steps
1. Log in and read `/api/auth/me`.

Expected: the profile includes `publicUrl`.
Actual: missing, so the dashboard could not show/copy the link.
Evidence: `server/src/routes/auth.ts`.
Status: fixed — `/me` builds `publicUrl` from `PUBLIC_BASE_URL` + username.

---

### BUG-007: `npm run typecheck` failed on the scrypt wrapper

- Severity: S2 (typecheck only; runtime was fine)
- Flow / case: build gate
- Screen: n/a (server)
- Build: hardening pass

Steps
1. Run `npm --workspace server run typecheck`.

Expected: clean.
Actual: `Expected 3 arguments, but got 4` in `server/src/auth/password.ts`.
Evidence: `server/src/auth/password.ts`; `promisify(scrypt)`.
Suspected cause: `promisify` cannot infer the options overload of `scrypt`, so it
picked the overload without an options argument.
Status: fixed — typed the promisified function explicitly with `ScryptOptions`.
Note: tests run via `tsx` (no typecheck), which is why this was latent.

---

### BUG-008: Web screens used component props that did not exist

- Severity: S3
- Flow / case: dashboard + admin build
- Screen: Overview, admin pages
- Build: web build

Steps
1. Render `StatCard`/`EmptyState`/`Badge` with props from the summary.

Expected: components render.
Actual: typecheck errors — `StatCard` has no `icon`, `EmptyState` has no `body`,
`Badge` has no `warning` tone.
Evidence: `web/src/components/ui.tsx` vs page usage.
Status: fixed — aligned usage to the real component APIs.

---

### BUG-009: `formatNumber` was imported but never defined

- Severity: S3
- Flow / case: dashboard + admin build
- Screen: Overview, admin
- Build: web build

Steps
1. Run `npm --workspace web run typecheck`.

Expected: clean.
Actual: `Module '"../../lib/format"' has no exported member 'formatNumber'`.
Evidence: `web/src/lib/format.ts`.
Status: fixed — added `formatNumber` (Intl `en-IN` grouping).

---

### BUG-010: Data hook never refetched when its inputs changed

- Severity: S2 (would show stale data)
- Flow / case: F09-H1 (admin users search + pagination)
- Screen: Admin → Users
- Build: web build

Steps
1. Search or page through the admin users table.

Expected: results update for the new page/query.
Actual: the list stayed on the first result set — the fetch hook only ran once.
Evidence: `web/src/lib/useAsync.ts`; `web/src/pages/admin/AdminUsers.tsx`.
Suspected cause: the hook had no dependency support, so changing `page`/`query`
did not trigger a reload.
Status: fixed — `useAsync(fn, deps)` refetches when deps change; AdminUsers now
uses a committed query + page as deps.

---

### BUG-011: e2e locators were too loose (strict-mode violations)

- Severity: S4 (test-only)
- Flow / case: F07-H1, F02-H1
- Screen: Preview & publish, Account
- Build: e2e suite

Steps
1. Run the Playwright suite.

Expected: assertions target one element.
Actual: `getByText('Live')` matched the badge and the toast; `getByRole('button',
{ name: 'Log out' })` matched the sidebar and the account card.
Evidence: `e2e/happy-path.spec.ts`.
Status: fixed — scope locators (`{ exact: true }`, `getByRole('main')`). No app
change required.

---

### BUG-012: Dialog stole focus mid-typing — keystrokes landed in Title

- Severity: S1 (data-entry blocking)
- Flow / case: F05-H2 (add/edit product), F04-H2 (add/edit link)
- Screen: Products → Add/Edit product dialog; same `Dialog` used by Links
- Build: full app

Steps
1. Open Products → Add product (or Edit details).
2. Click **Description** (or Price / Image URL / Destination URL) and type.

Expected: text appears only in the field that was clicked.
Actual: the first keystroke shows in the clicked field, then focus jumps to
**Title**, and every subsequent character is typed into Title instead.

Evidence (Playwright, real keyboard input — `e2e/product-form-focus.spec.ts`):
- `document.activeElement.id` was `product-title` after typing into Description.
- Title ended up holding `s9/acogts.88` (tail of the URL typed into another field).
- Reproduced only with real keystrokes; an earlier test using `fill()` passed,
  because `fill()` sets the value programmatically and does not hold focus across
  re-renders — so it masked the bug.

Suspected cause: `Dialog`'s focus-trap effect in `web/src/components/ui.tsx` had
deps `[open, onClose]`. Every parent passes an inline `onClose={() => setDraft(null)}`
(new identity on each render). Since `setDraft` runs on **every keystroke**, the
parent re-rendered, the effect re-ran, and its `setTimeout` re-focused the **first
focusable input (Title)** — yanking focus away after each character.

Fix: keep the latest `onClose` in a ref (`onCloseRef`) and drop it from the effect
deps, so the trap only re-runs when `open` changes. The Escape handler reads
`onCloseRef.current`; the backdrop `onClick` still uses the prop directly.

Impact: fixes the Products dialog **and** the Links dialog (same `Dialog` +
inline `onClose` pattern). `web/src/components/ui.tsx` was the only source change.

Verification
- `npx playwright test product-form-focus` — 2 passed (was 2 failed before fix).
- `npx playwright test` — 9 passed (full suite).
- `npm run build` — web + server typecheck clean; Vite build OK.
- `npm test` — 31/31 server tests.
