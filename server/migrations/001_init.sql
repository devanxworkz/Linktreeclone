-- Pehchaan schema — see replica/schema.sql for the annotated version.
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  email_lower   text generated always as (lower(email)) stored,
  password_hash text not null,
  role          text not null default 'creator' check (role in ('creator','admin')),
  status        text not null default 'active' check (status in ('active','suspended')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index if not exists users_email_lower_key on users (email_lower);
create index if not exists users_role_idx on users (role);

drop trigger if exists users_updated_at on users;
create trigger users_updated_at before update on users
  for each row execute function set_updated_at();

create table if not exists tenants (
  id            uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references users(id) on delete cascade,
  name          text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists tenants_owner_idx on tenants (owner_user_id);

drop trigger if exists tenants_updated_at on tenants;
create trigger tenants_updated_at before update on tenants
  for each row execute function set_updated_at();

create table if not exists profiles (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null unique references tenants(id) on delete cascade,
  username         text not null,
  username_lower   text generated always as (lower(username)) stored,
  display_name     text not null,
  bio              text not null default '',
  avatar_url       text,
  whatsapp_number  text,
  upi_id           text,
  upi_qr_url       text,
  meta_title       text,
  meta_description text,
  theme            jsonb not null default '{"themeKey":"saffron","layout":"classic","accent":"#e8590c"}'::jsonb,
  is_published     boolean not null default false,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint profiles_username_format
    check (username ~ '^[a-z0-9](?:[a-z0-9_-]{1,28}[a-z0-9])$'),
  constraint profiles_username_reserved
    check (lower(username) not in
      ('admin','administrator','api','login','register','dashboard','u',
       'support','help','about','pricing','features','terms','privacy',
       'forgot','settings','root','www','null','undefined'))
);
create unique index if not exists profiles_username_lower_key on profiles (username_lower);
create index if not exists profiles_published_idx on profiles (is_published) where is_published = true;

drop trigger if exists profiles_updated_at on profiles;
create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

create table if not exists links (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references tenants(id) on delete cascade,
  title      text not null,
  url        text not null,
  icon       text not null default 'link',
  position   integer not null default 0,
  is_active  boolean not null default true,
  click_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists links_tenant_position_idx on links (tenant_id, position);
create index if not exists links_tenant_active_idx on links (tenant_id, is_active);

drop trigger if exists links_updated_at on links;
create trigger links_updated_at before update on links
  for each row execute function set_updated_at();

create table if not exists products (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  title           text not null,
  description     text not null default '',
  image_url       text,
  price_paise     integer check (price_paise is null or price_paise >= 0),
  currency        text not null default 'INR',
  destination_url text not null,
  position        integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists products_tenant_position_idx on products (tenant_id, position);

drop trigger if exists products_updated_at on products;
create trigger products_updated_at before update on products
  for each row execute function set_updated_at();

create table if not exists sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  user_agent text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists sessions_user_idx on sessions (user_id);
create index if not exists sessions_expires_idx on sessions (expires_at);

create table if not exists page_views (
  id         bigserial primary key,
  tenant_id  uuid not null references tenants(id) on delete cascade,
  path       text not null default '',
  referrer   text,
  created_at timestamptz not null default now()
);
create index if not exists page_views_tenant_created_idx on page_views (tenant_id, created_at desc);
