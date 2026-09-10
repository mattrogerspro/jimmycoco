-- Add sample recipients to Applications, approve them, and retain links.
begin;

update public.reseller_applications application
set business_name = sample.business_name,
    contact_name = sample.contact_name,
    phone = coalesce(sample.phone, application.phone),
    market = case when sample.market = 'US' then 'US-West-Coast' else sample.market end,
    address = sample.address,
    wants_trial = true,
    status = 'approved',
    review_note = 'Approved sample request import',
    reviewed_at = coalesce(application.reviewed_at, now()),
    updated_at = now()
from public.sample_requests sample
where lower(btrim(application.contact_name)) = lower(btrim(sample.contact_name))
   or lower(btrim(application.business_name)) = lower(btrim(sample.business_name));

insert into public.reseller_applications (
  business_name,
  contact_name,
  email,
  phone,
  business_type,
  market,
  address,
  message,
  wants_trial,
  status,
  source,
  data_mode,
  metadata,
  review_note,
  reviewed_at
)
select
  sample.business_name,
  sample.contact_name,
  coalesce(
    sample.email,
    'sample-request-' || substr(md5(sample.id::text), 1, 12) || '@jimmycoco.invalid'
  ),
  sample.phone,
  'Salon',
  case when sample.market = 'US' then 'US-West-Coast' else sample.market end,
  sample.address,
  'Imported from the sample request fulfilment list.',
  true,
  'approved',
  'admin-sample-import',
  'live',
  jsonb_build_object(
    'intake_type', 'free_sample_request',
    'sample_request_id', sample.id,
    'email_missing', sample.email is null
  ),
  'Approved sample request import',
  now()
from public.sample_requests sample
where not exists (
  select 1
  from public.reseller_applications application
  where lower(btrim(application.contact_name)) = lower(btrim(sample.contact_name))
     or lower(btrim(application.business_name)) = lower(btrim(sample.business_name))
);

with matches as (
  select distinct on (sample.id)
    sample.id as sample_request_id,
    application.id as application_id,
    application.email
  from public.sample_requests sample
  join public.reseller_applications application
    on lower(btrim(application.contact_name)) = lower(btrim(sample.contact_name))
    or lower(btrim(application.business_name)) = lower(btrim(sample.business_name))
  order by sample.id,
    case when lower(btrim(application.contact_name)) = lower(btrim(sample.contact_name)) then 0 else 1 end,
    application.created_at desc
)
update public.sample_requests sample
set reseller_application_id = matches.application_id,
    email = coalesce(
      sample.email,
      case when matches.email not like '%@jimmycoco.invalid' then matches.email end
    ),
    updated_at = now()
from matches
where sample.id = matches.sample_request_id;

commit;
