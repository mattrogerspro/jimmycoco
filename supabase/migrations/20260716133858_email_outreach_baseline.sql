-- Baselines the email outreach schema that predated tracked Supabase migrations.
begin;

create extension if not exists citext;
create extension if not exists pgcrypto;

create table if not exists public.email_contacts (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  first_name text,
  last_name text,
  business_name text,
  market text,
  timezone text,
  resend_contact_id text unique,
  marketing_status text not null default 'unknown' check (marketing_status in ('unknown', 'eligible', 'unsubscribed')),
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_campaigns (
  id text primary key,
  name text not null,
  market text not null,
  mode text not null check (mode in ('sequence', 'event', 'broadcast')),
  classification text not null check (classification in ('promotional', 'lifecycle', 'service', 'transactional')),
  definition_version text not null,
  enabled boolean not null default false,
  timezone text not null,
  local_send_hour smallint not null default 10 check (local_send_hour between 0 and 23),
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.email_campaign_steps (
  campaign_id text not null references public.email_campaigns(id) on delete cascade,
  step_key text not null,
  step_number integer not null,
  day_offset integer,
  trigger_name text,
  template_alias text not null,
  template_id text,
  classification text not null check (classification in ('promotional', 'lifecycle', 'service', 'transactional')),
  subject text not null,
  required_variables jsonb not null default '[]'::jsonb,
  primary key (campaign_id, step_key)
);

create table if not exists public.email_suppressions (
  email citext not null,
  scope text not null check (scope in ('marketing', 'global')),
  reason text not null,
  source text not null,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  primary key (email, scope)
);

create table if not exists public.email_enrollments (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null references public.email_campaigns(id),
  contact_id uuid not null references public.email_contacts(id),
  status text not null default 'active' check (status in ('active', 'completed', 'exited', 'paused', 'needs_attention')),
  next_step integer not null default 1,
  enrolled_at timestamptz not null default now(),
  next_send_at timestamptz,
  exited_at timestamptz,
  exit_reason text,
  owner text,
  context jsonb not null default '{}'::jsonb,
  retry_count integer not null default 0,
  locked_at timestamptz,
  locked_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists email_enrollments_one_active
  on public.email_enrollments (campaign_id, contact_id)
  where status in ('active', 'paused', 'needs_attention');
create index if not exists email_enrollments_due
  on public.email_enrollments (next_send_at)
  where status = 'active';

create table if not exists public.email_jobs (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null references public.email_campaigns(id),
  step_key text not null,
  contact_id uuid not null references public.email_contacts(id),
  source_event_id text not null,
  run_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled', 'failed', 'needs_attention')),
  context jsonb not null default '{}'::jsonb,
  retry_count integer not null default 0,
  locked_at timestamptz,
  locked_by text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, step_key, source_event_id)
);

create index if not exists email_jobs_due on public.email_jobs (run_at) where status = 'pending';

create table if not exists public.email_messages (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid references public.email_enrollments(id),
  job_id uuid references public.email_jobs(id),
  contact_id uuid references public.email_contacts(id),
  campaign_id text not null references public.email_campaigns(id),
  step_key text not null,
  step_number integer not null,
  source text not null default 'sequence_engine' check (source in ('sequence_engine', 'lifecycle_engine', 'resend_broadcast', 'resend_external')),
  classification text not null check (classification in ('promotional', 'lifecycle', 'service', 'transactional')),
  idempotency_key text not null unique,
  template_alias text,
  template_id text,
  recipient_email citext not null,
  subject text not null,
  status text not null default 'queued',
  resend_email_id text unique,
  resend_broadcast_id text,
  tags jsonb not null default '{}'::jsonb,
  error_message text,
  queued_at timestamptz not null default now(),
  sent_at timestamptz,
  delivered_at timestamptz,
  first_opened_at timestamptz,
  first_clicked_at timestamptz,
  bounced_at timestamptz,
  complained_at timestamptz,
  failed_at timestamptz,
  suppressed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists email_messages_campaign on public.email_messages (campaign_id, step_key);
create index if not exists email_messages_contact_sent on public.email_messages (contact_id, sent_at desc);

create table if not exists public.email_events (
  id uuid primary key default gen_random_uuid(),
  svix_id text not null unique,
  event_type text not null,
  resend_email_id text,
  message_id uuid references public.email_messages(id),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

create index if not exists email_events_message on public.email_events (message_id, occurred_at);

create table if not exists public.email_business_events (
  id uuid primary key default gen_random_uuid(),
  external_event_id text unique,
  contact_id uuid references public.email_contacts(id),
  campaign_id text references public.email_campaigns(id),
  enrollment_id uuid references public.email_enrollments(id),
  event_type text not null,
  occurred_at timestamptz not null default now(),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists email_contacts_touch on public.email_contacts;
create trigger email_contacts_touch before update on public.email_contacts for each row execute function public.touch_updated_at();
drop trigger if exists email_enrollments_touch on public.email_enrollments;
create trigger email_enrollments_touch before update on public.email_enrollments for each row execute function public.touch_updated_at();
drop trigger if exists email_jobs_touch on public.email_jobs;
create trigger email_jobs_touch before update on public.email_jobs for each row execute function public.touch_updated_at();
drop trigger if exists email_messages_touch on public.email_messages;
create trigger email_messages_touch before update on public.email_messages for each row execute function public.touch_updated_at();

create or replace function public.upsert_email_contact(
  p_email text,
  p_first_name text default null,
  p_last_name text default null,
  p_business_name text default null,
  p_market text default null,
  p_timezone text default null,
  p_marketing_status text default 'unknown',
  p_properties jsonb default '{}'::jsonb
) returns public.email_contacts
language plpgsql security definer set search_path = '' as $$
declare
  result public.email_contacts;
begin
  insert into public.email_contacts (email, first_name, last_name, business_name, market, timezone, marketing_status, properties)
  values (lower(trim(p_email)), p_first_name, p_last_name, p_business_name, p_market, p_timezone, p_marketing_status, coalesce(p_properties, '{}'::jsonb))
  on conflict (email) do update set
    first_name = coalesce(excluded.first_name, email_contacts.first_name),
    last_name = coalesce(excluded.last_name, email_contacts.last_name),
    business_name = coalesce(excluded.business_name, email_contacts.business_name),
    market = coalesce(excluded.market, email_contacts.market),
    timezone = coalesce(excluded.timezone, email_contacts.timezone),
    marketing_status = case when email_contacts.marketing_status = 'unsubscribed' then 'unsubscribed' else excluded.marketing_status end,
    properties = email_contacts.properties || excluded.properties
  returning * into result;
  return result;
end;
$$;

create or replace function public.enroll_email_contact(
  p_campaign_id text,
  p_email text,
  p_first_name text default null,
  p_last_name text default null,
  p_business_name text default null,
  p_market text default null,
  p_timezone text default null,
  p_owner text default null,
  p_context jsonb default '{}'::jsonb,
  p_next_send_at timestamptz default now()
) returns public.email_enrollments
language plpgsql security definer set search_path = '' as $$
declare
  contact_row public.email_contacts;
  enrollment_row public.email_enrollments;
begin
  if exists (select 1 from public.email_suppressions where email = lower(trim(p_email)) and scope in ('marketing', 'global')) then
    raise exception 'contact_is_suppressed';
  end if;

  select * into contact_row from public.upsert_email_contact(
    p_email, p_first_name, p_last_name, p_business_name, p_market, p_timezone, 'eligible', p_context
  );

  select * into enrollment_row from public.email_enrollments
    where campaign_id = p_campaign_id and contact_id = contact_row.id and status in ('active', 'paused', 'needs_attention')
    order by created_at desc limit 1;

  if enrollment_row.id is null then
    insert into public.email_enrollments (campaign_id, contact_id, status, next_step, next_send_at, owner, context)
    values (p_campaign_id, contact_row.id, 'active', 1, p_next_send_at, p_owner, coalesce(p_context, '{}'::jsonb))
    returning * into enrollment_row;
  end if;

  return enrollment_row;
end;
$$;

create or replace function public.claim_due_email_enrollments(p_limit integer, p_worker text)
returns table (
  enrollment_id uuid, campaign_id text, next_step integer, enrolled_at timestamptz,
  contact_id uuid, email citext, first_name text, last_name text, business_name text,
  market text, timezone text, context jsonb, retry_count integer
)
language sql security definer set search_path = '' as $$
  with due as (
    select e.id from public.email_enrollments e
    join public.email_campaigns c on c.id = e.campaign_id and c.enabled = true
    where e.status = 'active'
      and e.next_send_at <= now()
      and (e.locked_at is null or e.locked_at < now() - interval '10 minutes')
    order by e.next_send_at
    for update skip locked
    limit greatest(1, least(p_limit, 100))
  ), claimed as (
    update public.email_enrollments e
    set locked_at = now(), locked_by = p_worker
    from due where e.id = due.id
    returning e.*
  )
  select c.id, c.campaign_id, c.next_step, c.enrolled_at,
    ec.id, ec.email, ec.first_name, ec.last_name, ec.business_name,
    ec.market, ec.timezone, c.context, c.retry_count
  from claimed c join public.email_contacts ec on ec.id = c.contact_id;
$$;

create or replace function public.claim_due_email_jobs(p_limit integer, p_worker text)
returns table (
  job_id uuid, campaign_id text, step_key text, source_event_id text,
  contact_id uuid, email citext, first_name text, last_name text, business_name text,
  market text, timezone text, context jsonb, retry_count integer
)
language sql security definer set search_path = '' as $$
  with due as (
    select j.id from public.email_jobs j
    join public.email_campaigns c on c.id = j.campaign_id and c.enabled = true
    where j.status = 'pending'
      and j.run_at <= now()
      and (j.locked_at is null or j.locked_at < now() - interval '10 minutes')
    order by j.run_at
    for update skip locked
    limit greatest(1, least(p_limit, 100))
  ), claimed as (
    update public.email_jobs j
    set status = 'processing', locked_at = now(), locked_by = p_worker
    from due where j.id = due.id
    returning j.*
  )
  select j.id, j.campaign_id, j.step_key, j.source_event_id,
    ec.id, ec.email, ec.first_name, ec.last_name, ec.business_name,
    ec.market, ec.timezone, j.context, j.retry_count
  from claimed j join public.email_contacts ec on ec.id = j.contact_id;
$$;

create or replace function public.exit_email_enrollments(
  p_email text,
  p_reason text,
  p_event_type text,
  p_external_event_id text default null,
  p_data jsonb default '{}'::jsonb
) returns integer
language plpgsql security definer set search_path = '' as $$
declare
  affected integer;
  contact_uuid uuid;
begin
  select id into contact_uuid from public.email_contacts where email = lower(trim(p_email));
  if contact_uuid is null then return 0; end if;

  insert into public.email_business_events (external_event_id, contact_id, campaign_id, enrollment_id, event_type, data)
  select p_external_event_id, contact_uuid, e.campaign_id, e.id, p_event_type, coalesce(p_data, '{}'::jsonb)
  from public.email_enrollments e where e.contact_id = contact_uuid and e.status = 'active'
  on conflict (external_event_id) do nothing;

  update public.email_enrollments set status = 'exited', exited_at = now(), exit_reason = p_reason, next_send_at = null, locked_at = null, locked_by = null
    where contact_id = contact_uuid and status = 'active';
  get diagnostics affected = row_count;
  return affected;
end;
$$;

create or replace view public.email_campaign_stats as
select
  c.id as campaign_id,
  c.name,
  c.market,
  c.mode,
  c.enabled,
  count(distinct m.id) filter (where m.sent_at is not null) as sent,
  count(distinct m.id) filter (where m.delivered_at is not null) as delivered,
  count(distinct m.id) filter (where m.first_opened_at is not null) as opened,
  count(distinct m.id) filter (where m.first_clicked_at is not null) as clicked,
  count(distinct m.id) filter (where m.bounced_at is not null) as bounced,
  count(distinct m.id) filter (where m.complained_at is not null) as complained,
  count(distinct m.id) filter (where m.failed_at is not null) as failed,
  count(distinct e.id) filter (where e.status = 'active') as active_enrollments,
  count(distinct e.id) filter (where e.status = 'completed') as completed_enrollments,
  count(distinct e.id) filter (where e.status = 'exited') as exited_enrollments,
  count(distinct be.id) filter (where be.event_type = 'reply') as replies,
  count(distinct be.id) filter (where be.event_type in ('sample_requested', 'trial_requested', 'call_booked', 'opening_order_placed')) as conversions,
  max(coalesce(m.sent_at, m.created_at)) as last_activity_at
from public.email_campaigns c
left join public.email_messages m on m.campaign_id = c.id
left join public.email_enrollments e on e.campaign_id = c.id
left join public.email_business_events be on be.campaign_id = c.id
group by c.id, c.name, c.market, c.mode, c.enabled;

create or replace view public.email_step_stats as
select
  s.campaign_id,
  s.step_key,
  s.step_number,
  s.subject,
  s.template_alias,
  count(m.id) filter (where m.sent_at is not null) as sent,
  count(m.id) filter (where m.delivered_at is not null) as delivered,
  count(m.id) filter (where m.first_opened_at is not null) as opened,
  count(m.id) filter (where m.first_clicked_at is not null) as clicked,
  count(m.id) filter (where m.bounced_at is not null) as bounced,
  count(m.id) filter (where m.complained_at is not null) as complained,
  count(m.id) filter (where m.failed_at is not null) as failed
from public.email_campaign_steps s
left join public.email_messages m on m.campaign_id = s.campaign_id and m.step_key = s.step_key
group by s.campaign_id, s.step_key, s.step_number, s.subject, s.template_alias;

alter table public.email_contacts enable row level security;
alter table public.email_campaigns enable row level security;
alter table public.email_campaign_steps enable row level security;
alter table public.email_suppressions enable row level security;
alter table public.email_enrollments enable row level security;
alter table public.email_jobs enable row level security;
alter table public.email_messages enable row level security;
alter table public.email_events enable row level security;
alter table public.email_business_events enable row level security;

revoke all on all tables in schema public from anon, authenticated;
-- Functions are executable by PUBLIC by default. Revoking only from anon and
-- authenticated is insufficient because both roles inherit PUBLIC privileges.
revoke all on all functions in schema public from public, anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public;
grant usage on schema public to service_role;
grant all on all tables in schema public to service_role;
grant execute on all functions in schema public to service_role;

insert into public.email_campaigns (id, name, market, mode, classification, definition_version, enabled, timezone, local_send_hour)
values
  ('au-salon-seeding', 'AU Salon Seeding', 'AU', 'sequence', 'promotional', '2026-07-14.1', false, 'Australia/Sydney', 10),
  ('au-salon-account-flow', 'AU Salon Account Flow', 'AU', 'event', 'service', '2026-07-14.1', false, 'Australia/Sydney', 10),
  ('uk-salon-stockist', 'UK Stockist Recruitment', 'UK', 'broadcast', 'promotional', '2026-07-14.1', false, 'Europe/London', 10),
  ('uae-dubai-salon-stockist', 'Dubai Stockist Recruitment', 'UAE', 'sequence', 'promotional', '2026-07-14.1', false, 'Asia/Dubai', 10)
on conflict (id) do update set
  name = excluded.name, market = excluded.market, mode = excluded.mode,
  classification = excluded.classification, definition_version = excluded.definition_version,
  timezone = excluded.timezone, local_send_hour = excluded.local_send_hour;

insert into public.email_campaign_steps (campaign_id, step_key, step_number, day_offset, trigger_name, template_alias, template_id, classification, subject, required_variables)
values
  ('au-salon-seeding','01',1,0,null,'au-seeding-1-opener','8799d25e-07f9-4510-8678-73404c08b6bb','promotional','A red-carpet tan for your salon?','["SALON_NAME","SENDER_EMAIL","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS"]'),
  ('au-salon-seeding','02',2,3,null,'au-seeding-2-nudge','b65dc68f-38eb-4b3f-a442-a484fc7d866e','promotional','A quick Jimmy Coco follow-up','["SALON_NAME","SENDER_EMAIL","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS"]'),
  ('au-salon-seeding','03',3,8,null,'au-seeding-3-two-revenue-lines','e8af69af-18a1-4c70-b029-f2be59cef606','promotional','Two tan revenue lines, one partner','["SALON_NAME","CALENDAR_LINK","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS"]'),
  ('au-salon-seeding','04',4,13,null,'au-seeding-4-season-readiness','ce0aa808-9d4b-4a0b-ba1e-daece7697e53','promotional','Before the spring racing rush','["SALON_NAME","CALENDAR_LINK","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS"]'),
  ('au-salon-seeding','05',5,20,null,'au-seeding-5-last-call','274f3c0d-3440-4cc7-a74a-d939b9844b5a','promotional','Should I close the file?','["SALON_NAME","SHADE_GUIDE_LINK","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS"]'),
  ('au-salon-seeding','onboarding',90,null,'sample_requested','au-seeding-onboarding-welcome','76bfbbee-d356-4b74-b373-e8f16f729fa5','service','Welcome to Jimmy Coco — here is what happens next','["SALON_NAME","CALENDAR_LINK","SHADE_GUIDE_LINK","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS"]'),
  ('au-salon-account-flow','sample-check-in',1,null,'sample_dispatched','au-account-1-sample-check-in','ac587ebf-d58c-42bd-901b-edb239369b3d','lifecycle','How did the Sunset tan turn out?','["SALON_NAME","CALENDAR_LINK","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS"]'),
  ('au-salon-account-flow','terms-summary',2,null,'setup_call_completed','au-account-2-trade-terms-summary','5cd45a65-aa79-40bc-af99-54ae2d67c278','service','Your Jimmy Coco partner terms — as promised','["WHOLESALE_MARGIN","MIN_OPENING_ORDER","REORDER_MINIMUM","LEAD_TIME","ORDER_LINK","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS"]'),
  ('au-salon-account-flow','order-confirmation',3,null,'opening_order_placed','au-account-3-first-order-confirmation','ab113de0-cecd-4e05-9ca8-55574785b7ae','service','Order confirmed — welcome to Jimmy Coco','["SALON_NAME","ORDER_NUMBER","ORDER_SUMMARY","ORDER_TOTAL","DISPATCH_DATE","TRACKING_LINK","ORDER_LINK","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS","SUPPORT_EMAIL"]'),
  ('uk-salon-stockist','pilot',1,0,null,'uk-stockist-1-your-clients-know-this-name','1a3d51ad-7c50-46dc-967c-ceb1c012ad2c','promotional','Your clients already know this name','[]'),
  ('uae-dubai-salon-stockist','01',1,0,null,'uae-stockist-1-dubai-introduction','c3d0ff13-85cb-4670-b7cc-e303babec1c4','promotional','A Jimmy Coco introduction for your business','["BUSINESS_NAME","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS","TRIAL_LINK"]'),
  ('uae-dubai-salon-stockist','02',2,4,null,'uae-stockist-2-colour-in-dubai-light','355ca12b-1faa-4117-bddc-7e5a43643051','promotional','Colour that still looks right in Dubai light','["SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS","TRIAL_LINK"]'),
  ('uae-dubai-salon-stockist','03',3,8,null,'uae-stockist-3-service-and-retail','c7ec7c71-0143-43ca-8511-604d3f46944e','promotional','One tan client, two considered revenue lines','["TRADE_LINK","CALENDAR_LINK","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS"]'),
  ('uae-dubai-salon-stockist','04',4,13,null,'uae-stockist-4-partner-support','b438770c-8bf5-44d9-a44a-528028e7d0fd','promotional','What a Jimmy Coco partnership includes','["UAE_DELIVERY_STATEMENT","UAE_PARTNER_TERMS","CALENDAR_LINK","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS"]'),
  ('uae-dubai-salon-stockist','05',5,18,null,'uae-stockist-5-close-the-loop','5b53dafb-1349-4616-93b9-e74368135c70','promotional','Shall I close this for now?','["BUSINESS_NAME","SHADE_GUIDE_LINK","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS"]')
on conflict (campaign_id, step_key) do update set
  step_number = excluded.step_number, day_offset = excluded.day_offset,
  trigger_name = excluded.trigger_name, template_alias = excluded.template_alias,
  template_id = excluded.template_id, classification = excluded.classification,
  subject = excluded.subject, required_variables = excluded.required_variables;

commit;
