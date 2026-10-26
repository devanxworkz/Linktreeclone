-- Auth enhancements: password reset tokens, email verification tracking, Google OAuth linking.
-- Safe to run in production; uses IF NOT EXISTS and non-destructive ALTER TABLEs.

-- Email verification state (unused by flows until configured, but safe to track).
alter table users add column if not exists email_verified_at timestamptz;

-- Allow linking accounts to Google without breaking existing auth.
alter table users add column if not exists google_id text;
create unique index if not exists users_google_id_key on users (google_id) where google_id is not null;

-- Secure password reset tokens. Store only a hash of the token.
create table if not exists password_reset_tokens (
  id         bigserial primary key,
  user_id    uuid not null references users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists password_reset_tokens_user_idx on password_reset_tokens (user_id);
create index if not exists password_reset_tokens_hash_idx on password_reset_tokens (token_hash);
create index if not exists password_reset_tokens_expires_idx on password_reset_tokens (expires_at);

-- Optional: track OAuth states server-side if needed later (kept minimal).
-- No data migration, no destructive changes.
