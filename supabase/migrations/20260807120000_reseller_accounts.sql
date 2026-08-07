-- Trade reseller applications, approved accounts, catalogue and order requests.
begin;

create extension if not exists citext;
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.reseller_applications (
  id uuid primary key default gen_random_uuid(),
  business_name text not null check (char_length(btrim(business_name)) between 1 and 200),
  contact_name text not null check (char_length(btrim(contact_name)) between 1 and 200),
  email citext not null,
  phone text,
  business_type text not null default 'Salon'
    check (business_type in ('Salon', 'Spa', 'Mobile professional', 'Multi-site group', 'Other')),
  market text not null default 'UK',
  website text,
  instagram text,
  address jsonb not null default '{}'::jsonb check (jsonb_typeof(address) = 'object'),
  message text,
  wants_trial boolean not null default true,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'declined', 'on_hold')),
  source text not null default 'pro-site',
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reseller_applications_status_created
  on public.reseller_applications (status, created_at desc);
create index reseller_applications_email
  on public.reseller_applications (email);

create table public.resellers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.reseller_applications(id) on delete set null,
  user_id uuid unique references auth.users(id) on delete set null,
  account_code text not null unique
    check (account_code ~ '^[A-Z0-9]{4,16}$'),
  business_name text not null check (char_length(btrim(business_name)) between 1 and 200),
  contact_name text not null check (char_length(btrim(contact_name)) between 1 and 200),
  email citext not null unique,
  phone text,
  market text not null default 'UK',
  pricing_tier text not null default 'standard'
    check (pricing_tier in ('standard', 'silver', 'gold')),
  discount_percent numeric(5, 2) not null default 0
    check (discount_percent >= 0 and discount_percent <= 90),
  status text not null default 'active'
    check (status in ('active', 'suspended', 'closed')),
  address jsonb not null default '{}'::jsonb check (jsonb_typeof(address) = 'object'),
  internal_notes text,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resellers_status on public.resellers (status);

create table public.reseller_products (
  sku text primary key check (sku ~ '^[A-Z0-9][A-Z0-9-]{1,31}$'),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  description text,
  unit_label text not null default 'each',
  retail_price_pence integer check (retail_price_pence is null or retail_price_pence >= 0),
  trade_price_pence integer not null check (trade_price_pence >= 0),
  case_quantity integer not null default 1 check (case_quantity >= 1),
  is_active boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reseller_orders (
  id uuid primary key default gen_random_uuid(),
  reseller_id uuid not null references public.resellers(id) on delete cascade,
  reference text not null unique,
  status text not null default 'submitted'
    check (status in ('submitted', 'confirmed', 'invoiced', 'shipped', 'cancelled')),
  currency text not null default 'GBP' check (currency in ('GBP', 'EUR', 'USD', 'AUD')),
  subtotal_pence integer not null default 0 check (subtotal_pence >= 0),
  delivery_note text,
  customer_note text,
  internal_note text,
  submitted_at timestamptz not null default now(),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reseller_orders_reseller_created
  on public.reseller_orders (reseller_id, created_at desc);
create index reseller_orders_status_created
  on public.reseller_orders (status, created_at desc);

create table public.reseller_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.reseller_orders(id) on delete cascade,
  sku text not null references public.reseller_products(sku) on delete restrict,
  title text not null,
  unit_price_pence integer not null check (unit_price_pence >= 0),
  quantity integer not null check (quantity between 1 and 9999),
  line_total_pence integer not null check (line_total_pence >= 0),
  created_at timestamptz not null default now()
);

create index reseller_order_items_order on public.reseller_order_items (order_id);
create unique index reseller_order_items_order_sku on public.reseller_order_items (order_id, sku);

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

create or replace function private.is_reseller_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.article_admin_profiles p
    where p.user_id = (select auth.uid())
      and p.is_active = true
      and p.role in ('admin', 'editor')
  );
$$;

create or replace function private.current_reseller_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select r.id
  from public.resellers r
  where r.user_id = (select auth.uid())
    and r.status = 'active'
  limit 1;
$$;

create or replace function private.next_order_reference()
returns text
language sql
volatile
security definer
set search_path = ''
as $$
  select 'JC-' || to_char(now() at time zone 'utc', 'YYMM') || '-' ||
         upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
$$;

