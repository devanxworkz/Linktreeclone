-- Pehchaan RLS — see replica/002_rls.sql for the annotated version.
create or replace function current_app_user()
returns uuid language sql stable as $$
  select nullif(current_setting('app.user_id', true), '')::uuid
$$;

create or replace function current_app_tenant()
returns uuid language sql stable as $$
  select t.id from tenants t where t.owner_user_id = current_app_user()
$$;

alter table users      enable row level security;
alter table tenants    enable row level security;
alter table profiles   enable row level security;
alter table links      enable row level security;
alter table products   enable row level security;
alter table sessions   enable row level security;
alter table page_views enable row level security;

drop policy if exists users_self on users;
create policy users_self on users
  using (id = current_app_user())
  with check (id = current_app_user());

drop policy if exists tenants_owner on tenants;
create policy tenants_owner on tenants
  using (owner_user_id = current_app_user())
  with check (owner_user_id = current_app_user());

drop policy if exists profiles_owner on profiles;
create policy profiles_owner on profiles
  using (tenant_id = current_app_tenant())
  with check (tenant_id = current_app_tenant());

drop policy if exists profiles_public_read on profiles;
create policy profiles_public_read on profiles
  for select using (is_published = true);

drop policy if exists links_owner on links;
create policy links_owner on links
  using (tenant_id = current_app_tenant())
  with check (tenant_id = current_app_tenant());

drop policy if exists products_owner on products;
create policy products_owner on products
  using (tenant_id = current_app_tenant())
  with check (tenant_id = current_app_tenant());

drop policy if exists sessions_owner on sessions;
create policy sessions_owner on sessions
  using (user_id = current_app_user())
  with check (user_id = current_app_user());

drop policy if exists page_views_owner on page_views;
create policy page_views_owner on page_views
  using (tenant_id = current_app_tenant())
  with check (tenant_id = current_app_tenant());

create or replace view public_pages
  with (security_invoker = false) as
select
  p.username, p.display_name, p.bio, p.avatar_url,
  p.whatsapp_number, p.upi_id, p.upi_qr_url,
  p.meta_title, p.meta_description, p.theme, p.tenant_id
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
