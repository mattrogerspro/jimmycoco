-- PREPARED ONLY — DO NOT APPLY WITHOUT EXPLICIT HUMAN APPROVAL.
-- Seeds the disabled, application-managed UK and U.S. West Coast production
-- outreach sequences and aligns their reporting views with the live Studio.

begin;

insert into public.email_campaigns (
  id,
  name,
  market,
  mode,
  classification,
  definition_version,
  enabled,
  timezone,
  local_send_hour,
  config
)
values
  (
    'uk-salon-stockist',
    'UK Jimmy Coco Pro Recruitment — 28-Day Seven Email',
    'UK',
    'sequence',
    'promotional',
    '2026-08-24.1',
    false,
    'Europe/London',
    10,
    '{"reporting":{"delivered":true,"opens":true,"clicks":true}}'::jsonb
  ),
  (
    'us-west-coast-salon-stockist',
    'US West Coast Jimmy Coco Pro Recruitment — V2 — Seven Email',
    'US-West-Coast',
    'sequence',
    'promotional',
    '2026-08-24.2',
    false,
    'America/Los_Angeles',
    10,
    '{"reporting":{"delivered":true,"opens":true,"clicks":true}}'::jsonb
  )
on conflict (id) do update set
  name = excluded.name,
  market = excluded.market,
  mode = excluded.mode,
  classification = excluded.classification,
  definition_version = excluded.definition_version,
  enabled = false,
  timezone = excluded.timezone,
  local_send_hour = excluded.local_send_hour,
  config = coalesce(email_campaigns.config, '{}'::jsonb) || excluded.config,
  updated_at = now();

insert into public.email_campaign_steps (
  campaign_id,
  step_key,
  step_number,
  day_offset,
  trigger_name,
  template_alias,
  template_id,
  classification,
  subject,
  required_variables
)
values
  ('uk-salon-stockist', '01-trial', 1, 0, null, 'jc-uk-prospect-01-trial-v2', null, 'promotional', 'Complimentary Jimmy Coco professional trial for {{BUSINESS_NAME}}', '["GREETING_NAME","PREFERENCES_LINK","BUSINESS_NAME","BUSINESS_TYPE","TRIAL_LINK"]'::jsonb),
  ('uk-salon-stockist', '02-result', 2, 3, null, 'jc-uk-prospect-02-result-v2', null, 'promotional', 'The formula details clients notice after their tan', '["GREETING_NAME","PREFERENCES_LINK","BUSINESS_NAME","TRIAL_LINK"]'::jsonb),
  ('uk-salon-stockist', '03-economics', 3, 6, null, 'jc-uk-prospect-03-economics-v2', null, 'promotional', 'The salon maths behind a premium tan (£2.14 per treatment)', '["GREETING_NAME","PREFERENCES_LINK","BUSINESS_NAME","TRIAL_LINK"]'::jsonb),
  ('uk-salon-stockist', '04-retail', 4, 10, null, 'jc-uk-prospect-04-retail-v2', null, 'promotional', 'The second revenue moment after the treatment', '["GREETING_NAME","PREFERENCES_LINK","BUSINESS_NAME","TRIAL_LINK"]'::jsonb),
  ('uk-salon-stockist', '05-trial-guide', 5, 15, null, 'jc-uk-prospect-06-process-v2', null, 'promotional', 'What to look for when you test Jimmy Coco Pro', '["GREETING_NAME","PREFERENCES_LINK","BUSINESS_NAME","TRIAL_LINK"]'::jsonb),
  ('uk-salon-stockist', '06-onboarding', 6, 21, null, 'jc-uk-prospect-07-choice-v2', null, 'promotional', 'How to introduce Jimmy Coco Pro to your treatment menu', '["GREETING_NAME","PREFERENCES_LINK","BUSINESS_NAME","TRIAL_LINK"]'::jsonb),
  ('uk-salon-stockist', '07-close', 7, 28, null, 'jc-uk-prospect-05-close-v2', null, 'promotional', 'Shall I close your file for now, {{GREETING_NAME}}?', '["GREETING_NAME","PREFERENCES_LINK","BUSINESS_NAME","TRIAL_LINK"]'::jsonb),
  ('us-west-coast-salon-stockist', '01-trial', 1, 0, null, 'jc-us-wc-prospect-01-trial-v2', null, 'promotional', 'A premium spray-tan service — with a second client-care moment after the appointment', '["GREETING_NAME","PREFERENCES_LINK","BUSINESS_NAME","BUSINESS_TYPE","SENDER_NAME","SENDER_TITLE","TRIAL_LINK"]'::jsonb),
  ('us-west-coast-salon-stockist', '02-result', 2, 3, null, 'jc-us-wc-prospect-02-result-v2', null, 'promotional', 'The result is what gives a premium tan its value', '["GREETING_NAME","PREFERENCES_LINK","SENDER_NAME","SENDER_TITLE","TRIAL_LINK"]'::jsonb),
  ('us-west-coast-salon-stockist', '03-retail', 3, 6, null, 'jc-us-wc-prospect-03-retail-v2', null, 'promotional', 'The commercial question is not “what does it cost?” It is “what can the service support?”', '["GREETING_NAME","PREFERENCES_LINK","SENDER_NAME","SENDER_TITLE","TRIAL_LINK"]'::jsonb),
  ('us-west-coast-salon-stockist', '04-partner-path', 4, 10, null, 'jc-us-wc-prospect-04-partner-path-v2', null, 'promotional', 'One client relationship. Two useful revenue moments.', '["GREETING_NAME","PREFERENCES_LINK","SENDER_NAME","SENDER_TITLE","TRIAL_LINK"]'::jsonb),
  ('us-west-coast-salon-stockist', '06-process', 5, 15, null, 'jc-us-wc-prospect-06-process-v2', null, 'promotional', 'What happens after you request information?', '["GREETING_NAME","PREFERENCES_LINK","SENDER_NAME","SENDER_TITLE","TRIAL_LINK"]'::jsonb),
  ('us-west-coast-salon-stockist', '07-choice', 6, 21, null, 'jc-us-wc-prospect-07-choice-v2', null, 'promotional', 'Would more detail be useful?', '["GREETING_NAME","PREFERENCES_LINK","SENDER_NAME","SENDER_TITLE","TRIAL_LINK"]'::jsonb),
  ('us-west-coast-salon-stockist', '05-close', 7, 28, null, 'jc-us-wc-prospect-05-close-v2', null, 'promotional', 'Shall I close this for now?', '["GREETING_NAME","PREFERENCES_LINK","BUSINESS_NAME","SENDER_NAME","SENDER_TITLE","TRIAL_LINK"]'::jsonb)
