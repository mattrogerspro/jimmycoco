-- Applied after Resend publication. Records the published template identifiers
-- while preserving the campaign-level enabled=false release gate.

begin;

update public.email_campaign_steps
set template_id = case
  when campaign_id = 'uk-pro-trial-follow-up' and step_key = '01-test-plan' then 'ce0665c6-a205-45f9-9626-484eaa320a20'
  when campaign_id = 'uk-pro-trial-follow-up' and step_key = '02-result-review' then 'af33fc1a-45b5-45bb-8d7e-298b6ad804aa'
  when campaign_id = 'uk-pro-trial-follow-up' and step_key = '03-service-maths' then '91987cee-ac1b-4ead-b766-267dca40704c'
  when campaign_id = 'uk-pro-trial-follow-up' and step_key = '04-next-step' then '61d444ef-b61a-419e-8f19-ce08a8deb653'
  when campaign_id = 'uk-pro-order-follow-up' and step_key = '01-first-service' then '64e430bd-f71e-4233-9c7b-df5de97ab017'
  when campaign_id = 'uk-pro-order-follow-up' and step_key = '02-client-experience' then 'b74a04bf-3489-4e6f-90a0-0219b8d5025d'
  when campaign_id = 'uk-pro-order-follow-up' and step_key = '03-retail' then '546d5af1-1b34-4428-afcf-2c073119be7c'
  when campaign_id = 'uk-pro-order-follow-up' and step_key = '04-next-step' then '3b2cf7c1-8cee-4c85-a1af-a19c65534d41'
  else template_id
end
where campaign_id in ('uk-pro-trial-follow-up', 'uk-pro-order-follow-up');

commit;
