# Recon map: Beacons.ai (web, mobile-first)

Scope: the link-in-bio core loop — a creator signs up, builds a public
"link in bio" page (profile, links, products), and shares one URL. Plus the
Indian-market adaptations the build needs (WhatsApp, UPI, INR).
For: an original multi-tenant SaaS for Indian creators, influencers,
freelancers and Instagram shop owners. Working name: **Pehchaan**.
Date: 2026-10-17

Rebuild policy: clean room. This map records **functionality and UX patterns**
from public pages only (marketing site, help centre, product FAQ, pricing).
No source code, bundles, private APIs, logos, icons, fonts, copy or assets
were copied. Every screen below is re-implemented from scratch with original
labels and an original design system.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | marketing site | https://beacons.ai/ | positioning, core loop, feature areas, Beam AI |
| 2 | help centre: what is Beacons | https://help.beacons.ai/en/articles/4806401 | full tool list: link in bio, socials, monetization, email, store, analytics, website builder |
| 3 | help centre: pricing plans | https://help.beacons.ai/en/articles/6458175-beacons-pricing-plans | which features are gated (free / Creator Pro $10 / Store Pro $30 / Business Pro $90) |
| 4 | help centre: product FAQ | https://help.beacons.ai/en/articles/6932632-product-faqs | link blocks, signup block, audience manager, media kit |
| 5 | help centre: set up your store | https://help.beacons.ai/en/articles/4699393 | product fields: files, thumbnail, description, custom CTA, checkout, confirm email |
| 6 | help centre: email marketing | https://help.beacons.ai/en/articles/4703169 | broadcast vs automation, templates, scheduling |
| 7 | help centre: media kit | https://help.beacons.ai/en/articles/4703937 | auto-updating social stats, brand pitch |
| 8 | blog: Beacons 2.0 | https://beacons.ai/i/blog/announcing-beacons-2-0 | platform structure: LiB + Store + Email + Media Kit |

Machine fetch of the marketing pages returns HTTP 403 (bot protection); the
search index excerpts of those same public pages were used instead, plus the
public help centre. No login or private system was accessed.

## Core loop

A creator signs up, fills a profile, stacks blocks (links, products, socials)
on a public page, publishes it, and shares one URL everywhere.

## Screens

IDs are stable and referenced by the build.

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Marketing home | `/` | convert visitor to sign-up | hero, feature grid, examples, pricing teaser, chat/CTA, footer | desktop, mobile, scrolled nav |
| S02 | Pricing | `/pricing` | explain plans, drive upgrade | plan cards, monthly/yearly toggle, FAQ | toggle on/off |
| S03 | Features | `/features` | explain each tool area | sectioned feature list, screenshots | desktop, mobile |
| S04 | Sign up | `/register` | create account | email+password form, social buttons (out of scope), terms checkbox | empty, invalid, submitting, error, success |
| S05 | Log in | `/login` | return to dashboard | email+password, "forgot" link | empty, invalid, error |
| S06 | Forgot password | `/forgot` | reset flow entry | email form | empty, sent |
| S07 | Dashboard overview | `/dashboard` | page status + quick actions | stat cards (views, clicks), publish state, copy-URL, checklist | empty (new), loading, published, unpublished |
| S08 | Profile editor | `/dashboard/profile` | identity + public meta | avatar, name, bio, username, WhatsApp, UPI, meta fields | empty, saving, success, error, username taken |
| S09 | Links manager | `/dashboard/links` | CRUD + reorder links | list, drag handle, row form, add dialog, toggle active | empty, one, many, reordering, delete confirm |
| S10 | Products / services | `/dashboard/products` | sell or showcase | product cards, create/edit form (image, title, desc, price, URL), reorder | empty, filled, uploading, delete confirm |
| S11 | Appearance / theme | `/dashboard/appearance` | colours + layout | theme picker, colour inputs, layout select, live mini-preview | blank theme, selected |
| S12 | Preview + publish | `/dashboard/preview` | see page as visitors do | device frame, publish/unpublish, copy URL, share | published, unpublished, copying |
| S13 | Public creator page | `/u/{username}` | the product | avatar, name, bio, social row, link buttons, product cards, WhatsApp, UPI, share meta | published, unpublished (404), unknown user (404), mobile, long content, no links |
| S14 | Admin overview | `/admin` | platform health | metrics (users, tenants, pages, views), recent signups | empty, populated |
| S15 | Admin users/tenants | `/admin/users` | moderate | searchable table, suspend/unsuspend, role badge | empty, filtered, suspended |
| S16 | Admin stats | `/admin/stats` | usage | charts/tables of views per tenant | empty, populated |
| S17 | Account / settings | `/dashboard/account` | security | change password, delete account (danger) | default, confirm |
| S18 | 404 / error | any bad route | graceful failure | message, back link | 404, 500 |
| S19 | Legal pages | `/privacy`, `/terms` | compliance | long-form text | desktop, mobile |

## Flows

Clicks counted on the happy path.

