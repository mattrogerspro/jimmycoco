-- PREPARED ONLY — DO NOT APPLY WITHOUT EXPLICIT HUMAN APPROVAL.
-- Seeds two disabled application-managed UK professional follow-up campaigns.
-- Existing email_enrollments, email_messages and email_business_events tables
-- already provide durable manual start, stop and history records; no new table is required.

begin;

insert into public.email_campaigns (id, name, market, mode, classification, definition_version, enabled, timezone, local_send_hour, config)
values
  ('uk-pro-trial-follow-up', 'UK Pro Trial Follow-Up — Manual Start', 'UK', 'sequence', 'promotional', '2026-08-19.1', false, 'Europe/London', 10, '{"manual_start":true,"supersedes_campaigns":["uk-salon-stockist"]}'::jsonb),
  ('uk-pro-order-follow-up', 'UK Pro Order Follow-Up — Manual Start', 'UK', 'sequence', 'promotional', '2026-08-19.1', false, 'Europe/London', 10, '{"manual_start":true,"supersedes_campaigns":["uk-salon-stockist"]}'::jsonb)
on conflict (id) do update set
  name = excluded.name,
  market = excluded.market,
  mode = excluded.mode,
  classification = excluded.classification,
  definition_version = excluded.definition_version,
  timezone = excluded.timezone,
  local_send_hour = excluded.local_send_hour,
  config = excluded.config;

insert into public.email_campaign_steps (campaign_id, step_key, step_number, day_offset, trigger_name, template_alias, template_id, classification, subject, required_variables)
values
  ('uk-pro-trial-follow-up', '01-test-plan', 1, 0, null, 'jc-uk-trial-follow-up-01-test-plan', null, 'promotional', 'A real-client test, at your pace', '["FIRST_NAME","BUSINESS_NAME"]'::jsonb),
  ('uk-pro-trial-follow-up', '02-result-review', 2, 5, null, 'jc-uk-trial-follow-up-02-result-review', null, 'promotional', 'What to notice in the first result', '["FIRST_NAME","BUSINESS_NAME"]'::jsonb),
  ('uk-pro-trial-follow-up', '03-service-maths', 3, 12, null, 'jc-uk-trial-follow-up-03-service-maths', null, 'promotional', 'The service maths after a good test', '["FIRST_NAME"]'::jsonb),
  ('uk-pro-trial-follow-up', '04-next-step', 4, 21, null, 'jc-uk-trial-follow-up-04-next-step', null, 'promotional', 'The next step is yours', '["FIRST_NAME","BUSINESS_NAME"]'::jsonb),
  ('uk-pro-order-follow-up', '01-first-service', 1, 0, null, 'jc-uk-order-follow-up-01-first-service', null, 'promotional', 'A considered first professional service', '["FIRST_NAME"]'::jsonb),
  ('uk-pro-order-follow-up', '02-client-experience', 2, 4, null, 'jc-uk-order-follow-up-02-client-experience', null, 'promotional', 'Preparing the client experience', '["FIRST_NAME"]'::jsonb),
  ('uk-pro-order-follow-up', '03-retail', 3, 11, null, 'jc-uk-order-follow-up-03-retail', null, 'promotional', 'The conversation after the mirror', '["FIRST_NAME"]'::jsonb),
  ('uk-pro-order-follow-up', '04-next-step', 4, 21, null, 'jc-uk-order-follow-up-04-next-step', null, 'promotional', 'Your next professional step', '["FIRST_NAME"]'::jsonb)
on conflict (campaign_id, step_key) do update set
  step_number = excluded.step_number,
  day_offset = excluded.day_offset,
  trigger_name = excluded.trigger_name,
  template_alias = excluded.template_alias,
  template_id = excluded.template_id,
  classification = excluded.classification,
  subject = excluded.subject,
  required_variables = excluded.required_variables;

commit;
