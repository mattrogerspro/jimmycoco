-- Dynamic QR destinations and privacy-conscious scan analytics.
--
-- Printed codes point to /q/<code>. The public resolver returns the current
-- destination for active records and records a scan without exposing either
-- table through the Data API.

begin;

create table public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique
    check (code ~ '^[a-z0-9][a-z0-9_-]{4,31}$'),
  name text not null
    check (char_length(btrim(name)) between 1 and 120),
  destination_url text not null
    check (
      char_length(destination_url) between 8 and 2048
      and destination_url ~* '^https?://'
    ),
  is_active boolean not null default true,
  scan_count bigint not null default 0 check (scan_count >= 0),
  last_scanned_at timestamptz,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  updated_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index qr_codes_active_updated_idx
  on public.qr_codes (is_active, updated_at desc);

create table public.qr_code_scans (
  id bigint generated always as identity primary key,
  qr_code_id uuid not null references public.qr_codes(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  -- Referrer HOST only. Never store the full URL or its query string.
  referrer text check (referrer is null or char_length(referrer) <= 200),
  device text check (device is null or device in ('mobile', 'desktop')),
  -- Daily-rotating hash of IP + user agent, matching article analytics.
  visitor_hash text check (visitor_hash is null or char_length(visitor_hash) <= 64)
);

create index qr_code_scans_code_time_idx
  on public.qr_code_scans (qr_code_id, scanned_at desc);
create index qr_code_scans_time_idx
  on public.qr_code_scans (scanned_at desc);

create trigger qr_codes_touch
before update on public.qr_codes
for each row execute function public.touch_updated_at();

alter table public.qr_codes enable row level security;
alter table public.qr_code_scans enable row level security;

revoke all on table public.qr_codes from public, anon, authenticated;
revoke all on table public.qr_code_scans from public, anon, authenticated;

grant select, insert, update on table public.qr_codes to authenticated;
grant select on table public.qr_code_scans to authenticated;
grant all on table public.qr_codes, public.qr_code_scans to service_role;
grant usage, select on sequence public.qr_code_scans_id_seq to service_role;

create policy qr_codes_staff_select
on public.qr_codes
for select
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'));

create policy qr_codes_admin_insert
on public.qr_codes
for insert
to authenticated
with check ((select private.current_article_role()) = 'admin');

create policy qr_codes_admin_update
on public.qr_codes
for update
to authenticated
using ((select private.current_article_role()) = 'admin')
with check ((select private.current_article_role()) = 'admin');

create policy qr_code_scans_staff_select
on public.qr_code_scans
for select
to authenticated
using ((select private.current_article_role()) in ('admin', 'editor'));

create or replace function public.resolve_qr_code(
  p_code text,
  p_referrer text default null,
  p_device text default null,
  p_visitor_hash text default null,
  p_record boolean default true
)
returns table (destination_url text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  resolved_id uuid;
  resolved_destination text;
begin
  if p_code is null or p_code !~ '^[a-z0-9][a-z0-9_-]{4,31}$' then
    return;
  end if;

  select q.id, q.destination_url
    into resolved_id, resolved_destination
  from public.qr_codes q
  where q.code = lower(p_code)
    and q.is_active = true
  limit 1;

  if resolved_id is null then
    return;
  end if;

  if coalesce(p_record, true) then
    insert into public.qr_code_scans (
      qr_code_id,
      referrer,
      device,
      visitor_hash
    )
    values (
      resolved_id,
      left(p_referrer, 200),
      case when p_device in ('mobile', 'desktop') then p_device end,
      left(p_visitor_hash, 64)
    );

    update public.qr_codes
    set
      scan_count = scan_count + 1,
      last_scanned_at = now()
    where id = resolved_id;
  end if;

  return query select resolved_destination;
end;
$$;

revoke all on function public.resolve_qr_code(text, text, text, text, boolean)
  from public, anon, authenticated;
grant execute on function public.resolve_qr_code(text, text, text, text, boolean)
  to anon, authenticated, service_role;

insert into public.qr_codes (
  code,
  name,
  destination_url,
  is_active
)
values (
  'bottle',
  'Bottle label',
  'https://jimmycoco.pro/?utm_source=bottle',
  true
)
on conflict (code) do nothing;

notify pgrst, 'reload schema';

commit;
