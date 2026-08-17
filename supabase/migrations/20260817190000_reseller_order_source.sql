-- Add a clear operational source to every reseller order.
-- Existing orders are retained and classified as Pro website until reviewed.
begin;

alter table public.reseller_orders
  add column if not exists source text;

update public.reseller_orders
set source = 'pro_website'
where source is null;

alter table public.reseller_orders
  alter column source set default 'pro_website',
  alter column source set not null;

alter table public.reseller_orders
  add constraint reseller_orders_source_check
  check (source in ('pro_website', 'retail_website', 'manual'));

create index if not exists reseller_orders_source_created
  on public.reseller_orders (source, created_at desc);

commit;
