-- Track sample dispatch details for orders.
begin;

alter table public.reseller_order_shipments
  add column if not exists sample_shipped boolean not null default false,
  add column if not exists sample_tracking_details text;

commit;
