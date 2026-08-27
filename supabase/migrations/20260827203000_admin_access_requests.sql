begin;

create table public.admin_access_requests (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null check (
    char_length(email) between 3 and 320
    and position('@' in email) > 1
  ),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  email_verified_at timestamptz,
  assigned_role text check (assigned_role in ('admin', 'editor')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  decision_note text check (decision_note is null or char_length(decision_note) <= 1000),
  internal_notification_sent_at timestamptz,
  internal_notification_resend_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'pending'
      and assigned_role is null
      and reviewed_by is null
      and reviewed_at is null
      and decision_note is null)
    or (status = 'approved'
      and assigned_role in ('admin', 'editor')
      and reviewed_by is not null
      and reviewed_at is not null
      and email_verified_at is not null)
    or (status = 'declined'
      and assigned_role is null
      and reviewed_by is not null
      and reviewed_at is not null)
  )
);

create index admin_access_requests_status_created
  on public.admin_access_requests (status, created_at desc);

create trigger admin_access_requests_touch
before update on public.admin_access_requests
for each row execute function public.touch_updated_at();

alter table public.admin_access_requests enable row level security;
revoke all on table public.admin_access_requests from public, anon, authenticated;
grant all on table public.admin_access_requests to service_role;

-- Only the trusted PRO server, holding the Supabase service credential, can
-- create a request. It verifies that the submitted user id and email belong
-- together in auth.users and never accepts role or status from a registrant.
create or replace function public.record_admin_access_request(
  p_auth_user_id uuid,
  p_email text
)
returns table (request_id uuid, was_created boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request_id uuid;
  v_email text := lower(btrim(p_email));
begin
  if p_auth_user_id is null or v_email = '' then
    raise exception 'A user identity and email address are required.';
  end if;

  if not exists (
    select 1
    from auth.users u
    where u.id = p_auth_user_id
      and lower(u.email) = v_email
  ) then
    raise exception 'The registration identity could not be verified.';
  end if;

  insert into public.admin_access_requests (auth_user_id, email)
  values (p_auth_user_id, v_email)
  on conflict (auth_user_id) do nothing
  returning id into v_request_id;

  if v_request_id is not null then
    return query select v_request_id, true;
    return;
  end if;

  select r.id into v_request_id
  from public.admin_access_requests r
  where r.auth_user_id = p_auth_user_id;

  return query select v_request_id, false;
end;
$$;

-- All final permission changes occur inside one transaction. The function
-- independently verifies that the reviewer is an active Administrator and,
-- for approval, that Supabase has confirmed the applicant's email address.
create or replace function public.review_admin_access_request(
  p_request_id uuid,
  p_reviewer_id uuid,
  p_decision text,
  p_assigned_role text default null,
  p_decision_note text default null
)
returns public.admin_access_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request public.admin_access_requests;
  v_email_confirmed_at timestamptz;
  v_display_name text;
begin
  if p_decision not in ('approved', 'declined') then
    raise exception 'The access decision is invalid.';
  end if;

  if not exists (
    select 1
    from public.article_admin_profiles reviewer
    where reviewer.user_id = p_reviewer_id
      and reviewer.is_active = true
      and reviewer.role = 'admin'
  ) then
    raise exception 'Only active Administrators can review access requests.';
  end if;

  select r.* into v_request
  from public.admin_access_requests r
  where r.id = p_request_id
  for update;

  if not found then
    raise exception 'The access request no longer exists.';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'This access request has already been decided.';
  end if;

  if p_decision = 'approved' then
    if p_assigned_role not in ('admin', 'editor') then
      raise exception 'Choose Admin or Editor before approving this request.';
    end if;

    select u.email_confirmed_at,
      coalesce(
        nullif(btrim(u.raw_user_meta_data ->> 'full_name'), ''),
        nullif(btrim(u.raw_user_meta_data ->> 'name'), ''),
        split_part(u.email, '@', 1)
      )
    into v_email_confirmed_at, v_display_name
    from auth.users u
    where u.id = v_request.auth_user_id;

    if v_email_confirmed_at is null then
      raise exception 'The requester must verify their email address before approval.';
    end if;

    insert into public.article_admin_profiles (
      user_id,
      display_name,
      role,
      is_active,
      created_by
    )
    values (
      v_request.auth_user_id,
      left(v_display_name, 120),
      p_assigned_role,
      true,
      p_reviewer_id
    )
    on conflict (user_id) do update set
      display_name = excluded.display_name,
      role = excluded.role,
      is_active = true,
      created_by = excluded.created_by,
      updated_at = now();

    update public.admin_access_requests
    set
      status = 'approved',
      email_verified_at = v_email_confirmed_at,
      assigned_role = p_assigned_role,
      reviewed_by = p_reviewer_id,
      reviewed_at = now(),
      decision_note = nullif(btrim(coalesce(p_decision_note, '')), '')
    where id = v_request.id
    returning * into v_request;
  else
    update public.admin_access_requests
    set
      status = 'declined',
      reviewed_by = p_reviewer_id,
      reviewed_at = now(),
      decision_note = nullif(btrim(coalesce(p_decision_note, '')), '')
    where id = v_request.id
    returning * into v_request;
  end if;

  return v_request;
end;
$$;

revoke all on function public.record_admin_access_request(uuid, text) from public, anon, authenticated;
revoke all on function public.review_admin_access_request(uuid, uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.record_admin_access_request(uuid, text) to service_role;
grant execute on function public.review_admin_access_request(uuid, uuid, text, text, text) to service_role;

commit;
