begin;

alter table public.resellers
  add column shipping_address jsonb not null default '{}'::jsonb
  check (jsonb_typeof(shipping_address) = 'object');

comment on column public.resellers.address is
  'Business or registered address maintained by the reseller.';

comment on column public.resellers.shipping_address is
  'Default delivery address maintained by the reseller.';

-- Older approvals did not copy the application address into the account row.
-- Recover it where possible without replacing any address entered later.
update public.resellers as reseller
set address = application.address
from public.reseller_applications as application
where application.id = reseller.application_id
  and reseller.address = '{}'::jsonb
  and application.address <> '{}'::jsonb;

-- Existing accounts have historically used address for delivery, so preserve
-- that behaviour until the reseller chooses a separate shipping address.
update public.resellers
set shipping_address = address
where shipping_address = '{}'::jsonb
  and address <> '{}'::jsonb;

alter table public.reseller_orders
  add column shipping_address jsonb not null default '{}'::jsonb
  check (jsonb_typeof(shipping_address) = 'object');

comment on column public.reseller_orders.shipping_address is
  'Delivery-address snapshot captured when the order request was submitted.';

-- Give historical orders the best address that was available before address
-- snapshots existed.
update public.reseller_orders as orders
set shipping_address = case
  when reseller.shipping_address <> '{}'::jsonb then reseller.shipping_address
  else reseller.address
end
from public.resellers as reseller
where reseller.id = orders.reseller_id
  and orders.shipping_address = '{}'::jsonb;

commit;
