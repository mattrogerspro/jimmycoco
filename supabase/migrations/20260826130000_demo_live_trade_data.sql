-- Classify trade records as Demo or Live.
--
-- Existing applications, accounts, orders and invoices are retained exactly as
-- they are, but become explicitly Demo. Future records default to Live unless
-- an authorised staff member enables the controlled demo-data switch.

begin;

-- ---------------------------------------------------------------------------
-- First-class record classification
-- ---------------------------------------------------------------------------

alter table public.reseller_applications add column if not exists data_mode text;
alter table public.resellers add column if not exists data_mode text;
alter table public.reseller_orders add column if not exists data_mode text;
alter table public.invoices add column if not exists data_mode text;

-- This migration intentionally classifies every pre-existing record as Demo.
update public.reseller_applications set data_mode = 'demo';
update public.resellers set data_mode = 'demo';
update public.reseller_orders set data_mode = 'demo';
update public.invoices set data_mode = 'demo';

alter table public.reseller_applications alter column data_mode set not null;
alter table public.resellers alter column data_mode set not null;
alter table public.reseller_orders alter column data_mode set not null;
alter table public.invoices alter column data_mode set not null;

-- No column default is set deliberately. The trigger below makes the setting
-- authoritative for new root records and makes descendants inherit their parent.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'reseller_applications_data_mode_check'
      and conrelid = 'public.reseller_applications'::regclass
  ) then
    alter table public.reseller_applications
      add constraint reseller_applications_data_mode_check check (data_mode in ('demo', 'live'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'resellers_data_mode_check'
      and conrelid = 'public.resellers'::regclass
  ) then
    alter table public.resellers
      add constraint resellers_data_mode_check check (data_mode in ('demo', 'live'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'reseller_orders_data_mode_check'
      and conrelid = 'public.reseller_orders'::regclass
  ) then
    alter table public.reseller_orders
      add constraint reseller_orders_data_mode_check check (data_mode in ('demo', 'live'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'invoices_data_mode_check'
      and conrelid = 'public.invoices'::regclass
  ) then
    alter table public.invoices
      add constraint invoices_data_mode_check check (data_mode in ('demo', 'live'));
  end if;
end;
$$;

create index if not exists reseller_applications_data_mode_created
  on public.reseller_applications (data_mode, created_at desc);
create index if not exists resellers_data_mode_created
  on public.resellers (data_mode, created_at desc);
create index if not exists reseller_orders_data_mode_created
  on public.reseller_orders (data_mode, created_at desc);
create index if not exists invoices_data_mode_created
  on public.invoices (data_mode, created_at desc);

-- ---------------------------------------------------------------------------
-- One global, staff-only setting for future root records
-- ---------------------------------------------------------------------------

create table if not exists public.trade_data_settings (
  id boolean primary key default true check (id),
  create_new_records_as_demo boolean not null default false,
  updated_at timestamptz not null default now()
);

comment on table public.trade_data_settings is
  'Controls the Demo/Live classification of newly created standalone trade records.';
comment on column public.trade_data_settings.create_new_records_as_demo is
  'When false, new standalone applications/accounts are Live. When true, they are Demo.';

insert into public.trade_data_settings (id, create_new_records_as_demo)
values (true, false)
on conflict (id) do nothing;

create trigger trade_data_settings_touch
  before update on public.trade_data_settings
  for each row execute function public.touch_updated_at();

alter table public.trade_data_settings enable row level security;
revoke all on table public.trade_data_settings from public, anon, authenticated;
grant select, update on table public.trade_data_settings to authenticated;
grant all on table public.trade_data_settings to service_role;

create policy trade_data_settings_staff_read
on public.trade_data_settings
for select to authenticated
using ((select private.is_reseller_staff()));

create policy trade_data_settings_staff_update
on public.trade_data_settings
for update to authenticated
using ((select private.is_reseller_staff()))
with check ((select private.is_reseller_staff()));

-- ---------------------------------------------------------------------------
-- Future-record classification and inheritance
-- ---------------------------------------------------------------------------

create or replace function private.assign_trade_data_mode()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  inherited_mode text;
  create_as_demo boolean;
begin
  -- Descendants always inherit their business parent. This protects against a
  -- demo account accidentally creating a Live order or invoice.
  if tg_table_name = 'resellers' and new.application_id is not null then
    select a.data_mode into inherited_mode
    from public.reseller_applications a
    where a.id = new.application_id;
  elsif tg_table_name = 'reseller_orders' then
    select r.data_mode into inherited_mode
    from public.resellers r
    where r.id = new.reseller_id;
  elsif tg_table_name = 'invoices' then
    if new.order_id is not null then
      select o.data_mode into inherited_mode
      from public.reseller_orders o
      where o.id = new.order_id;
    end if;

    if inherited_mode is null then
      select r.data_mode into inherited_mode
      from public.resellers r
      where r.id = new.reseller_id;
    end if;
  end if;

  if inherited_mode is not null then
    new.data_mode := inherited_mode;
  elsif new.data_mode is null then
    select s.create_new_records_as_demo into create_as_demo
    from public.trade_data_settings s
    where s.id = true;

    new.data_mode := case when coalesce(create_as_demo, false) then 'demo' else 'live' end;
  end if;

  return new;
end;
$$;

create trigger reseller_applications_assign_data_mode
  before insert on public.reseller_applications
  for each row execute function private.assign_trade_data_mode();

create trigger resellers_assign_data_mode
  before insert on public.resellers
  for each row execute function private.assign_trade_data_mode();

create trigger reseller_orders_assign_data_mode
  before insert on public.reseller_orders
  for each row execute function private.assign_trade_data_mode();

create trigger invoices_assign_data_mode
  before insert on public.invoices
  for each row execute function private.assign_trade_data_mode();

commit;
