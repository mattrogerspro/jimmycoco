begin;

create or replace function public.submit_reseller_application(
  p_business_name text,
  p_contact_name text,
  p_email text,
  p_phone text default null,
  p_business_type text default 'Salon',
  p_market text default 'UK',
  p_message text default null,
  p_wants_trial boolean default true,
  p_source text default 'pro-site',
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  new_id uuid;
  recent_count integer;
  create_as_demo boolean;
  record_mode text;
begin
  if coalesce(btrim(p_business_name), '') = ''
     or coalesce(btrim(p_contact_name), '') = ''
     or coalesce(btrim(p_email), '') = '' then
    raise exception 'Business name, contact name and email are required.'
      using errcode = 'check_violation';
  end if;

  select count(*) into recent_count
  from public.reseller_applications a
  where lower(a.email::text) = lower(btrim(p_email))
    and a.created_at > now() - interval '1 hour';

  if recent_count >= 3 then
    raise exception 'Too many applications submitted for this email address.'
      using errcode = 'check_violation';
  end if;

  select s.create_new_records_as_demo into create_as_demo
  from public.trade_data_settings s
  where s.id = true;

  record_mode := case when coalesce(create_as_demo, false) then 'demo' else 'live' end;

  insert into public.reseller_applications (
    business_name,
    contact_name,
    email,
    phone,
    business_type,
    market,
    message,
    wants_trial,
    source,
    metadata,
    data_mode
  )
  values (
    btrim(p_business_name),
    btrim(p_contact_name),
    lower(btrim(p_email)),
    nullif(btrim(p_phone), ''),
    coalesce(nullif(btrim(p_business_type), ''), 'Salon'),
    coalesce(nullif(btrim(p_market), ''), 'UK'),
    nullif(btrim(p_message), ''),
    coalesce(p_wants_trial, true),
    coalesce(nullif(btrim(p_source), ''), 'pro-site'),
    coalesce(p_metadata, '{}'::jsonb),
    record_mode
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.submit_reseller_application(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  text,
  jsonb
) from public, anon, authenticated;

grant execute on function public.submit_reseller_application(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  text,
  jsonb
) to anon, authenticated, service_role;

commit;
