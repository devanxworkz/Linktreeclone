# Pehchaan — component specs

Built as React primitives (`web/src/components/ui/`) from the tokens in
`tokens.json`. No raw hex or pixel values in screens — everything maps to a
token. Every interactive control is a real element (`button`, `a`, `input`,
`label`) with a visible focus ring and keyboard support.

Naming: `bg` `surface` `border` `borderInput` `text` `textMuted` `accent`
`accentSoft` `onAccent` `danger` `success` `warning`. Radii `sm/md/lg/full`.

---

## Button
- variants: `primary` (bg accent / text onAccent), `secondary` (bg surface / border / text), `ghost` (transparent / text), `danger` (bg danger / text onDanger)
- sizes: `sm` 32px, `md` 40px, `lg` 48px; horizontal padding 12/16/20
- radius `md`; font `sm`/600 (md uses `base`/600)
- states: default, hover (slight darken / surface tint), active, focus-visible (2px accent ring, offset 2), disabled (opacity 50, not-allowed), loading (spinner + label kept for screen readers via `aria-busy`)
- a11y: renders `<button type>`; icon-only needs `aria-label`; loading disables clicks
- used on: all

## Input / Textarea
- height 40 (input), radius `md`, bg `elevated`, border `borderInput`
- focus: border accent + 2px accent ring
- states: default, focus, filled, error (border danger + message `role=alert`), disabled, readonly
- a11y: always paired with a `<label for>`; `aria-invalid` + `aria-describedby` on error
- used on: S04–S11, S15

## Field
- label (font `sm`/600), optional hint (`textMuted`), error slot
- used to wrap every Input/Textarea/Select

## Select
- same chrome as Input; native `<select>` for full keyboard + mobile support
- used on: S08 (layout), S09 (icon), S11 (theme/layout)

## Card
- bg `elevated`, border `border`, radius `lg`, shadow `card`, padding 16–24
- variants: `linkRow` (draggable), `product`, `stat`, `plan`
- states: default, hover (border accent-ish), dragging (shadow `pop`)
- used on: S07–S16

## LinkRow
- left: drag handle (grip icon) + icon; middle: title + URL host; right: active Toggle, edit, delete
- states: default, dragging, inactive (opacity `.6`), saving
- a11y: drag handle is a button with `aria-label="Reorder"`; keyboard reorder via up/down buttons; move announced in a live region
- used on: S09

## ProductForm  **ProductCard**
- form: image URL, title, description, `price` (₹, stored paise), destination URL, active
- card (grid): image, title, price or "Enquire", description clamp, CTA
- states: default, hover, no price (shows "Contact to buy"), broken image (initials/placeholder)
- used on: S10, S13

## Dialog / ConfirmDialog
- overlay `rgba(26,22,19,.45)`, panel radius `lg` shadow `pop`, max-width 440
- traps focus, closes on Esc and overlay click, returns focus to opener
- used on: S09, S10, S17

## Toast
- region `aria-live="polite"`, bottom-right (desktop) / top (mobile)
- variants: success (`success`), error (`danger`), info (`info`); auto-dismiss 4s, dismiss button
- used on: all dashboard

## Sidebar + Topbar (app shell)
- sidebar 248px: brand, nav items (Overview, Profile, Links, Products, Appearance, Preview, Account), active item `accentSoft` + `accent` text
- `<aside>` + `<nav aria-label="Dashboard">`; mobile: off-canvas drawer with focus trap
- topbar 64px: page title, right side user menu (email, log out); Admin link only for admins
- used on: S07–S17

## Toggle
- real `<button role="switch" aria-checked>`; states on/off/disabled/busy (busy shows spinner, `aria-busy`)
- used on: S09 (link active), S12 (publish), S15 (suspend)

## Badge
- role (`admin` info, `creator` muted), status (`active` success, `suspended` danger)
- used on: S15

## EmptyState
- icon, title, one-line hint, primary action
- used on: S07, S09, S10, S14

## Skeleton
- line + card shapes, `animate-pulse`, `aria-hidden`; container `aria-busy=true`
- used as the loading state on S07–S11, S15

## StatCard
- big number (font `xl`), label (`textMuted`), optional delta (success/danger)
- loading shows skeleton; zero shows `0` not blank
- used on: S07, S14

## PublicLinkButton
- full-width pill, centered label, optional leading icon; bg `elevated` border, hover lifts
- social links (recognised platform) are excluded here and move to `SocialRow`
- used on: S13

## SocialRow
- centred, wrapping row of 40px round icon buttons: Instagram, LinkedIn, Facebook, TikTok, YouTube, X, WhatsApp, website
- platform resolved from the link's icon or its host; `aria-label` + `title` name the network; opens in a new tab (`rel="noreferrer noopener"`)
- circle tinted from a contrast-checked theme accent (`--soc`), subtle hover/focus lift; omitted entirely when there are no social links
- used on: S13

## UpiBlock
- shows UPI id (copyable) and optional QR image
- copy says "Pay with any UPI app" — never "paid" or a success tick; no state recorded
- used on: S13

## WhatsAppButton
- fixed brand green `#25D366` (utility colour, not a brand token) with white glyph; deep-links to `wa.me`
- `aria-label="Chat on WhatsApp"`; hidden when no number set
- used on: S13

## Avatar
- image or initials on `accentSoft`; broken image falls back to initials
- used on: S07, S08, S13

## PageHeader / Breadcrumb
- title + subtitle + actions; used with the shell
