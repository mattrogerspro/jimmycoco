-- Register the expanded UK reseller lifecycle in the email automation tables.
-- This is deliberately disabled; template publication and live sending still
-- require the normal human release gates.
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
  local_send_hour
)
values (
  'uk-reseller-lifecycle',
  'UK Reseller Lifecycle',
  'UK',
  'event',
  'service',
  '2026-08-14.1',
  false,
  'Europe/London',
  9
)
on conflict (id) do update set
  name = excluded.name,
  market = excluded.market,
  mode = excluded.mode,
  classification = excluded.classification,
  definition_version = excluded.definition_version,
  timezone = excluded.timezone,
  local_send_hour = excluded.local_send_hour;

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
  (
    'uk-reseller-lifecycle',
    'trial-request-received',
    1,
    null,
    'reseller_trial_request_received',
    'uk-reseller-1-free-trial-request-received',
    null,
    'service',
    'We have your free trial request',
    '["SALON_NAME","CONTACT_NAME","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS","PREFERENCES_LINK"]'::jsonb
  ),
  (
    'uk-reseller-lifecycle',
    'order-request-received',
    2,
    null,
    'reseller_order_request_received',
    'uk-reseller-2-order-request-received',
    null,
    'service',
    'We have your trade order request',
    '["SALON_NAME","CONTACT_NAME","ORDER_SUMMARY","CUSTOMER_NOTES","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS","PREFERENCES_LINK"]'::jsonb
  ),
  (
    'uk-reseller-lifecycle',
    'internal-notice',
    3,
    null,
    'reseller_application_internal_notice',
    'uk-reseller-3-internal-notice',
    null,
    'transactional',
    'New pro-site request — {{SALON_NAME}}',
    '["REQUEST_TYPE","SALON_NAME","CONTACT_NAME","CONTACT_EMAIL","BUSINESS_TYPE","SUBMISSION_SUMMARY","ADMIN_LINK","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS","PREFERENCES_LINK"]'::jsonb
  ),
  (
    'uk-reseller-lifecycle',
    'approved-welcome',
    4,
    null,
    'reseller_approved',
    'uk-reseller-4-approved-welcome',
    null,
    'service',
    'You are approved — welcome to Jimmy Coco',
    '["SALON_NAME","CONTACT_NAME","ACCOUNT_CODE","PORTAL_LINK","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS","PREFERENCES_LINK"]'::jsonb
  ),
  (
    'uk-reseller-lifecycle',
    'portal-order-received',
    5,
    null,
    'reseller_order_submitted',
    'uk-reseller-5-portal-order-received',
    null,
    'service',
    'Thank you for your order',
    '["SALON_NAME","CONTACT_NAME","ORDER_REFERENCE","ORDER_SUMMARY","ORDER_TOTAL","CUSTOMER_NOTES","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS","PREFERENCES_LINK"]'::jsonb
  ),
  (
    'uk-reseller-lifecycle',
    'order-internal-notice',
    6,
    null,
    'reseller_order_internal_notice',
    'uk-reseller-6-order-internal-notice',
    null,
    'transactional',
    'New trade portal order — {{ORDER_REFERENCE}}',
    '["SALON_NAME","CONTACT_NAME","CONTACT_EMAIL","ACCOUNT_CODE","ORDER_REFERENCE","ORDER_SUMMARY","ORDER_TOTAL","CUSTOMER_NOTES","ADMIN_LINK","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS","PREFERENCES_LINK"]'::jsonb
  ),
  (
    'uk-reseller-lifecycle',
    'declined',
    7,
    null,
    'reseller_declined',
    'uk-reseller-7-declined',
    null,
    'service',
    'About your trade application',
    '["SALON_NAME","CONTACT_NAME","SENDER_NAME","SENDER_TITLE","BUSINESS_ADDRESS","PREFERENCES_LINK"]'::jsonb
  )
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
