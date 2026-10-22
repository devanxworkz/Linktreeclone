-- Admin console: audit trail and login tracking.
-- See replica/schema.sql for the annotated reference.

-- Track the last successful sign-in so admins can tell dormant accounts apart.
alter table users add column if not exists last_login_at timestamptz;

-- Append-only record of sensitive administrative actions. The actor's email is
-- snapshotted so the trail stays readable even if the account is later removed.
create table if not exists admin_audit_log (
  id            bigserial primary key,
  actor_user_id uuid references users(id) on delete set null,
  actor_email   text not null,
  action        text not null,
  target_type   text,
  target_id     text,
  target_label  text,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists admin_audit_created_idx on admin_audit_log (created_at desc);
create index if not exists admin_audit_actor_idx on admin_audit_log (actor_user_id);
create index if not exists admin_audit_action_idx on admin_audit_log (action);
