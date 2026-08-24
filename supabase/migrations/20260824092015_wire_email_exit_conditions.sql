-- PREPARED ONLY - DO NOT APPLY WITHOUT EXPLICIT HUMAN APPROVAL.
-- Wires every production outreach exit condition to the canonical database
-- state, and makes send-time eligibility enforceable by the worker.

begin;

alter table public.email_contacts
  drop constraint if exists email_contacts_marketing_status_check;

alter table public.email_contacts
  add constraint email_contacts_marketing_status_check
  check (marketing_status in ('unknown', 'eligible', 'unsubscribed', 'ineligible'));

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
  select id into contact_uuid
  from public.email_contacts
  where email = lower(trim(p_email));

  if contact_uuid is null then
    return 0;
  end if;

  insert into public.email_business_events (external_event_id, contact_id, campaign_id, enrollment_id, event_type, data)
  select
    case when p_external_event_id is null then null else p_external_event_id || '/' || e.id::text end,
    contact_uuid,
    e.campaign_id,
    e.id,
    p_event_type,
    coalesce(p_data, '{}'::jsonb)
  from public.email_enrollments e
  where e.contact_id = contact_uuid
    and e.status in ('active', 'paused', 'needs_attention')
  on conflict (external_event_id) do nothing;

  update public.email_enrollments
  set status = 'exited',
      exited_at = now(),
      exit_reason = p_reason,
      next_send_at = null,
      locked_at = null,
      locked_by = null
  where contact_id = contact_uuid
    and status in ('active', 'paused', 'needs_attention');

  get diagnostics affected = row_count;
  return affected;
end;
$$;

create or replace function public.exit_email_contact_outreach(
  p_email text,
  p_reason text,
  p_event_type text,
  p_external_event_id text default null,
  p_data jsonb default '{}'::jsonb
) returns integer
language sql security definer set search_path = '' as $$
  select public.exit_email_enrollments(
    lower(trim(p_email)),
    p_reason,
    p_event_type,
    p_external_event_id,
    coalesce(p_data, '{}'::jsonb)
  );
$$;

create or replace function private.exit_email_outreach_from_application()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.wants_trial = true
     and (tg_op = 'INSERT' or old.wants_trial is distinct from new.wants_trial) then
    perform public.exit_email_contact_outreach(
      new.email::text,
      'trial_requested',
      'trial_requested',
      'reseller-application/' || new.id::text || '/trial_requested',
      jsonb_build_object(
        'source', 'reseller_applications_trigger',
        'application_id', new.id,
        'business_name', new.business_name,
        'market', new.market,
        'origin_campaign', new.metadata ->> 'origin_campaign',
        'origin_email', new.metadata ->> 'origin_email',
        'origin_market', new.metadata ->> 'origin_market',
        'service_state', new.metadata ->> 'service_state',
        'serviceability_status', new.metadata ->> 'serviceability_status'
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists reseller_applications_exit_email_outreach on public.reseller_applications;
create trigger reseller_applications_exit_email_outreach
after insert or update of wants_trial on public.reseller_applications
for each row execute function private.exit_email_outreach_from_application();

create or replace function private.exit_email_outreach_from_reseller()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'active'
     and (tg_op = 'INSERT' or old.status is distinct from new.status or old.email is distinct from new.email) then
    perform public.exit_email_contact_outreach(
      new.email::text,
      'existing_customer',
      'existing_customer',
      'reseller/' || new.id::text || '/existing_customer',
      jsonb_build_object(
        'source', 'resellers_trigger',
        'reseller_id', new.id,
        'business_name', new.business_name,
        'market', new.market
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists resellers_exit_email_outreach on public.resellers;
create trigger resellers_exit_email_outreach
after insert or update of status, email on public.resellers
for each row execute function private.exit_email_outreach_from_reseller();

create or replace function private.exit_email_outreach_from_order()
returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  reseller_email text;
  reseller_business text;
  reseller_market text;
begin
  select r.email::text, r.business_name, r.market
  into reseller_email, reseller_business, reseller_market
  from public.resellers r
  where r.id = new.reseller_id;

  if reseller_email is not null then
    perform public.exit_email_contact_outreach(
      reseller_email,
      'opening_order_placed',
      'opening_order_placed',
      'reseller-order/' || new.id::text || '/opening_order_placed',
      jsonb_build_object(
        'source', 'reseller_orders_trigger',
        'order_id', new.id,
        'order_reference', new.reference,
        'order_status', new.status,
        'business_name', reseller_business,
        'market', reseller_market
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists reseller_orders_exit_email_outreach on public.reseller_orders;
create trigger reseller_orders_exit_email_outreach
after insert on public.reseller_orders
for each row execute function private.exit_email_outreach_from_order();

create or replace function private.exit_email_outreach_from_suppression()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.scope in ('marketing', 'global') then
    perform public.exit_email_contact_outreach(
      new.email::text,
      new.reason,
      new.reason,
      'email-suppression/' || md5(lower(new.email::text) || '/' || new.scope || '/' || new.reason),
      jsonb_build_object(
        'source', coalesce(new.source, 'email_suppressions_trigger'),
        'scope', new.scope,
        'reason', new.reason,
        'metadata', new.metadata
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists email_suppressions_exit_email_outreach on public.email_suppressions;
create trigger email_suppressions_exit_email_outreach
after insert or update of reason, source, metadata on public.email_suppressions
for each row execute function private.exit_email_outreach_from_suppression();

create or replace function private.exit_email_outreach_from_ineligible_contact()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.marketing_status = 'ineligible'
     or lower(coalesce(new.properties ->> 'eligibility_decision', new.properties ->> 'eligibilityDecision', '')) = 'ineligible' then
    perform public.exit_email_contact_outreach(
      new.email::text,
      'ineligible',
      'ineligible',
      'email-contact/' || new.id::text || '/ineligible',
      jsonb_build_object(
        'source', 'email_contacts_trigger',
        'contact_id', new.id,
        'marketing_status', new.marketing_status,
        'eligibility_decision', coalesce(new.properties ->> 'eligibility_decision', new.properties ->> 'eligibilityDecision')
      )
    );
  end if;
  return new;
end;
$$;

drop trigger if exists email_contacts_exit_email_outreach on public.email_contacts;
create trigger email_contacts_exit_email_outreach
after insert or update of marketing_status, properties on public.email_contacts
for each row execute function private.exit_email_outreach_from_ineligible_contact();

revoke all on function public.exit_email_enrollments(text, text, text, text, jsonb) from public, anon, authenticated;
revoke all on function public.exit_email_contact_outreach(text, text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.exit_email_enrollments(text, text, text, text, jsonb) to service_role;
grant execute on function public.exit_email_contact_outreach(text, text, text, text, jsonb) to service_role;

commit;
