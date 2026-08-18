-- Shipment records keep fulfilment history independent from the commercial order state.
begin;

create table if not exists public.reseller_order_shipments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.reseller_orders(id) on delete cascade,
  status text not null default 'preparing'
    check (status in ('preparing', 'dispatched', 'in_transit', 'delivered', 'exception')),
  carrier text,
  service_level text,
  tracking_number text,
  tracking_url text,
  dispatched_at timestamptz,
  estimated_delivery_date date,
  delivered_at timestamptz,
  internal_note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reseller_order_shipments_order_updated
  on public.reseller_order_shipments (order_id, updated_at desc);

alter table public.reseller_order_shipments enable row level security;

create policy reseller_order_shipments_owner_select
on public.reseller_order_shipments
for select to authenticated
using (
  exists (
    select 1 from public.reseller_orders o
    where o.id = order_id
      and (o.reseller_id = (select private.current_reseller_id()) or (select private.is_reseller_staff()))
  )
);

create policy reseller_order_shipments_staff_write
on public.reseller_order_shipments
for all to authenticated
using ((select private.is_reseller_staff()))
with check ((select private.is_reseller_staff()));

create trigger reseller_order_shipments_touch
before update on public.reseller_order_shipments
for each row execute function public.touch_updated_at();

commit;
