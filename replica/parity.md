# Feature parity: Pehchaan vs the link-in-bio category

Build: local  Date: 2026-10-17  Env: PGlite, seed data

> Parity means the clone does the same job, not that it looks the same. Score is weighted must=3, should=2, could=1; partial counts half; skip rows excluded.

## Parity: 96.4 / 100

features 96.4  (36 counted, must-haves 27 of 27 done)

## By area, weakest first
- custom domains                 0.0  (1 features)
- email                          0.0  (1 features)
- a11y                          50.0  (1 features)
- payments                      50.0  (1 features)
- auth                         100.0  (3 features)
- tenancy                      100.0  (3 features)
- profile                      100.0  (2 features)
- links                        100.0  (3 features)
- products                     100.0  (1 features)
- appearance                   100.0  (1 features)
- publishing                   100.0  (3 features)
- public page                  100.0  (4 features)
- india                        100.0  (3 features)
- admin                        100.0  (4 features)
- security                     100.0  (2 features)
- analytics                    100.0  (2 features)
- ux                           100.0  (1 features)

## Missing, in build order
- [should] a11y: Accessible keyboard navigation and labels, partial  (labelled controls and dialog focus trap; no automated axe audit yet)
- [could] custom domains: Custom domain per creator, no  (phase 2 - needs DNS and TLS)
- [could] email: Email newsletter to subscribers, no  (phase 2 - needs a mail provider)
- [could] payments: Paid plans and billing, partial  (pricing UI present no payment gateway connected)

## Left out on purpose (not scored)
- Media kit and brand-deal tools: depends on social APIs and a partner network
- AI content assistant: proprietary model and data moat
- Native iOS and Android apps: out of phase-1 scope
- Beam AI teammate: not rebuildable without their model and data
- Brand deal marketplace and W-9 forms: partner regulated and region specific
- Google Workspace integration: third-party licensed product
- NFC card hardware: physical hardware

## Yours, not in the original (not scored)
- Hindi and Kannada translations
- Six ready-made storefront templates with a full live appearance editor
  (background, avatar, typography, buttons, product layout, sections), where the
  original exposes a single theme picker plus an accent
