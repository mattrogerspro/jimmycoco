-- Replaces the row-by-row audience-import commit path with a set-based transaction.
-- The earlier implementation evaluated several eligibility lookups for every CSV row
-- using lower(email::text), which bypassed lookup indexes and could exceed the
-- PostgREST statement-time budget on a realistic audience file.
begin;

-- These indexes protect the two lookups not fully covered by the existing keys.
create index if not exists email_enrollments_active_campaign_contact
  on public.email_enrollments (campaign_id, contact_id)
  where status in ('active', 'paused', 'needs_attention');

create index if not exists email_audience_import_rows_import_email_outcome
  on public.email_audience_import_rows (import_id, email, outcome);

-- The production schema stores email addresses as text. Match on normalized values
-- and add corresponding functional indexes instead of depending on citext.
create index if not exists email_contacts_email_lower
  on public.email_contacts ((lower(email::text)));
create index if not exists resellers_email_lower
  on public.resellers ((lower(email::text)));
create index if not exists reseller_applications_email_lower_trial
  on public.reseller_applications ((lower(email::text)))
  where wants_trial = true;
create index if not exists email_suppressions_email_lower_scope
  on public.email_suppressions ((lower(email::text)), scope);

-- Keep the preview endpoint fast as files grow using the lowercase functional indexes.
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

  create temporary table audience_import_stage (
    row_number integer not null,
    email text,
    outcome text not null,
    reasons jsonb not null,
    first_name text,
    greeting_name text,
    business_name text,
    business_type text,
    market text,
    timezone text,
    company_legal_entity_type text,
    source text,
    source_date text,
    owner text,
    eligibility_decision text,
    eligibility_reason text,
    lawful_basis text,
    preview_eligible boolean not null default false,
    contact_id uuid,
    enrollment_id uuid
  ) on commit drop;

  insert into audience_import_stage (
    row_number,
    email,
    outcome,
    reasons,
    first_name,
    greeting_name,
    business_name,
    business_type,
    market,
    timezone,
    company_legal_entity_type,
    source,
    source_date,
    owner,
    eligibility_decision,
    eligibility_reason,
    lawful_basis,
    preview_eligible
  )
  select
    source_rows.row_number,
    nullif(lower(btrim(source_rows.email)), ''),
    coalesce(nullif(btrim(source_rows.outcome), ''), 'invalid'),
    coalesce(source_rows.reasons, '[]'::jsonb),
    nullif(btrim(source_rows.first_name), ''),
    nullif(btrim(source_rows.greeting_name), ''),
    nullif(btrim(source_rows.business_name), ''),
    nullif(btrim(source_rows.business_type), ''),
    nullif(btrim(source_rows.market), ''),
    nullif(btrim(source_rows.timezone), ''),
    nullif(btrim(source_rows.company_legal_entity_type), ''),
    nullif(btrim(source_rows.source), ''),
    nullif(btrim(source_rows.source_date), ''),
    nullif(btrim(source_rows.owner), ''),
    nullif(btrim(source_rows.eligibility_decision), ''),
    nullif(btrim(source_rows.eligibility_reason), ''),
    nullif(btrim(source_rows.lawful_basis), ''),
    coalesce(nullif(btrim(source_rows.outcome), ''), 'invalid') = 'eligible'
  from jsonb_to_recordset(p_rows) as source_rows(
    row_number integer,
    email text,
    outcome text,
    reasons jsonb,
    first_name text,
    greeting_name text,
    business_name text,
    business_type text,
    market text,
    timezone text,
    company_legal_entity_type text,
    source text,
    source_date text,
    owner text,
    eligibility_decision text,
    eligibility_reason text,
    lawful_basis text
  );

  if exists (
    select 1
    from audience_import_stage
    group by row_number
    having count(*) > 1
  ) then
    raise exception 'audience_import_duplicate_row_number';
  end if;

  -- Evaluate all write-time eligibility gates in one query. This preserves the
  -- preview-first safety model while eliminating repeated unindexed scans.
  with candidates as (
    select
      stage.row_number,
      case
        when stage.email is null
          or stage.business_name is null
          or stage.business_type is null
          or stage.timezone is null
          or stage.source is null
          or stage.source_date is null
          or stage.owner is null
          or stage.company_legal_entity_type not in (
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
          or stage.eligibility_decision <> 'eligible'
          or (stage.eligibility_reason is null and stage.lawful_basis is null)
          then 'invalid_at_commit'
        when not exists (
          select 1
          from pg_catalog.pg_timezone_names timezone_record
          where timezone_record.name = stage.timezone
        ) then 'invalid_timezone_at_commit'
        when stage.source_date !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then 'invalid_source_date_at_commit'
        when stage.source_date > current_date::text then 'future_source_date_at_commit'
        when stage.market <> campaign_market then 'market_mismatch_at_commit'
        when campaign_market = 'UK'
          and stage.company_legal_entity_type in ('individual', 'sole_trader', 'unincorporated_partnership')
          then 'uk_individual_subscriber_at_commit'
        when contact.marketing_status = 'unsubscribed'
          or exists (
            select 1
            from public.email_suppressions suppression
            where lower(suppression.email::text) = stage.email
              and suppression.scope in ('marketing', 'global')
          ) then 'suppressed_at_commit'
        when exists (
          select 1
          from public.resellers reseller
          where lower(reseller.email::text) = stage.email
        ) then 'existing_customer_at_commit'
        when exists (
          select 1
          from public.reseller_applications application
          where lower(application.email::text) = stage.email
            and application.wants_trial = true
        ) then 'existing_trial_applicant_at_commit'
        when count(*) over (partition by stage.email) > 1
          and stage.row_number <> min(stage.row_number) over (partition by stage.email)
          then 'duplicate_at_commit'
        when exists (
          select 1
          from public.email_enrollments enrollment
          where enrollment.campaign_id = p_campaign_id
            and enrollment.contact_id = contact.id
            and enrollment.status in ('active', 'paused', 'needs_attention')
        ) then 'already_enrolled'
        else 'eligible'
      end as final_outcome
    from audience_import_stage stage
    left join public.email_contacts contact
      on lower(contact.email::text) = stage.email
    where stage.preview_eligible
  )
  update audience_import_stage stage
  set
    outcome = candidates.final_outcome,
    reasons = case
      when candidates.final_outcome in ('eligible', 'already_enrolled') then stage.reasons
      else stage.reasons || jsonb_build_array(candidates.final_outcome)
    end
  from candidates
  where stage.row_number = candidates.row_number;

  with upserted_contacts as (
    insert into public.email_contacts (
      email,
      first_name,
      business_name,
      market,
      timezone,
      marketing_status,
      properties
    )
    select
      stage.email,
      stage.first_name,
      stage.business_name,
      campaign_market,
      stage.timezone,
      'eligible',
      jsonb_build_object(
        'greeting_name', coalesce(stage.greeting_name, 'Salon Owner'),
        'business_type', stage.business_type,
        'company_legal_entity_type', stage.company_legal_entity_type,
        'source', stage.source,
        'source_date', stage.source_date,
        'eligibility_decision', stage.eligibility_decision,
        'eligibility_reason', stage.eligibility_reason,
        'lawful_basis', stage.lawful_basis,
        'audience_import_id', import_uuid,
        'audience_imported_at', now()
      )
    from audience_import_stage stage
    where stage.outcome = 'eligible'
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
    returning id, email
  )
  update audience_import_stage stage
  set contact_id = upserted_contacts.id
  from upserted_contacts
  where stage.outcome = 'eligible'
    and stage.email = upserted_contacts.email;

  with inserted_enrollments as (
    insert into public.email_enrollments (
      campaign_id,
      contact_id,
      status,
      next_step,
      next_send_at,
      owner,
      context
    )
    select
      p_campaign_id,
      stage.contact_id,
      'active',
      1,
      p_start_at,
      stage.owner,
      jsonb_build_object(
        'greeting_name', coalesce(stage.greeting_name, 'Salon Owner'),
        'business_type', stage.business_type,
        'company_legal_entity_type', stage.company_legal_entity_type,
        'source', stage.source,
        'source_date', stage.source_date,
        'eligibility_decision', stage.eligibility_decision,
        'eligibility_reason', stage.eligibility_reason,
        'lawful_basis', stage.lawful_basis,
        'audience_import_id', import_uuid,
        'audience_imported_at', now()
      )
    from audience_import_stage stage
    where stage.outcome = 'eligible'
    on conflict (campaign_id, contact_id)
      where status in ('active', 'paused', 'needs_attention')
      do nothing
    returning id, contact_id
  )
  update audience_import_stage stage
  set
    enrollment_id = inserted_enrollments.id,
    outcome = 'enrolled'
  from inserted_enrollments
  where stage.outcome = 'eligible'
    and stage.contact_id = inserted_enrollments.contact_id;

  update audience_import_stage stage
  set
    enrollment_id = enrollment.id,
    outcome = 'already_enrolled'
  from public.email_enrollments enrollment
  where stage.outcome = 'eligible'
    and enrollment.campaign_id = p_campaign_id
    and enrollment.contact_id = stage.contact_id
    and enrollment.status in ('active', 'paused', 'needs_attention');

  insert into public.email_audience_import_rows (
    import_id,
    row_number,
    email,
    outcome,
    reasons,
    contact_id,
    enrollment_id,
    payload
  )
  select
    import_uuid,
    stage.row_number,
    stage.email,
    stage.outcome,
    stage.reasons,
    stage.contact_id,
    stage.enrollment_id,
    jsonb_strip_nulls(jsonb_build_object(
      'first_name', stage.first_name,
      'greeting_name', stage.greeting_name,
      'business_name', stage.business_name,
      'business_type', stage.business_type,
      'market', stage.market,
      'timezone', stage.timezone,
      'company_legal_entity_type', stage.company_legal_entity_type,
      'source', stage.source,
      'source_date', stage.source_date,
      'owner', stage.owner,
      'eligibility_decision', stage.eligibility_decision,
      'eligibility_reason', stage.eligibility_reason,
      'lawful_basis', stage.lawful_basis
    ))
  from audience_import_stage stage;

  select
    count(*),
    count(*) filter (where preview_eligible),
    count(*) filter (where outcome = 'enrolled'),
    count(*) filter (where outcome = 'already_enrolled' and preview_eligible),
    count(*) filter (
      where preview_eligible
        and outcome not in ('enrolled', 'already_enrolled')
    )
  into
    total_count,
    preview_eligible_count,
    enrolled_count,
    existing_enrollment_count,
    excluded_count
  from audience_import_stage;

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

revoke all on function public.preview_email_audience_state(text, text[]) from public, anon, authenticated;
grant execute on function public.preview_email_audience_state(text, text[]) to service_role;
revoke all on function public.commit_email_audience_import(text, timestamptz, jsonb, text, text, text, text) from public, anon, authenticated;
grant execute on function public.commit_email_audience_import(text, timestamptz, jsonb, text, text, text, text) to service_role;

commit;