on conflict (campaign_id, step_key) do update set
  step_number = excluded.step_number,
  day_offset = excluded.day_offset,
  trigger_name = excluded.trigger_name,
  template_alias = excluded.template_alias,
  template_id = excluded.template_id,
  classification = excluded.classification,
  subject = excluded.subject,
  required_variables = excluded.required_variables;

-- The original baseline seeded one obsolete UK `pilot` step. Removing every
-- non-canonical row leaves message history untouched because email_messages
-- stores its own immutable step metadata and has no step-row foreign key.
delete from public.email_campaign_steps
where campaign_id = 'uk-salon-stockist'
  and step_key not in (
    '01-trial',
    '02-result',
    '03-economics',
    '04-retail',
    '05-trial-guide',
    '06-onboarding',
    '07-close'
  );

delete from public.email_campaign_steps
where campaign_id = 'us-west-coast-salon-stockist'
  and step_key not in (
    '01-trial',
    '02-result',
    '03-retail',
    '04-partner-path',
    '06-process',
    '07-choice',
    '05-close'
  );

create or replace view public.email_campaign_stats
with (security_invoker = true)
as
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
  count(distinct be.id) filter (
    where be.event_type in ('sample_requested', 'trial_requested', 'call_booked', 'opening_order_placed')
  ) as conversions,
  max(coalesce(m.sent_at, m.created_at)) as last_activity_at,
  c.config -> 'reporting' as reporting
from public.email_campaigns c
left join public.email_messages m on m.campaign_id = c.id
left join public.email_enrollments e on e.campaign_id = c.id
left join public.email_business_events be on be.campaign_id = c.id
group by c.id, c.name, c.market, c.mode, c.enabled, c.config;

create or replace view public.email_step_stats
with (security_invoker = true)
as
select
  s.campaign_id,
  s.step_key,
  s.step_number,
  s.subject,
  s.template_alias,
  count(distinct m.id) filter (where m.sent_at is not null) as sent,
  count(distinct m.id) filter (where m.delivered_at is not null) as delivered,
  count(distinct m.id) filter (where m.first_opened_at is not null) as opened,
  count(distinct m.id) filter (where m.first_clicked_at is not null) as clicked,
  count(distinct m.id) filter (where m.bounced_at is not null) as bounced,
  count(distinct m.id) filter (where m.complained_at is not null) as complained,
  count(distinct m.id) filter (where m.failed_at is not null) as failed
from public.email_campaign_steps s
left join public.email_messages m
  on m.campaign_id = s.campaign_id
  and m.step_key = s.step_key
group by s.campaign_id, s.step_key, s.step_number, s.subject, s.template_alias;

revoke all on public.email_campaign_stats, public.email_step_stats from public, anon, authenticated;
grant select on public.email_campaign_stats, public.email_step_stats to service_role;

do $$
declare
  target_campaign_id text;
  actual_days integer[];
  actual_steps integer[];
begin
  foreach target_campaign_id in array array['uk-salon-stockist', 'us-west-coast-salon-stockist']
  loop
    if not exists (
      select 1
      from public.email_campaigns c
      where c.id = target_campaign_id
        and c.mode = 'sequence'
        and c.enabled = false
        and c.config @> '{"reporting":{"delivered":true,"opens":true,"clicks":true}}'::jsonb
    ) then
      raise exception 'production campaign % is missing, enabled, or reporting-disabled', target_campaign_id;
    end if;

    select
      array_agg(s.day_offset order by s.step_number),
      array_agg(s.step_number order by s.step_number)
    into actual_days, actual_steps
    from public.email_campaign_steps s
    where s.campaign_id = target_campaign_id;

    if actual_days is distinct from array[0, 3, 6, 10, 15, 21, 28]
      or actual_steps is distinct from array[1, 2, 3, 4, 5, 6, 7]
    then
      raise exception 'production campaign % does not contain the canonical seven-step cadence', target_campaign_id;
    end if;
  end loop;
end;
$$;

commit;