```
F01 New creator publishes a page
    S01 -> S04 -> S07 (first-run checklist) -> S08 -> S09 -> S12 -> S13
    happy path clicks: ~9 (excluding typing)
    edge: username taken, invalid email, duplicate submit, refresh mid-flow,
          session expired, very long bio, emoji in name

F02 Returning creator edits links
    S05 -> S09 -> S12
    edge: reorder persistence, delete last link (empty state), inactive link
          hidden on public page, two tabs editing at once

F03 Visitor views a creator page
    external link -> S13
    edge: page unpublished (404), unknown username (404), no links yet,
          product with price but no image, WhatsApp number missing, mobile

F04 Creator adds a product
    S10 -> create form -> S13 (if published)
    edge: price empty (showcase only), non-URL destination, huge image,
          duplicate title, reorder

F05 Creator changes theme
    S11 -> S12 -> S13
    edge: low-contrast custom colour chosen, layout switch keeps content

F06 Admin suspends a creator
    S05 (as admin) -> S14 -> S15 -> suspend -> S13 now unavailable
    edge: admin cannot suspend self, non-admin gets 403/404

F07 Creator checks views
    S07 -> S16 (self scoped)
    edge: zero views (empty state)

F08 Tenant isolation probe (adversarial)
    user B changes an id/URL/body to reach user A's data
    edge: must always be 404/403, never A's rows
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Button | primary, secondary, ghost, danger | default, hover, active, focus-visible, disabled, loading | all |
| Input / Textarea | text, url, number, search | default, focus, filled, error, disabled | S04-S11, S15 |
| Field + label | with hint, with error | default, error | S04-S11 |
| Card | link row, product, stat, plan | default, hover, dragging | S07-S16 |
| Link button block | default, active, inactive | default, hover, focus | S09, S13 |
| Product card | grid, feature | default, hover, no-price | S10, S13 |
| Dialog / confirm | add, edit, delete | open, submitting, error | S09, S10, S17 |
| Toast | success, error, info | entering, leaving | all dashboard |
| Sidebar nav | expanded, collapsed, mobile | default, active item, mobile overlay | S07-S17 |
| Top bar | with page title, with user menu | default | S07-S17 |
| Stat card | metric, delta | default, loading | S07, S14 |
| Empty state | icon, title, hint, action | default | S07, S09, S10, S14 |
| Skeleton | line, card | loading | S07-S11 |
| Badge | role, status | active, suspended | S15 |
| Toggle | publish, active link | on, off, disabled, busy | S09, S12, S15 |
| Avatar | image, initials | default, broken image | S07, S08, S13 |
| QR block | UPI QR image | default, placeholder | S13 |
| Pagination / table | users, products | default, empty, loading | S15, S16 |

## Inferred data model

```
User       id, email (unique), password_hash, role (creator|admin),
           status (active|suspended), created_at
           evidence: S04/S05 auth, S15 role/status badges, F06
           confidence: high

Tenant     id, owner_user_id -> User, name, created_at
           (a workspace; the ownership boundary for isolation)
           evidence: multi-account/manager model in "Beacons 2.0" blog,
                     "5 Link in Bio Pages" on paid plans
           confidence: medium (Beacons has pages; we model the boundary as a tenant)

Profile    id, tenant_id -> Tenant (one), username (unique, validated),
           display_name, bio, avatar_url, whatsapp_number, upi_id, upi_qr_url,
           is_published, theme (jsonb), meta_title, meta_description
           evidence: S08, S13, Page Customization in pricing
           confidence: high

Link       id, tenant_id -> Tenant, title, url, icon, position, is_active
           evidence: S09, "Blocks for everything" on LiB page
           confidence: high

Product    id, tenant_id -> Tenant, title, description, image_url,
           price_paise (int), currency, destination_url, position, is_active
           evidence: S10, store setup help article (thumbnail, price, CTA)
           confidence: high

Session    id, user_id -> User, token_hash, expires_at, created_at
           evidence: persistent login across S05 -> S07
           confidence: high

PageView   id, tenant_id -> Tenant, path, referrer, created_at
           evidence: "Advanced Analytics: real-time tracking" in pricing, S16
           confidence: medium (we keep only aggregate counts)

Audience   (email/phone subscribers) — Beacons "Audience Manager"
           evidence: product FAQ signup block
           confidence: medium — OUT OF SCOPE for phase 1 (see below)
```

Relationships: `User 1-1 Tenant (initial) · Tenant 1-1 Profile · Tenant 1-n Link ·
Tenant 1-n Product · Tenant 1-n PageView · User 1-n Session`.
Ownership boundary for every private resource is `tenant_id`.

## Feature matrix

See `features.csv`. Must: 22, should: 9, could: 6, skip: 6.

## Out of scope (cannot or should not be cloned)

- **Beam AI / AI tools** — depends on proprietary models and a large data
  moat; skip. A single "write my bio" helper could be added later behind an
  API key, but not in phase 1.
- **Brand-deal marketplace, media kit statistics from social APIs, W-9/IRS
  forms, Google Workspace** — partner/regulated/region-specific; skip.
- **Payments/checkout with Stripe+PayPal and 0% fee economics** — phase 2
  (architecture prepared, not built). UPI in India is a link/QR, never
  presented as a confirmed payment.
- **Custom domains + TLS** — needs registrar/DNS integration; phase 2. Phase 1
  is `/u/{username}`.
- **Email marketing / newsletter sending** — needs a transactional provider;
  phase 2. We store nothing that implies deliverability in phase 1.
- **Native iOS/Android apps and NFC cards** — hardware/app-store scope; skip.
- **Their content**: logos, brand colour, copy, icons, illustrations, fonts,
  the `beacons.ai` domain and user data. Never taken.

## Size

Screens 19, flows 8, entities 7. Hard parts: **tenant isolation done right**,
**publish/unpublish semantics with public caching**, **username uniqueness
under race**, and the **India-specific UPI/WhatsApp** surface without implying
verified payments. Size: **M** (a few weeks for one engineer) for the phase-1
slice; the full Beacons surface would be L/XL and is deliberately rescoped.
