-- Audited, preview-first audience imports for the disabled UK and US outreach
-- campaigns. The application validates the CSV and signs its preview; this
-- migration performs the final eligibility and suppression checks atomically.
begin;

create table if not exists public.email_audience_imports (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null references public.email_campaigns(id) on delete restrict,
  import_key text not null unique check (import_key ~ '^[a-f0-9]{64}$'),
  preview_digest text not null check (preview_digest ~ '^[a-f0-9]{64}$'),
  source_file text not null,
  operator text not null,
  start_at timestamptz not null,
  status text not null default 'processing' check (status in ('processing', 'completed', 'failed')),
  total_records integer not null default 0 check (total_records >= 0),
  preview_eligible_records integer not null default 0 check (preview_eligible_records >= 0),
  enrolled_contacts integer not null default 0 check (enrolled_contacts >= 0),
  existing_enrollments integer not null default 0 check (existing_enrollments >= 0),
  excluded_at_commit integer not null default 0 check (excluded_at_commit >= 0),
  result jsonb not null default '{}'::jsonb check (jsonb_typeof(result) = 'object'),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists email_audience_imports_campaign_created
  on public.email_audience_imports (campaign_id, created_at desc);

create table if not exists public.email_audience_import_rows (
  import_id uuid not null references public.email_audience_imports(id) on delete cascade,
  row_number integer not null check (row_number >= 2),
  email citext,
  outcome text not null,
  reasons jsonb not null default '[]'::jsonb check (jsonb_typeof(reasons) = 'array'),
  contact_id uuid references public.email_contacts(id) on delete set null,
  enrollment_id uuid references public.email_enrollments(id) on delete set null,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  primary key (import_id, row_number)
);

create index if not exists email_audience_import_rows_import_email
  on public.email_audience_import_rows (import_id, email)
  where email is not null;
create index if not exists email_audience_import_rows_contact
  on public.email_audience_import_rows (contact_id)
  where contact_id is not null;
create index if not exists email_audience_import_rows_enrollment
  on public.email_audience_import_rows (enrollment_id)
  where enrollment_id is not null;

alter table public.email_audience_imports enable row level security;
alter table public.email_audience_import_rows enable row level security;

revoke all on public.email_audience_imports from public, anon, authenticated;
revoke all on public.email_audience_import_rows from public, anon, authenticated;
grant select, insert, update on public.email_audience_imports to service_role;
grant select, insert on public.email_audience_import_rows to service_role;

create or replace function public.preview_email_audience_state(
  p_campaign_id text,
  p_emails text[]
) returns table (
  email text,
  existing_contact boolean,
  marketing_status text,
  existing_customer boolean,
  existing_trial_applicant boolean,
  suppressed boolean,
  already_enrolled boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with requested as (
    select distinct lower(btrim(value)) as email
    from unnest(coalesce(p_emails, array[]::text[])) as source(value)
    where btrim(value) <> ''
  )
  select
    requested.email,
    contact.id is not null as existing_contact,
    contact.marketing_status,
    exists (
      select 1
      from public.resellers reseller
      where lower(reseller.email::text) = requested.email
    ) as existing_customer,
    exists (
      select 1
      from public.reseller_applications application
      where lower(application.email::text) = requested.email
        and application.wants_trial = true
    ) as existing_trial_applicant,
    contact.marketing_status = 'unsubscribed' or exists (
      select 1
      from public.email_suppressions suppression
      where lower(suppression.email::text) = requested.email
        and suppression.scope in ('marketing', 'global')
    ) as suppressed,
    exists (
      select 1
      from public.email_enrollments enrollment
      where enrollment.campaign_id = p_campaign_id
        and enrollment.contact_id = contact.id
        and enrollment.status in ('active', 'paused', 'needs_attention')
    ) as already_enrolled
  from requested
  left join public.email_contacts contact
    on lower(contact.email::text) = requested.email;
$$;

revoke all on function public.preview_email_audience_state(text, text[]) from public, anon, authenticated;
grant execute on function public.preview_email_audience_state(text, text[]) to service_role;

create or replace function public.commit_email_audience_import(
  p_campaign_id text,
  p_start_at timestamptz,
  p_rows jsonb,
  p_import_key text,
  p_preview_digest text,
  p_source_file text,
  p_operator text
) returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  campaign_market text;
  import_uuid uuid;
  existing_result jsonb;
  row_data jsonb;
  row_number_value integer;
  email_value text;
  outcome_value text;
  reasons_value jsonb;
  contact_uuid uuid;
  enrollment_uuid uuid;
  properties_value jsonb;
  total_count integer := 0;
  preview_eligible_count integer := 0;
  enrolled_count integer := 0;
  existing_enrollment_count integer := 0;
  excluded_count integer := 0;
  result_value jsonb;
begin
  if p_campaign_id not in ('uk-salon-stockist', 'us-west-coast-salon-stockist') then
    raise exception 'audience_import_campaign_not_allowed';
  end if;
  if p_start_at is null or p_start_at < now() + interval '5 minutes' then
    raise exception 'audience_import_start_at_invalid';
  end if;
  if coalesce(btrim(p_operator), '') = '' then
    raise exception 'audience_import_operator_required';
  end if;
  if p_import_key !~ '^[a-f0-9]{64}$' or p_preview_digest !~ '^[a-f0-9]{64}$' then
    raise exception 'audience_import_digest_invalid';
  end if;
  if jsonb_typeof(p_rows) <> 'array' or jsonb_array_length(p_rows) > 5000 then
    raise exception 'audience_import_rows_invalid';
  end if;

  select campaign.market
  into campaign_market
  from public.email_campaigns campaign
  where campaign.id = p_campaign_id
    and campaign.mode = 'sequence'
    and campaign.classification = 'promotional';

  if campaign_market is null then
    raise exception 'audience_import_campaign_not_found';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('email-audience-import:' || p_import_key, 0));

  select import_record.result
  into existing_result
  from public.email_audience_imports import_record
  where import_record.import_key = p_import_key
    and import_record.status = 'completed';

  if existing_result is not null then
    return existing_result || jsonb_build_object('idempotent_replay', true);
  end if;

  insert into public.email_audience_imports (
    campaign_id,
    import_key,
    preview_digest,
    source_file,
    operator,
    start_at,
    status
  ) values (
    p_campaign_id,
    p_import_key,
    p_preview_digest,
    left(coalesce(nullif(btrim(p_source_file), ''), 'audience.csv'), 240),
    btrim(p_operator),
    p_start_at,
    'processing'
  )
  returning id into import_uuid;

  for row_data in
    select item.value
    from jsonb_array_elements(p_rows) as item(value)
    order by (item.value ->> 'row_number')::integer
  loop
    total_count := total_count + 1;
    row_number_value := (row_data ->> 'row_number')::integer;
    email_value := lower(btrim(coalesce(row_data ->> 'email', '')));
    outcome_value := coalesce(nullif(btrim(row_data ->> 'outcome'), ''), 'invalid');
    reasons_value := case
      when jsonb_typeof(row_data -> 'reasons') = 'array' then row_data -> 'reasons'
      else '[]'::jsonb
    end;
    contact_uuid := null;
    enrollment_uuid := null;

    if outcome_value = 'eligible' then
      preview_eligible_count := preview_eligible_count + 1;

      if email_value = ''
         or coalesce(btrim(row_data ->> 'business_name'), '') = ''
         or coalesce(btrim(row_data ->> 'business_type'), '') = ''
         or coalesce(btrim(row_data ->> 'timezone'), '') = ''
         or coalesce(btrim(row_data ->> 'source'), '') = ''
         or coalesce(btrim(row_data ->> 'source_date'), '') = ''
         or coalesce(btrim(row_data ->> 'owner'), '') = ''
         or coalesce(row_data ->> 'company_legal_entity_type', '') not in (
           'limited_company',
           'limited_liability_partnership',
           'corporation',
           'limited_liability_company',
           'public_company',
           'sole_trader',
           'individual',
           'unincorporated_partnership',
           'charity',
           'nonprofit'
         )
         or coalesce(row_data ->> 'eligibility_decision', '') <> 'eligible'
         or (coalesce(btrim(row_data ->> 'eligibility_reason'), '') = '' and coalesce(btrim(row_data ->> 'lawful_basis'), '') = '') then
        outcome_value := 'invalid_at_commit';
      elsif not exists (
        select 1
        from pg_catalog.pg_timezone_names timezone_record
        where timezone_record.name = row_data ->> 'timezone'
      ) then
        outcome_value := 'invalid_timezone_at_commit';
      elsif coalesce(row_data ->> 'source_date', '') !~ '^\d{4}-\d{2}-\d{2}$' then
        outcome_value := 'invalid_source_date_at_commit';
      elsif (row_data ->> 'source_date') > current_date::text then
        outcome_value := 'future_source_date_at_commit';
      elsif coalesce(row_data ->> 'market', '') <> campaign_market then
        outcome_value := 'market_mismatch_at_commit';
      elsif campaign_market = 'UK'
            and coalesce(row_data ->> 'company_legal_entity_type', '') in ('individual', 'sole_trader', 'unincorporated_partnership') then
        outcome_value := 'uk_individual_subscriber_at_commit';
      elsif exists (
        select 1 from public.email_suppressions suppression
        where lower(suppression.email::text) = email_value
          and suppression.scope in ('marketing', 'global')
      ) or exists (
        select 1 from public.email_contacts contact
        where lower(contact.email::text) = email_value
          and contact.marketing_status = 'unsubscribed'
      ) then
        outcome_value := 'suppressed_at_commit';
      elsif exists (
        select 1 from public.resellers reseller
        where lower(reseller.email::text) = email_value
      ) then
        outcome_value := 'existing_customer_at_commit';
      elsif exists (
        select 1 from public.reseller_applications application
        where lower(application.email::text) = email_value
          and application.wants_trial = true
      ) then
        outcome_value := 'existing_trial_applicant_at_commit';
      elsif exists (
        select 1 from public.email_audience_import_rows import_row
        where import_row.import_id = import_uuid
          and lower(import_row.email::text) = email_value
          and import_row.outcome in ('enrolled', 'already_enrolled')
      ) then
        outcome_value := 'duplicate_at_commit';
      end if;

      if outcome_value = 'eligible' then
        properties_value := jsonb_build_object(
          'greeting_name', coalesce(nullif(btrim(row_data ->> 'greeting_name'), ''), 'Salon Owner'),
          'business_type', row_data ->> 'business_type',
          'company_legal_entity_type', row_data ->> 'company_legal_entity_type',
          'source', row_data ->> 'source',
          'source_date', row_data ->> 'source_date',
          'eligibility_decision', row_data ->> 'eligibility_decision',
          'eligibility_reason', row_data ->> 'eligibility_reason',
          'lawful_basis', row_data ->> 'lawful_basis',
          'audience_import_id', import_uuid,
          'audience_imported_at', now()
        );

        insert into public.email_contacts (
          email,
          first_name,
          business_name,
          market,
          timezone,
          marketing_status,
          properties
        ) values (
          email_value,
          nullif(btrim(row_data ->> 'first_name'), ''),
          nullif(btrim(row_data ->> 'business_name'), ''),
          campaign_market,
          nullif(btrim(row_data ->> 'timezone'), ''),
          'eligible',
          properties_value
        )
        on conflict (email) do update set
          first_name = coalesce(excluded.first_name, email_contacts.first_name),
          business_name = coalesce(excluded.business_name, email_contacts.business_name),
          market = excluded.market,
          timezone = coalesce(excluded.timezone, email_contacts.timezone),
          marketing_status = case
            when email_contacts.marketing_status = 'unsubscribed' then 'unsubscribed'
            else 'eligible'
          end,
          properties = email_contacts.properties || excluded.properties
        returning id into contact_uuid;

        insert into public.email_enrollments (
          campaign_id,
          contact_id,
          status,
          next_step,
          next_send_at,
          owner,
          context
        ) values (
          p_campaign_id,
          contact_uuid,
          'active',
          1,
          p_start_at,
          nullif(btrim(row_data ->> 'owner'), ''),
          properties_value || jsonb_build_object('audience_import_id', import_uuid)
        )
        on conflict (campaign_id, contact_id)
          where status in ('active', 'paused', 'needs_attention')
          do nothing
        returning id into enrollment_uuid;

        if enrollment_uuid is null then
          select enrollment.id
          into enrollment_uuid
          from public.email_enrollments enrollment
          where enrollment.campaign_id = p_campaign_id
            and enrollment.contact_id = contact_uuid
            and enrollment.status in ('active', 'paused', 'needs_attention')
          order by enrollment.created_at desc
          limit 1;
          outcome_value := 'already_enrolled';
          existing_enrollment_count := existing_enrollment_count + 1;
        else
          outcome_value := 'enrolled';
          enrolled_count := enrolled_count + 1;
        end if;
      else
        excluded_count := excluded_count + 1;
        reasons_value := reasons_value || jsonb_build_array(outcome_value);
      end if;
    end if;

    insert into public.email_audience_import_rows (
      import_id,
      row_number,
      email,
      outcome,
      reasons,
      contact_id,
      enrollment_id,
      payload
    ) values (
      import_uuid,
      row_number_value,
      nullif(email_value, ''),
      outcome_value,
      reasons_value,
      contact_uuid,
      enrollment_uuid,
      row_data - array['reasons', 'outcome']::text[]
    );
  end loop;

  result_value := jsonb_build_object(
    'import_id', import_uuid,
    'campaign_id', p_campaign_id,
    'start_at', p_start_at,
    'total_records', total_count,
    'preview_eligible_records', preview_eligible_count,
    'enrolled_contacts', enrolled_count,
    'existing_enrollments', existing_enrollment_count,
    'excluded_at_commit', excluded_count,
    'idempotent_replay', false
  );

  update public.email_audience_imports
  set
    status = 'completed',
    total_records = total_count,
    preview_eligible_records = preview_eligible_count,
    enrolled_contacts = enrolled_count,
    existing_enrollments = existing_enrollment_count,
    excluded_at_commit = excluded_count,
    result = result_value,
    completed_at = now()
  where id = import_uuid;

  return result_value;
end;
$$;

revoke all on function public.commit_email_audience_import(text, timestamptz, jsonb, text, text, text, text) from public, anon, authenticated;
grant execute on function public.commit_email_audience_import(text, timestamptz, jsonb, text, text, text, text) to service_role;

commit;