-- Public intake. Runs as definer so anonymous visitors can lodge an application
-- without holding insert rights on the table itself.
create or replace function public.submit_reseller_application(
  p_business_name text,
  p_contact_name text,
  p_email text,
  p_phone text default null,
  p_business_type text default 'Salon',
  p_market text default 'UK',
  p_message text default null,
  p_wants_trial boolean default true,
  p_source text default 'pro-site',
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  new_id uuid;
  recent_count integer;
begin
  if coalesce(btrim(p_business_name), '') = ''
     or coalesce(btrim(p_contact_name), '') = ''
     or coalesce(btrim(p_email), '') = '' then
    raise exception 'Business name, contact name and email are required.'
      using errcode = 'check_violation';
  end if;

  -- Cheap flood guard: at most 3 open applications per email per hour.
  select count(*) into recent_count
  from public.reseller_applications a
  where lower(a.email::text) = lower(btrim(p_email))
    and a.created_at > now() - interval '1 hour';

  if recent_count >= 3 then
    raise exception 'Too many applications submitted for this email address.'
      using errcode = 'check_violation';
  end if;

  insert into public.reseller_applications (
    business_name, contact_name, email, phone, business_type,
    market, message, wants_trial, source, metadata
  )
  values (
    btrim(p_business_name), btrim(p_contact_name), btrim(p_email), nullif(btrim(p_phone), ''),
    coalesce(nullif(btrim(p_business_type), ''), 'Salon'),
    coalesce(nullif(btrim(p_market), ''), 'UK'),
    nullif(btrim(p_message), ''), coalesce(p_wants_trial, true),
    coalesce(nullif(btrim(p_source), ''), 'pro-site'),
    coalesce(p_metadata, '{}'::jsonb)
  )
  returning id into new_id;

  return new_id;
end;
$$;

-- Lets an approved reseller bind the auth user they just created to their
-- account row. Runs as definer because RLS hides unclaimed rows from them.
create or replace function public.claim_reseller_account()
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  caller uuid := (select auth.uid());
  caller_email text := (select auth.jwt() ->> 'email');
  target uuid;
begin
  if caller is null or coalesce(btrim(caller_email), '') = '' then
    raise exception 'Not signed in.' using errcode = 'insufficient_privilege';
  end if;

  select r.id into target
  from public.resellers r
  where lower(r.email::text) = lower(caller_email)
    and r.status = 'active'
    and (r.user_id is null or r.user_id = caller)
  limit 1;

  if target is null then
    raise exception 'No approved trade account matches this email address.'
      using errcode = 'no_data_found';
  end if;

  update public.resellers
  set user_id = caller, updated_at = now()
  where id = target;

  return target;
end;
$$;

-- Keeps order totals honest regardless of what the client posts.
create or replace function private.recalculate_reseller_order_total()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_order uuid;
begin
  target_order := coalesce(new.order_id, old.order_id);

  update public.reseller_orders o
  set subtotal_pence = coalesce((
        select sum(i.line_total_pence)
        from public.reseller_order_items i
        where i.order_id = target_order
      ), 0),
      updated_at = now()
  where o.id = target_order;

  return null;
end;
$$;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

create trigger reseller_applications_touch
  before update on public.reseller_applications
  for each row execute function public.touch_updated_at();

create trigger resellers_touch
  before update on public.resellers
  for each row execute function public.touch_updated_at();

create trigger reseller_products_touch
  before update on public.reseller_products
  for each row execute function public.touch_updated_at();

create trigger reseller_orders_touch
  before update on public.reseller_orders
  for each row execute function public.touch_updated_at();

create trigger reseller_order_items_recalculate
  after insert or update or delete on public.reseller_order_items
  for each row execute function private.recalculate_reseller_order_total();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.reseller_applications enable row level security;
alter table public.resellers enable row level security;
alter table public.reseller_products enable row level security;
alter table public.reseller_orders enable row level security;
alter table public.reseller_order_items enable row level security;

revoke all on table public.reseller_applications from public, anon, authenticated;
revoke all on table public.resellers from public, anon, authenticated;
revoke all on table public.reseller_products from public, anon, authenticated;
revoke all on table public.reseller_orders from public, anon, authenticated;
revoke all on table public.reseller_order_items from public, anon, authenticated;

grant select, insert on table public.reseller_products to authenticated;
grant select, insert on table public.resellers to authenticated;
grant select, insert on table public.reseller_orders to authenticated;
grant select, insert on table public.reseller_order_items to authenticated;
grant select, insert, update on table public.reseller_applications to authenticated;
grant update on table public.resellers to authenticated;
grant update, delete on table public.reseller_products to authenticated;
grant update, delete on table public.reseller_orders to authenticated;
grant update, delete on table public.reseller_order_items to authenticated;

grant all on table
  public.reseller_applications,
  public.resellers,
  public.reseller_products,
  public.reseller_orders,
  public.reseller_order_items
to service_role;

revoke all on function public.claim_reseller_account() from public;
grant execute on function public.claim_reseller_account() to authenticated, service_role;

revoke all on function public.submit_reseller_application(
  text, text, text, text, text, text, text, boolean, text, jsonb
) from public;
grant execute on function public.submit_reseller_application(
  text, text, text, text, text, text, text, boolean, text, jsonb
) to anon, authenticated, service_role;

-- Applications: staff only. The public writes through the definer function.
create policy reseller_applications_staff_select
on public.reseller_applications
for select to authenticated
using ((select private.is_reseller_staff()));

create policy reseller_applications_staff_insert
on public.reseller_applications
for insert to authenticated
with check ((select private.is_reseller_staff()));

create policy reseller_applications_staff_update
on public.reseller_applications
for update to authenticated
using ((select private.is_reseller_staff()))
with check ((select private.is_reseller_staff()));

-- Reseller accounts: a reseller sees only their own row; staff see everything.
create policy resellers_self_or_staff_select
on public.resellers
for select to authenticated
using (
  user_id = (select auth.uid())
  or (select private.is_reseller_staff())
);

create policy resellers_staff_insert
on public.resellers
for insert to authenticated
with check ((select private.is_reseller_staff()));

create policy resellers_staff_write
on public.resellers
for update to authenticated
using ((select private.is_reseller_staff()))
with check ((select private.is_reseller_staff()));

-- Catalogue: any signed-in reseller may read active lines; staff manage them.
create policy reseller_products_read
on public.reseller_products
for select to authenticated
using (
  (is_active = true and (select private.current_reseller_id()) is not null)
  or (select private.is_reseller_staff())
);

create policy reseller_products_staff_write
on public.reseller_products
for all to authenticated
using ((select private.is_reseller_staff()))
with check ((select private.is_reseller_staff()));

-- Orders: a reseller reads and creates their own; staff see and manage all.
create policy reseller_orders_owner_select
on public.reseller_orders
for select to authenticated
using (
  reseller_id = (select private.current_reseller_id())
  or (select private.is_reseller_staff())
);

create policy reseller_orders_owner_insert
on public.reseller_orders
for insert to authenticated
with check (reseller_id = (select private.current_reseller_id()));

create policy reseller_orders_staff_update
on public.reseller_orders
for update to authenticated
using ((select private.is_reseller_staff()))
with check ((select private.is_reseller_staff()));

create policy reseller_order_items_owner_select
on public.reseller_order_items
for select to authenticated
using (
  exists (
    select 1 from public.reseller_orders o
    where o.id = order_id
      and (
        o.reseller_id = (select private.current_reseller_id())
        or (select private.is_reseller_staff())
      )
  )
);

create policy reseller_order_items_owner_insert
on public.reseller_order_items
for insert to authenticated
with check (
  exists (
    select 1 from public.reseller_orders o
    where o.id = order_id
      and o.reseller_id = (select private.current_reseller_id())
      and o.status = 'submitted'
  )
);

create policy reseller_order_items_staff_write
on public.reseller_order_items
for all to authenticated
using ((select private.is_reseller_staff()))
with check ((select private.is_reseller_staff()));

-- ---------------------------------------------------------------------------
-- Seed catalogue (trade prices in pence, adjust in admin as needed)
-- ---------------------------------------------------------------------------

insert into public.reseller_products (sku, title, description, unit_label, retail_price_pence, trade_price_pence, sort_order)
values
  ('MALIBU-1L', 'Malibu professional spray tan solution — 1 litre', 'Universal Bronze Glow shade, 10% DHA. Approx. 28 full body tans per bottle.', 'bottle', 6000, 6000, 10),
  ('MITT-BUFF-GLOW', 'Buff & Glow Mitt', 'The 3-in-1 tanning mitt — streak-free application and maintenance.', 'each', 2500, 1250, 20),
  ('SOUFFLE-SELF-TAN', 'The Self Tan Soufflé', 'Instant tint with Jimmy''s iconic scent.', 'each', 3500, 1750, 30),
  ('KIT-A-LIST-GLOW', 'The A-List Glow Kit', 'The complete six-piece retail routine.', 'kit', 7900, 3950, 40)
on conflict (sku) do nothing;

commit;
