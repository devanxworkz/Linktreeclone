-- ============================================================================
-- Pehchaan — Row Level Security (defence in depth, production)
--
-- The running application always also scopes queries by tenant_id in the data
-- layer (primary control). RLS is the second layer that holds even if a query
-- forgets its WHERE clause.
--
-- How the app connects in production:
--   * a non-superuser role `pehchaan_app` that is NOT the table owner and NOT
--     BYPASSRLS;
--   * per request, after authenticating the session cookie, run
--         select set_config('app.user_id', $1, true);   -- the authenticated user id
--   * public reads run with `app.user_id` unset (anonymous) and only see
--     published rows.
--
-- Helper functions read the setting; when unset they return null, and the
-- policies fall back to "public published only".
-- ============================================================================

create or replace function current_app_user()
returns uuid language sql stable as $$
  select nullif(current_setting('app.user_id', true), '')::uuid
$$;

create or replace function current_app_tenant()
returns uuid language sql stable as $$
  select t.id from tenants t where t.owner_user_id = current_app_user()
$$;

-- ---- enable RLS -----------------------------------------------------------
alter table users      enable row level security;
alter table tenants    enable row level security;
alter table profiles   enable row level security;
alter table links      enable row level security;
alter table products   enable row level security;
alter table sessions   enable row level security;
alter table page_views enable row level security;

-- ---- users: you may only see and edit yourself ---------------------------
drop policy if exists users_self on users;
create policy users_self on users
  using (id = current_app_user())
  with check (id = current_app_user());

-- ---- tenants: own workspace only ------------------------------------------
drop policy if exists tenants_owner on tenants;
create policy tenants_owner on tenants
  using (owner_user_id = current_app_user())
  with check (owner_user_id = current_app_user());

-- ---- profiles: owner, plus anonymous read of published -------------------
drop policy if exists profiles_owner on profiles;
create policy profiles_owner on profiles
  using (tenant_id = current_app_tenant())
  with check (tenant_id = current_app_tenant());

drop policy if exists profiles_public_read on profiles;
create policy profiles_public_read on profiles
  for select using (is_published = true);

-- ---- links: owner only (public page reads go through a scoped view) ------
drop policy if exists links_owner on links;
create policy links_owner on links
  using (tenant_id = current_app_tenant())
  with check (tenant_id = current_app_tenant());

-- ---- products: owner only ------------------------------------------------
drop policy if exists products_owner on products;
create policy products_owner on products
  using (tenant_id = current_app_tenant())
  with check (tenant_id = current_app_tenant());

-- ---- sessions: own sessions only -----------------------------------------
drop policy if exists sessions_owner on sessions;
create policy sessions_owner on sessions
  using (user_id = current_app_user())
  with check (user_id = current_app_user());

-- ---- page_views: own tenant only -----------------------------------------
drop policy if exists page_views_owner on page_views;
create policy page_views_owner on page_views
  using (tenant_id = current_app_tenant())
  with check (tenant_id = current_app_tenant());

-- ---- public, dependency-free read surface for the creator page ------------
-- security_invoker = false so the view owner's rights are used, exposing only
-- published page content and safe columns. This is what anonymous visitors
-- read; it never exposes email, hashes, sessions, or unpublished pages.
-- NOTE: 003_appearance.sql later re-creates this view to append p.appearance at
-- the end (new columns must be appended so CREATE OR REPLACE keeps existing ones).
create or replace view public_pages
  with (security_invoker = false) as
select
  p.username,
  p.display_name,
  p.bio,
  p.avatar_url,
  p.whatsapp_number,
  p.upi_id,
  p.upi_qr_url,
  p.meta_title,
  p.meta_description,
  p.theme,
  p.tenant_id
from profiles p
where p.is_published = true;

create or replace view public_links
  with (security_invoker = false) as
select l.tenant_id, l.id, l.title, l.url, l.icon, l.position
from links l
join profiles p on p.tenant_id = l.tenant_id
where p.is_published = true and l.is_active = true;

create or replace view public_products
  with (security_invoker = false) as
select pr.tenant_id, pr.id, pr.title, pr.description, pr.image_url,
       pr.price_paise, pr.currency, pr.destination_url, pr.position
from products pr
join profiles p on p.tenant_id = pr.tenant_id
where p.is_published = true and pr.is_active = true;
