-- Dedicated sample-request queue and initial salon delivery data.
begin;

create table if not exists public.sample_requests (
  id uuid primary key default gen_random_uuid(),
  reseller_application_id uuid references public.reseller_applications(id) on delete set null,
  business_name text not null,
  contact_name text not null,
  email text,
  phone text,
  market text not null default 'UK',
  address jsonb not null default '{}'::jsonb,
  sample_shipped boolean not null default false,
  tracking_details text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sample_requests_business_name_present check (btrim(business_name) <> ''),
  constraint sample_requests_contact_name_present check (btrim(contact_name) <> '')
);

create unique index if not exists sample_requests_contact_business_uidx
  on public.sample_requests ((lower(btrim(contact_name))), (lower(btrim(business_name))));

alter table public.sample_requests enable row level security;
revoke all on table public.sample_requests from anon, authenticated;
grant select, insert, update on table public.sample_requests to service_role;

with requested_samples (business_name, contact_name, phone, market, address) as (
  values
    ('RAPID', 'Micah Lanphere', '717-821-5858', 'US', '{"line1":"2 Goodyear Lane","line2":"","city":"Newmanstown","county":"PA","postcode":"17073","country":"USA"}'::jsonb),
    ('Christine Cali', 'Christine Cali', '407-820-5149', 'US', '{"line1":"14 Westview Ct","line2":"","city":"Milton","county":"VT","postcode":"05468","country":"USA"}'::jsonb),
    ('GLOW D SOLEIL', 'Debra Walsh', null, 'US', '{"line1":"49 Richmond Boulevard","line2":"Unit 3B","city":"Ronkonkoma","county":"NY","postcode":"11779","country":"USA"}'::jsonb),
    ('Kinga Osrin', 'Kinga Osrin', null, 'UK', '{"line1":"4 Holford Road","line2":"","city":"","county":"Surrey","postcode":"GU1 2QF","country":"UK"}'::jsonb),
    ('Brigita Micke', 'Brigita Micke', null, 'UK', '{"line1":"6 Central Parade","line2":"","city":"Rochester","county":"","postcode":"ME1 2LQ","country":"UK"}'::jsonb),
    ('Natalie Shostak', 'Natalie Shostak', null, 'UK', '{"line1":"9 Adelie Road","line2":"","city":"Nuneaton","county":"Warwickshire","postcode":"CV10 9GZ","country":"UK"}'::jsonb),
    ('Glo by Sandy', 'Sandy Sampsel', null, 'US', '{"line1":"217 Main Street","line2":"","city":"Milford","county":"OH","postcode":"45150","country":"USA"}'::jsonb),
    ('Bon Bon Bronze Bar', 'Natalie Morse', null, 'US', '{"line1":"8317 Front Beach Road","line2":"34C","city":"Panama City Beach","county":"FL","postcode":"","country":"USA"}'::jsonb),
    ('Sabrina Fabbo', 'Sabrina Fabbo', null, 'UK', '{"line1":"26 Farningham Road","line2":"","city":"Caterham","county":"","postcode":"CR3 6LG","country":"UK"}'::jsonb),
    ('Julie Bell', 'Julie Bell', null, 'UK', '{"line1":"27 Church Avenue","line2":"","city":"Denton","county":"Greater Manchester","postcode":"M34 7PP","country":"UK"}'::jsonb),
    ('Natalie Salhotra', 'Natalie Salhotra', null, 'US', '{"line1":"8107 Norton Avenue","line2":"","city":"West Hollywood","county":"CA","postcode":"90046","country":"USA"}'::jsonb)
)
insert into public.sample_requests (business_name, contact_name, phone, market, address)
select business_name, contact_name, phone, market, address
from requested_samples
on conflict ((lower(btrim(contact_name))), (lower(btrim(business_name)))) do update
set phone = coalesce(excluded.phone, public.sample_requests.phone),
    market = excluded.market,
    address = excluded.address,
    updated_at = now();

with matches as (
  select distinct on (sr.id)
    sr.id as sample_request_id,
    ra.id as application_id
  from public.sample_requests sr
  join public.reseller_applications ra
    on lower(btrim(ra.contact_name)) = lower(btrim(sr.contact_name))
    or lower(btrim(ra.business_name)) = lower(btrim(sr.business_name))
  order by sr.id,
    case when lower(btrim(ra.contact_name)) = lower(btrim(sr.contact_name)) then 0 else 1 end,
    ra.created_at desc
)
update public.sample_requests sr
set reseller_application_id = matches.application_id,
    updated_at = now()
from matches
where sr.id = matches.sample_request_id;

update public.reseller_applications ra
set phone = coalesce(sr.phone, ra.phone),
    address = sr.address,
    updated_at = now()
from public.sample_requests sr
where sr.reseller_application_id = ra.id;

update public.resellers reseller
set phone = coalesce(sr.phone, reseller.phone),
    address = sr.address,
    shipping_address = sr.address,
    updated_at = now()
from public.sample_requests sr
where reseller.application_id = sr.reseller_application_id;

commit;
