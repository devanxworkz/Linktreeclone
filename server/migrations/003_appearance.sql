-- Pehchaan storefront design settings (templates + customisation).
-- The value is a jsonb document validated by appearanceSchema in
-- server/src/validation/schemas.ts. NULL means "creator has never saved a
-- design"; the client falls back to template defaults on read.
alter table profiles
  add column if not exists appearance jsonb;

-- The public view exposes only publish-safe columns. New columns must be
-- appended at the end so CREATE OR REPLACE VIEW keeps existing columns.
create or replace view public_pages
  with (security_invoker = false) as
select
  p.username, p.display_name, p.bio, p.avatar_url,
  p.whatsapp_number, p.upi_id, p.upi_qr_url,
  p.meta_title, p.meta_description, p.theme, p.tenant_id,
  p.appearance
from profiles p
where p.is_published = true;
