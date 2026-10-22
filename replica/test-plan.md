# Test plan: Pehchaan

Build: local  Date: 2026-10-17  Env: local, seed data (in-memory PGlite for automated runs)

Two automated layers:

- **API** — `npm test` (Vitest + supertest, `server/tests/*`), 47 tests, in-memory PGlite.
- **e2e** — `npm run test:e2e` (Playwright + Chromium, `e2e/*`), 19 tests, real browser against the built API + SPA on one origin.

`auto` values: `api` = covered by the Vitest suite, `e2e` = covered by Playwright, `manual` = walked by hand.
`result` reflects the last full run on this build: **47/47 API passed, 19/19 e2e passed.**

| case | flow | type | steps | expected | auto | result |
| --- | --- | --- | --- | --- | --- | --- |
| F01-H1 | register a creator | happy | open /register, fill name/username/email/password, submit | lands on /dashboard, session cookie set, profile + tenant created | api + e2e | pass |
| F01-N1 | register duplicate email | negative | register twice with the same email | 409, clear message, no second account | api | pass |
| F01-N2 | register duplicate username | negative | register two accounts with the same username | 409, message names the username field | api | pass |
| F01-N3 | register reserved/invalid username | negative | try `admin`, `a`, `bad name!` | 422 with a per-field message | api | pass |
| F01-E1 | register bad email/short password | edge | email `x`, password `123` | 422 with field messages, nothing created | api | pass |
| F02-H1 | log in / log out | happy | log in with valid creds; then log out | /dashboard, then session invalidated, back to /login | api + e2e | pass |
| F02-N1 | log in wrong password | negative | valid email, wrong password | 401 with a vague message (no user enumeration) | api | pass |
| F02-N2 | log in suspended account | negative | admin suspends, then user logs in | 403 “account suspended”; existing session killed | api | pass |
| F03-H1 | change password | happy | account page, correct current + new password | 204, other sessions signed out, new password works | api | pass |
| F03-N1 | change password wrong current | negative | wrong current password | 401, password unchanged | api | pass |
| F04-H1 | manage links | happy | add, edit, toggle active, reorder, delete | list updates and persists; public page reflects it | api + e2e | pass |
| F04-N1 | link with non-http URL | negative | URL `ftp://x` or `javascript:` | 422, rejected | api | pass |
| F04-E1 | reorder another tenant's links | edge (tenancy) | send ids mixing two tenants | 409/404, no cross-tenant change | api | pass |
| F05-H1 | manage products | happy | add product with ₹ price + URL, toggle, reorder, delete | persists; price stored in paise, shown as ₹ | api | pass |
| F05-E1 | product with no price | edge | leave price blank | saves with null price, shows “No price” | api | pass |
| F05-E2 | product form focus (BUG-012) | edge | click Description/Price/Image/URL and type with the keyboard | each field keeps its own text; focus stays in the clicked field | e2e | pass (regression for focus-steal bug) |
| F06-H1 | theme + layout | happy | pick a preset, layout, custom accent; save | saved; live preview matches; public page uses it | api | pass |
| F06-N1 | invalid accent colour | negative | accent `red` or `#12` | 422, rejected | api | pass |
| F06-H2 | storefront template + design | happy | pick a template, tune colours/font/layout/products/sections; save | design saved to `profiles.appearance`; editor preview repaints live (no reload); survives reload; public page matches | api + e2e | pass |
| F06-N2 | incomplete / invalid design | negative | send a partial document, bad hex, out-of-range size, unknown template | 422 validation_error; nothing saved | api | pass |
| F06-E1 | background image not http(s) | edge (security) | background image `javascript:alert(1)` | 422, rejected (only `http(s)` URLs accepted) | api | pass |
| F06-E2 | new creator has no saved design | edge | read `/api/profile` before saving | `appearance` is null; client falls back to template defaults | api | pass |
| F06-E3 | design is per-tenant | edge (tenancy) | two creators each save a different design | neither sees or inherits the other's design | api + e2e | pass |
| F06-E4 | public design exposure | happy | save a design, then publish | design appears on `/api/public/<user>` only when published; null when none saved | api + e2e | pass |
| F06-E5 | responsive public page | edge | 375px and 1280px viewports on the published page | renders with no horizontal overflow | e2e | pass |
| F11-H1 | social icons on the public page | happy | links to Instagram/LinkedIn/YouTube/TikTok/X/Facebook/WhatsApp/website | render as a centred row of round platform icons, correct href, `target=_blank` + `rel=noreferrer`, labelled; other links stay full-width buttons | e2e | pass |
| F11-E1 | platform detected from URL | edge | link saved before platform icons existed (generic icon, social host) | still renders as the right platform icon | e2e | pass |
| F11-E2 | icon opens in a new tab | happy | click a social icon | a new tab opens at the link's URL | e2e | pass |
| F11-N1 | no social links | edge | only generic links | no empty icon row is rendered | e2e | pass |
| F11-E3 | icon row wraps on mobile | edge | eight icons at 375px | row wraps to multiple lines, no horizontal overflow | e2e | pass |
| F07-H1 | publish and view public page | happy | toggle publish on; open /u/<username> | page reachable, shows profile/links/products | api + e2e | pass |
| F07-N1 | public page before publish | negative | request /u/<username> while draft | 404, “not available” state in the UI | api + e2e | pass |
| F07-E1 | unpublish again | edge | toggle publish off after being live | page hidden again (404) | api | pass |
| F07-E2 | unknown username | negative | open /u/does-not-exist | 404, not-available state | e2e | pass |
| F08-H1 | analytics recorded | happy | load public page; click a link | a page view row; link click_count increments | api | pass |
| F08-E1 | stats scoped to caller | edge (tenancy) | fetch /api/stats as tenant B | only tenant B's numbers | api | pass |
| F09-H1 | admin console | happy | admin views the overview | live KPIs, 14-day series and recent activity render from real data | api + e2e | pass |
| F09-N1 | creator hits admin endpoints | negative | creator calls /api/admin/* | 403 | api + e2e | pass |
| F09-H1b | admin suspends a user | happy | admin suspends a creator | status suspended, their session deleted, audit row written | api + e2e | pass |
| F09-N2 | admin suspends self | negative | admin suspends own id | 400 “cannot suspend your own account” | api | pass |
| F09-N3 | last-admin guard | negative | suspend the only remaining active admin | 400, refused | api | pass |
| F09-H2 | admin users filters + detail | happy | filter by role/status/page, search, open account detail | filtered paginated rows; detail shows tenant, profile and real counts | api | pass |
| F09-N4 | unknown user operations | negative | suspend / open detail for a random id | 404 | api | pass |
| F09-H3 | admin audit log | happy | suspend, then read /api/admin/audit (+ /actions) | entry with actor email, action and target; distinct actions listed | api + e2e | pass |
| F09-E1 | analytics + storefronts | edge | read /api/admin/analytics and /api/admin/storefronts | 30-day series, top storefronts and per-page counts from live data | api | pass |
| F12-H1 | admin RBAC route guard | negative | a signed-in creator opens /admin | redirected to /dashboard; console never renders | e2e | pass |
| F12-H2 | suspended target cannot sign in | negative | admin suspends a user, user tries to log in | 403 suspended; session already killed | api | pass |
| F10-H1 | marketing pages load | happy | open /, /features, /pricing, /privacy | each renders (hero, tables, legal) | e2e | pass |
| F10-E1 | deep link / SPA fallback | edge | hard-load a client route (e.g. /dashboard) | server returns the SPA, router renders | e2e | pass |
| T01 | tenant isolation (API) | tenancy | two creators; A tries to read/write/reorder B's links & products; read B's stats | every cross-tenant access 404 (never 403 or data) | api | pass |
| T02 | Postgres RLS | tenancy | switch to restricted `pehchaan_app` role, query with/without `app.user_id` | only own rows visible; owner bypass proven | api | pass |
| A01 | a11y basics | a11y | keyboard-only walk of dashboard + dialog focus trap + labelled controls | reachable and labelled | manual | pass (partial — no automated axe run) |

## Coverage notes

- Multi-tenant isolation is the security-critical path and is tested three ways:
  service scoping (F04/F05/F08/T01), admin/viewer role separation (F09), and raw
  Postgres RLS (T02).
- The e2e suite exercises the real production wiring: `npm run test:e2e` builds
  both apps and serves the compiled API + built SPA from a single origin.
- Not yet covered automatically: an axe/Lighthouse accessibility audit, visual
  regression, and load/perf testing. These are listed in `DEPLOYMENT.md`.
