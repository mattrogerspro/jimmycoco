-- PREPARED ONLY — DO NOT APPLY WITHOUT EXPLICIT HUMAN APPROVAL.
-- Reconciles the disabled UK and US prospect campaign definitions with the
-- application-managed repository HTML/text delivery path. Existing Resend
-- template IDs are deliberately removed from runtime step records.

begin;

insert into public.email_campaigns (
  id, name, market, mode, classification, definition_version, enabled,
  timezone, local_send_hour, config
)
values
  (
    'uk-salon-stockist',
    'UK Jimmy Coco Pro Recruitment — 28-Day Seven Email',
    'UK', 'sequence', 'promotional', '2026-08-23.1', false,
    'Europe/London', 10,
    '{"delivery_mode":"repository-html","content_source":"email/campaigns/uk-salon-stockist"}'::jsonb
  ),
  (
    'us-west-coast-salon-stockist',
    'US West Coast Jimmy Coco Pro Recruitment — V2 — Seven Email',
    'US-West-Coast', 'sequence', 'promotional', '2026-08-23.1', false,
    'America/Los_Angeles', 10,
    '{"delivery_mode":"repository-html","content_source":"email/campaigns/us-west-coast-salon-stockist"}'::jsonb
  )
on conflict (id) do update set
  name = excluded.name,
  market = excluded.market,
  mode = excluded.mode,
  classification = excluded.classification,
  definition_version = excluded.definition_version,
  timezone = excluded.timezone,
  local_send_hour = excluded.local_send_hour,
  config = excluded.config,
  updated_at = now();

-- Remove superseded definitions (for example the original UK one-step pilot)
-- so database inspection and reporting expose the same seven-step sequence as
-- the application registry. Historical email_messages rows are retained.
delete from public.email_campaign_steps
where campaign_id = 'uk-salon-stockist'
  and step_key not in ('01-trial', '02-result', '03-economics', '04-retail', '05-trial-guide', '06-onboarding', '07-close');

delete from public.email_campaign_steps
where campaign_id = 'us-west-coast-salon-stockist'
  and step_key not in ('01-trial', '02-result', '03-retail', '04-partner-path', '06-process', '07-choice', '05-close');

insert into public.email_campaign_steps (
  campaign_id, step_key, step_number, day_offset, trigger_name,
  template_alias, template_id, classification, subject, required_variables
)
values
  ('uk-salon-stockist', '01-trial', 1, 0, null, 'jc-uk-prospect-01-trial-v2', null, 'promotional', 'Complimentary Jimmy Coco professional trial for {{BUSINESS_NAME}}', '["BUSINESS_NAME","BUSINESS_TYPE","TRIAL_LINK"]'::jsonb),
  ('uk-salon-stockist', '02-result', 2, 3, null, 'jc-uk-prospect-02-result-v2', null, 'promotional', 'The formula details clients notice after their tan', '["BUSINESS_NAME","TRIAL_LINK"]'::jsonb),
  ('uk-salon-stockist', '03-economics', 3, 6, null, 'jc-uk-prospect-03-economics-v2', null, 'promotional', 'The salon maths behind a premium tan (£2.14 per treatment)', '["BUSINESS_NAME","TRIAL_LINK"]'::jsonb),
  ('uk-salon-stockist', '04-retail', 4, 10, null, 'jc-uk-prospect-04-retail-v2', null, 'promotional', 'The second revenue moment after the treatment', '["BUSINESS_NAME","TRIAL_LINK"]'::jsonb),
  ('uk-salon-stockist', '05-trial-guide', 5, 15, null, 'jc-uk-prospect-06-process-v2', null, 'promotional', 'What to look for when you test Jimmy Coco Pro', '["BUSINESS_NAME","TRIAL_LINK"]'::jsonb),
  ('uk-salon-stockist', '06-onboarding', 6, 21, null, 'jc-uk-prospect-07-choice-v2', null, 'promotional', 'How to introduce Jimmy Coco Pro to your treatment menu', '["BUSINESS_NAME","TRIAL_LINK"]'::jsonb),
  ('uk-salon-stockist', '07-close', 7, 28, null, 'jc-uk-prospect-05-close-v2', null, 'promotional', 'Shall I close your file for now, {{FIRST_NAME}}?', '["BUSINESS_NAME","TRIAL_LINK"]'::jsonb),
  ('us-west-coast-salon-stockist', '01-trial', 1, 0, null, 'jc-us-wc-prospect-01-trial-v2', null, 'promotional', 'A premium spray-tan service — with a second client-care moment after the appointment', '["BUSINESS_NAME","BUSINESS_TYPE","SENDER_NAME","SENDER_TITLE","TRIAL_LINK"]'::jsonb),
  ('us-west-coast-salon-stockist', '02-result', 2, 4, null, 'jc-us-wc-prospect-02-result-v2', null, 'promotional', 'The result is what gives a premium tan its value', '["SENDER_NAME","SENDER_TITLE","TRIAL_LINK"]'::jsonb),
  ('us-west-coast-salon-stockist', '03-retail', 3, 8, null, 'jc-us-wc-prospect-03-retail-v2', null, 'promotional', 'The commercial question is not “what does it cost?” It is “what can the service support?”', '["SENDER_NAME","SENDER_TITLE","TRIAL_LINK"]'::jsonb),
  ('us-west-coast-salon-stockist', '04-partner-path', 4, 13, null, 'jc-us-wc-prospect-04-partner-path-v2', null, 'promotional', 'One client relationship. Two useful revenue moments.', '["SENDER_NAME","SENDER_TITLE","TRIAL_LINK"]'::jsonb),
  ('us-west-coast-salon-stockist', '06-process', 5, 21, null, 'jc-us-wc-prospect-06-process-v2', null, 'promotional', 'What happens after you request information?', '["BUSINESS_NAME","SENDER_NAME","SENDER_TITLE","TRIAL_LINK"]'::jsonb),
  ('us-west-coast-salon-stockist', '07-choice', 6, 32, null, 'jc-us-wc-prospect-07-choice-v2', null, 'promotional', 'Would more detail be useful?', '["SENDER_NAME","SENDER_TITLE","TRIAL_LINK"]'::jsonb),
  ('us-west-coast-salon-stockist', '05-close', 7, 45, null, 'jc-us-wc-prospect-05-close-v2', null, 'promotional', 'Shall I close this for now?', '["SENDER_NAME","SENDER_TITLE","TRIAL_LINK"]'::jsonb)
on conflict (campaign_id, step_key) do update set
  step_number = excluded.step_number,
  day_offset = excluded.day_offset,
  trigger_name = excluded.trigger_name,
  template_alias = excluded.template_alias,
  template_id = null,
  classification = excluded.classification,
  subject = excluded.subject,
  required_variables = excluded.required_variables;

commit;
