-- PREPARED ONLY - DO NOT APPLY WITHOUT EXPLICIT HUMAN APPROVAL.
-- Converts the two existing manual follow-up campaigns to repository-rendered
-- delivery, adds the missing calculator PDF follow-up, and clears the remaining
-- active lifecycle Resend Template IDs. Follow-up campaign gates remain disabled.

begin;

insert into public.email_campaigns (
  id, name, market, mode, classification, definition_version,
  enabled, timezone, local_send_hour, config
)
values
  (
    'uk-pro-trial-follow-up',
    'UK Pro Trial Follow-Up — Manual Start',
    'UK', 'sequence', 'promotional', '2026-08-24.2', false,
    'Europe/London', 10,
    '{"manual_start":true,"renderer":"repository","supersedes_campaigns":["uk-salon-stockist"]}'::jsonb
  ),
  (
    'uk-calculator-follow-up',
    'UK Calculator PDF Follow-Up — Manual Start',
    'UK', 'sequence', 'promotional', '2026-08-24.1', false,
    'Europe/London', 10,
    '{"manual_start":true,"renderer":"repository","source":"pro-site-calculator-report","supersedes_campaigns":["uk-salon-stockist"]}'::jsonb
  ),
  (
    'uk-pro-order-follow-up',
    'UK Pro Order Follow-Up — Manual Start',
    'UK', 'sequence', 'promotional', '2026-08-24.2', false,
    'Europe/London', 10,
    '{"manual_start":true,"renderer":"repository","supersedes_campaigns":["uk-salon-stockist"]}'::jsonb
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
  config = coalesce(public.email_campaigns.config, '{}'::jsonb) || excluded.config;

insert into public.email_campaign_steps (
  campaign_id, step_key, step_number, day_offset, trigger_name,
  template_alias, template_id, classification, subject, required_variables
)
values
  ('uk-pro-trial-follow-up', '01-test-plan', 1, 0, null, 'jc-uk-trial-follow-up-01-test-plan', null, 'promotional', 'A real-client test, at your pace', '["GREETING_NAME","BUSINESS_NAME","PREFERENCES_LINK"]'::jsonb),
  ('uk-pro-trial-follow-up', '02-result-review', 2, 5, null, 'jc-uk-trial-follow-up-02-result-review', null, 'promotional', 'What to notice in the first result', '["GREETING_NAME","PREFERENCES_LINK"]'::jsonb),
  ('uk-pro-trial-follow-up', '03-service-maths', 3, 12, null, 'jc-uk-trial-follow-up-03-service-maths', null, 'promotional', 'The service maths after a good test', '["GREETING_NAME","PREFERENCES_LINK"]'::jsonb),
  ('uk-pro-trial-follow-up', '04-next-step', 4, 21, null, 'jc-uk-trial-follow-up-04-next-step', null, 'promotional', 'The next step is yours', '["GREETING_NAME","BUSINESS_NAME","PREFERENCES_LINK"]'::jsonb),
  ('uk-calculator-follow-up', '01-your-numbers', 1, 1, null, 'jc-uk-calculator-follow-up-01-your-numbers', null, 'promotional', 'What your spray-tan numbers are really showing', '["GREETING_NAME","BUSINESS_NAME","MONTHLY_PROFIT","LITRES_PER_MONTH","CALCULATOR_LINK","PREFERENCES_LINK"]'::jsonb),
  ('uk-calculator-follow-up', '02-margin-levers', 2, 4, null, 'jc-uk-calculator-follow-up-02-margin-levers', null, 'promotional', 'The three levers behind your spray-tan margin', '["GREETING_NAME","BUSINESS_NAME","TANS_PER_WEEK","CALCULATOR_LINK","PREFERENCES_LINK"]'::jsonb),
  ('uk-calculator-follow-up', '03-test-the-result', 3, 9, null, 'jc-uk-calculator-follow-up-03-test-the-result', null, 'promotional', 'The numbers matter—but the client result comes first', '["GREETING_NAME","BUSINESS_NAME","TRIAL_LINK","PREFERENCES_LINK"]'::jsonb),
  ('uk-calculator-follow-up', '04-next-step', 4, 16, null, 'jc-uk-calculator-follow-up-04-next-step', null, 'promotional', 'Your next step from the profit plan', '["GREETING_NAME","BUSINESS_NAME","CALCULATOR_LINK","TRIAL_LINK","ORDER_LINK","PREFERENCES_LINK"]'::jsonb),
  ('uk-pro-order-follow-up', '01-first-service', 1, 0, null, 'jc-uk-order-follow-up-01-first-service', null, 'promotional', 'A considered first professional service', '["GREETING_NAME","PREFERENCES_LINK"]'::jsonb),
  ('uk-pro-order-follow-up', '02-client-experience', 2, 4, null, 'jc-uk-order-follow-up-02-client-experience', null, 'promotional', 'Preparing the client experience', '["GREETING_NAME","PREFERENCES_LINK"]'::jsonb),
  ('uk-pro-order-follow-up', '03-retail', 3, 11, null, 'jc-uk-order-follow-up-03-retail', null, 'promotional', 'The conversation after the mirror', '["GREETING_NAME","PREFERENCES_LINK"]'::jsonb),
  ('uk-pro-order-follow-up', '04-next-step', 4, 21, null, 'jc-uk-order-follow-up-04-next-step', null, 'promotional', 'Your next professional step', '["GREETING_NAME","PREFERENCES_LINK"]'::jsonb)
on conflict (campaign_id, step_key) do update set
  step_number = excluded.step_number,
  day_offset = excluded.day_offset,
  trigger_name = excluded.trigger_name,
  template_alias = excluded.template_alias,
  template_id = null,
  classification = excluded.classification,
  subject = excluded.subject,
  required_variables = excluded.required_variables;

-- Remove any stale step left behind by an earlier draft without touching sent
-- message history, which references its own copied step key and subject.
delete from public.email_campaign_steps
where campaign_id = 'uk-calculator-follow-up'
  and step_key not in ('01-your-numbers', '02-margin-levers', '03-test-the-result', '04-next-step');

update public.email_campaign_steps
set
  template_alias = case step_key
    when 'trial-request-received' then 'jc-transactional-free-sample-request-received-v2'
    when 'internal-notice' then 'jc-transactional-free-sample-internal-notice-v2'
    else template_alias
  end,
  template_id = null,
  required_variables = case step_key
    when 'trial-request-received' then '["CONTACT_NAME","SALON_NAME","SENDER_NAME","SENDER_TITLE","PREFERENCES_LINK"]'::jsonb
    when 'internal-notice' then '["REQUEST_TYPE","SALON_NAME","CONTACT_NAME","CONTACT_EMAIL","BUSINESS_TYPE","SUBMISSION_SUMMARY","ADMIN_LINK","SENDER_NAME","SENDER_TITLE","PREFERENCES_LINK"]'::jsonb
    else required_variables
  end
where campaign_id = 'uk-reseller-lifecycle'
  and step_key in ('trial-request-received', 'internal-notice');

do $$
declare
  invalid_campaigns integer;
  invalid_steps integer;
begin
  select count(*) into invalid_campaigns
  from public.email_campaigns
  where id in ('uk-pro-trial-follow-up', 'uk-calculator-follow-up', 'uk-pro-order-follow-up')
    and enabled is distinct from false;

  select count(*) into invalid_steps
  from public.email_campaign_steps
  where (
      campaign_id in ('uk-pro-trial-follow-up', 'uk-calculator-follow-up', 'uk-pro-order-follow-up')
      or (campaign_id = 'uk-reseller-lifecycle' and step_key in ('trial-request-received', 'internal-notice'))
    )
    and template_id is not null;

  if invalid_campaigns <> 0 or invalid_steps <> 0 then
    raise exception 'repository_follow_up_campaign_verification_failed';
  end if;
end;
$$;

commit;
