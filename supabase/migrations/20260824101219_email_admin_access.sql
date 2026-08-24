-- Private access control for the jimmycoco.email campaign studio.
--
-- This deliberately does not modify article_admin_profiles or the pro-site
-- admin/portal role model. The email studio uses the same Supabase Auth
-- identity/password, but grants access through this separate, super-admin-only
-- profile table.

begin;

create table if not exists public.email_admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 120),
  role text not null default 'super_admin' check (role = 'super_admin'),
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists email_admin_profiles_active_role
  on public.email_admin_profiles (role)
  where is_active = true;

drop trigger if exists email_admin_profiles_touch on public.email_admin_profiles;
create trigger email_admin_profiles_touch
before update on public.email_admin_profiles
for each row execute function public.touch_updated_at();

alter table public.email_admin_profiles enable row level security;

revoke all on table public.email_admin_profiles from public, anon, authenticated;
grant all on table public.email_admin_profiles to service_role;

comment on table public.email_admin_profiles is
  'Access list for jimmycoco.email. Same Supabase Auth users as the pro site, but only active super_admin rows may access the email operations studio.';

commit;
