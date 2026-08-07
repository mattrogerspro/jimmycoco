-- Trade invoicing.
--
-- Three rules shape this schema, and they are all legal rather than technical:
--
--   1. Invoice numbers must be sequential and gapless. A number is therefore
--      allocated at ISSUE time, never at draft time, under a row lock.
--   2. An issued invoice is a record of fact. Its lines cannot be edited and it
--      cannot be deleted — it is voided, with a reason, and the number is burnt.
--   3. What the customer was told must survive later changes. The issuer's
--      details, the bill-to address and the VAT treatment are snapshotted onto
--      the invoice when it is issued, so editing an account later cannot
--      retrospectively alter an invoice that has already gone out.
--
-- VAT is configurable and defaults to OFF. Nothing shows a VAT line, mentions
-- VAT, or adds tax until invoice_settings.vat_registered is switched on.

begin;

create extension if not exists citext;
create extension if not exists pgcrypto;

/* ------------------------------------------------------------------ *
 * Settings — a single row, so the whole business has one configuration
 * ------------------------------------------------------------------ */

create table public.invoice_settings (
  id boolean primary key default true check (id),

  -- Who is issuing. Snapshotted onto each invoice at issue time.
  legal_name text not null default 'Sunless by Jimmy Coco',
  address jsonb not null default '{}'::jsonb check (jsonb_typeof(address) = 'object'),
  contact_email text,
  contact_phone text,
  company_number text,

  -- VAT. Off by default; switching it on changes new drafts only.
  vat_registered boolean not null default false,
  vat_number text,
  vat_rate_bps integer not null default 2000 check (vat_rate_bps between 0 and 10000),
  prices_include_vat boolean not null default false,

  -- Numbering. next_number is the number the NEXT issue will take.
  invoice_prefix text not null default 'JC-INV-'
    check (invoice_prefix ~ '^[A-Z0-9-]{1,12}$'),
  next_number integer not null default 1 check (next_number >= 1),
  number_pad integer not null default 5 check (number_pad between 1 and 10),

  default_payment_terms_days integer not null default 30
    check (default_payment_terms_days between 0 and 365),
  bank_details text,
  footer_terms text,

  updated_at timestamptz not null default now()
);

comment on column public.invoice_settings.next_number is
  'The number the next issued invoice will take. Never decrease it — gaps are legal, reuse is not.';

insert into public.invoice_settings (id) values (true) on conflict (id) do nothing;

/* ------------------------------------------------------------------ *
 * Invoices
 * ------------------------------------------------------------------ */

create table public.invoices (
  id uuid primary key default gen_random_uuid(),

  -- Null while draft. Allocated once, at issue, and never changed after.
  invoice_number text unique
    check (invoice_number is null or char_length(invoice_number) between 3 and 40),

  reseller_id uuid not null references public.resellers(id) on delete restrict,
  order_id uuid references public.reseller_orders(id) on delete set null,

  status text not null default 'draft'
    check (status in ('draft', 'issued', 'part_paid', 'paid', 'void')),

  currency text not null default 'GBP' check (currency in ('GBP', 'EUR', 'USD', 'AUD')),

  issue_date date,
  due_date date,
  payment_terms_days integer not null default 30 check (payment_terms_days between 0 and 365),

  -- VAT treatment frozen from settings when the draft is created, so changing
  -- the configuration later cannot rewrite the arithmetic of an old invoice.
  vat_registered boolean not null default false,
  vat_number text,
  vat_rate_bps integer not null default 0 check (vat_rate_bps between 0 and 10000),
  prices_include_vat boolean not null default false,

  -- Maintained by trigger from the lines and the payments. Never write directly.
  net_pence integer not null default 0 check (net_pence >= 0),
  vat_pence integer not null default 0 check (vat_pence >= 0),
  gross_pence integer not null default 0 check (gross_pence >= 0),
  paid_pence integer not null default 0 check (paid_pence >= 0),
  balance_pence integer generated always as (gross_pence - paid_pence) stored,

  -- Snapshots taken at issue. What the customer was actually shown.
  issuer jsonb not null default '{}'::jsonb check (jsonb_typeof(issuer) = 'object'),
  bill_to jsonb not null default '{}'::jsonb check (jsonb_typeof(bill_to) = 'object'),

  customer_note text,
  internal_note text,
  terms_text text,

  -- Set once the invoice has been mirrored into the accounting system.
  external_reference text,

  issued_at timestamptz,
  paid_at timestamptz,
  voided_at timestamptz,
  void_reason text,

  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- An issued invoice must carry a number and a date; a draft must not.
  constraint invoices_issued_shape check (
    (status = 'draft' and invoice_number is null and issued_at is null)
    or (status <> 'draft' and invoice_number is not null and issued_at is not null)
  ),
  constraint invoices_void_shape check (
    (status = 'void' and voided_at is not null) or (status <> 'void' and voided_at is null)
  )
);

create index invoices_reseller on public.invoices (reseller_id, created_at desc);
create index invoices_status on public.invoices (status, issue_date desc);
create index invoices_order on public.invoices (order_id);
create index invoices_due on public.invoices (due_date)
  where status in ('issued', 'part_paid');

/* ------------------------------------------------------------------ *
 * Invoice lines — frozen once the invoice is issued
 * ------------------------------------------------------------------ */

create table public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,

  sku text,
  title text not null check (char_length(btrim(title)) between 1 and 300),
  description text,

  quantity integer not null check (quantity between 1 and 99999),
  unit_price_pence integer not null check (unit_price_pence >= 0),

  vat_rate_bps integer not null default 0 check (vat_rate_bps between 0 and 10000),
  net_pence integer not null default 0 check (net_pence >= 0),
  vat_pence integer not null default 0 check (vat_pence >= 0),
  gross_pence integer not null default 0 check (gross_pence >= 0),

  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

create index invoice_lines_invoice on public.invoice_lines (invoice_id, sort_order, created_at);

/* ------------------------------------------------------------------ *
 * Payments — a ledger, so part-payment is a first-class case
 * ------------------------------------------------------------------ */

create table public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,

  amount_pence integer not null check (amount_pence <> 0),
  paid_on date not null default current_date,
  method text not null default 'bank_transfer'
    check (method in ('bank_transfer', 'card', 'cash', 'cheque', 'other', 'credit')),
  reference text,
  note text,

  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on column public.invoice_payments.amount_pence is
  'Negative amounts are allowed so a refund or a bounced payment can be reversed without deleting history.';

create index invoice_payments_invoice on public.invoice_payments (invoice_id, paid_on desc);

/* ------------------------------------------------------------------ *
 * Numbering — allocated under a row lock, so it cannot skip or repeat
 * ------------------------------------------------------------------ */

create or replace function private.allocate_invoice_number()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  allocated integer;
  prefix text;
  pad integer;
begin
  -- The UPDATE takes a row lock on the single settings row, so two concurrent
  -- issues serialise here rather than both reading the same number.
  update public.invoice_settings
     set next_number = next_number + 1,
         updated_at = now()
   where id = true
  returning next_number - 1, invoice_prefix, number_pad
    into allocated, prefix, pad;

  if allocated is null then
    raise exception 'Invoice settings row is missing.' using errcode = 'no_data_found';
  end if;

  return prefix || lpad(allocated::text, pad, '0');
end;
$$;

/* ------------------------------------------------------------------ *
 * Totals — the database owns the arithmetic, not the application
 * ------------------------------------------------------------------ */

create or replace function private.recalculate_invoice_totals()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.invoice_id, old.invoice_id);
begin
  update public.invoices i
     set net_pence = coalesce(totals.net, 0),
         vat_pence = coalesce(totals.vat, 0),
         gross_pence = coalesce(totals.gross, 0),
         updated_at = now()
    from (
      select sum(net_pence)::int as net, sum(vat_pence)::int as vat, sum(gross_pence)::int as gross
        from public.invoice_lines
       where invoice_id = target
    ) totals
   where i.id = target;

  return null;
end;
$$;

create or replace function private.recalculate_invoice_payments()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid := coalesce(new.invoice_id, old.invoice_id);
  settled integer;
  invoice public.invoices%rowtype;
begin
  select coalesce(sum(amount_pence), 0)::int into settled
    from public.invoice_payments where invoice_id = target;

  select * into invoice from public.invoices where id = target;

  -- A void invoice keeps its ledger but never changes status again.
  if invoice.status = 'void' or invoice.status = 'draft' then
    update public.invoices set paid_pence = settled, updated_at = now() where id = target;
    return null;
  end if;

  update public.invoices
     set paid_pence = settled,
         status = case
           when settled >= gross_pence and gross_pence > 0 then 'paid'
           when settled > 0 then 'part_paid'
           else 'issued'
         end,
         paid_at = case
           when settled >= gross_pence and gross_pence > 0 then coalesce(paid_at, now())
           else null
         end,
         updated_at = now()
   where id = target;

  return null;
end;
$$;

/* ------------------------------------------------------------------ *
 * Immutability guards
 * ------------------------------------------------------------------ */

create or replace function private.guard_invoice_lines()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parent_status text;
begin
  select status into parent_status
    from public.invoices
   where id = coalesce(new.invoice_id, old.invoice_id);

  if parent_status is distinct from 'draft' then
    raise exception 'This invoice has been issued. Void it and raise a new one instead of editing the lines.'
      using errcode = 'restrict_violation';
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function private.guard_invoice_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.invoice_number is not null and new.invoice_number is distinct from old.invoice_number then
    raise exception 'An invoice number cannot be changed once it has been issued.'
      using errcode = 'restrict_violation';
  end if;

  if old.status = 'void' and new.status <> 'void' then
    raise exception 'A voided invoice cannot be reopened. Raise a new one.'
      using errcode = 'restrict_violation';
  end if;

  if old.status <> 'draft' and new.status = 'draft' then
    raise exception 'An issued invoice cannot be returned to draft.'
      using errcode = 'restrict_violation';
  end if;

  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.guard_invoice_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status <> 'draft' then
    raise exception 'An issued invoice cannot be deleted. Void it instead.'
      using errcode = 'restrict_violation';
  end if;
  return old;
end;
$$;

create trigger invoice_lines_recalculate
  after insert or update or delete on public.invoice_lines
  for each row execute function private.recalculate_invoice_totals();

create trigger invoice_lines_guard
  before insert or update or delete on public.invoice_lines
  for each row execute function private.guard_invoice_lines();

create trigger invoice_payments_recalculate
  after insert or update or delete on public.invoice_payments
  for each row execute function private.recalculate_invoice_payments();

create trigger invoices_guard
  before update on public.invoices
  for each row execute function private.guard_invoice_changes();

create trigger invoices_guard_delete
  before delete on public.invoices
  for each row execute function private.guard_invoice_delete();

create trigger invoice_settings_touch
  before update on public.invoice_settings
  for each row execute function public.touch_updated_at();

/* ------------------------------------------------------------------ *
 * Issuing — one transaction that allocates, snapshots and stamps
 * ------------------------------------------------------------------ */

create or replace function public.issue_invoice(p_invoice_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  invoice public.invoices%rowtype;
  settings public.invoice_settings%rowtype;
  account public.resellers%rowtype;
  allocated text;
  line_count integer;
begin
  if not private.is_reseller_staff() then
    raise exception 'Only staff may issue invoices.' using errcode = 'insufficient_privilege';
  end if;

  select * into invoice from public.invoices where id = p_invoice_id for update;
  if invoice.id is null then
    raise exception 'Invoice not found.' using errcode = 'no_data_found';
  end if;
  if invoice.status <> 'draft' then
    raise exception 'This invoice has already been issued.' using errcode = 'restrict_violation';
  end if;

  select count(*) into line_count from public.invoice_lines where invoice_id = p_invoice_id;
  if line_count = 0 then
    raise exception 'An invoice needs at least one line before it can be issued.'
      using errcode = 'check_violation';
  end if;

  select * into settings from public.invoice_settings where id = true;
  select * into account from public.resellers where id = invoice.reseller_id;

  allocated := private.allocate_invoice_number();

  update public.invoices
     set invoice_number = allocated,
         status = 'issued',
         issued_at = now(),
         issue_date = coalesce(issue_date, current_date),
         due_date = coalesce(due_date, current_date + payment_terms_days),
         issuer = jsonb_strip_nulls(jsonb_build_object(
           'legal_name', settings.legal_name,
           'address', settings.address,
           'email', settings.contact_email,
           'phone', settings.contact_phone,
           'company_number', settings.company_number,
           'vat_number', case when settings.vat_registered then settings.vat_number end,
           'bank_details', settings.bank_details
         )),
         bill_to = jsonb_strip_nulls(jsonb_build_object(
           'business_name', account.business_name,
           'contact_name', account.contact_name,
           'email', account.email::text,
           'phone', account.phone,
           'account_code', account.account_code,
           'address', account.address
         )),
         terms_text = coalesce(terms_text, settings.footer_terms),
         updated_at = now()
   where id = p_invoice_id;

  -- Payments recorded against a draft (a deposit, say) settle it immediately.
  update public.invoices
     set status = case
           when paid_pence >= gross_pence and gross_pence > 0 then 'paid'
           when paid_pence > 0 then 'part_paid'
           else status
         end,
         paid_at = case when paid_pence >= gross_pence and gross_pence > 0 then now() else paid_at end
   where id = p_invoice_id;

  return allocated;
end;
$$;

create or replace function public.void_invoice(p_invoice_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_reseller_staff() then
    raise exception 'Only staff may void invoices.' using errcode = 'insufficient_privilege';
  end if;
  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'A void needs a reason.' using errcode = 'check_violation';
  end if;

  update public.invoices
     set status = 'void', voided_at = now(), void_reason = btrim(p_reason), updated_at = now()
   where id = p_invoice_id and status <> 'void';

  if not found then
    raise exception 'Invoice not found, or already void.' using errcode = 'no_data_found';
  end if;
end;
$$;

/* ------------------------------------------------------------------ *
 * Access
 * ------------------------------------------------------------------ */

alter table public.invoice_settings enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.invoice_payments enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.invoices to authenticated;
grant select, insert, update, delete on public.invoice_lines to authenticated;
grant select, insert, update, delete on public.invoice_payments to authenticated;
grant select, update on public.invoice_settings to authenticated;
grant execute on function public.issue_invoice(uuid) to authenticated;
grant execute on function public.void_invoice(uuid, text) to authenticated;

create policy invoice_settings_staff_read on public.invoice_settings
  for select to authenticated using (private.is_reseller_staff());
create policy invoice_settings_staff_write on public.invoice_settings
  for update to authenticated using (private.is_reseller_staff()) with check (private.is_reseller_staff());

create policy invoices_staff_all on public.invoices
  for all to authenticated using (private.is_reseller_staff()) with check (private.is_reseller_staff());

-- A stockist sees their own invoices, but never a draft: a draft is our
-- working copy, not a document they have been given.
create policy invoices_own_read on public.invoices
  for select to authenticated
  using (reseller_id = private.current_reseller_id() and status <> 'draft');

create policy invoice_lines_staff_all on public.invoice_lines
  for all to authenticated using (private.is_reseller_staff()) with check (private.is_reseller_staff());

create policy invoice_lines_own_read on public.invoice_lines
  for select to authenticated
  using (exists (
    select 1 from public.invoices i
     where i.id = invoice_lines.invoice_id
       and i.reseller_id = private.current_reseller_id()
       and i.status <> 'draft'
  ));

create policy invoice_payments_staff_all on public.invoice_payments
  for all to authenticated using (private.is_reseller_staff()) with check (private.is_reseller_staff());

create policy invoice_payments_own_read on public.invoice_payments
  for select to authenticated
  using (exists (
    select 1 from public.invoices i
     where i.id = invoice_payments.invoice_id
       and i.reseller_id = private.current_reseller_id()
       and i.status <> 'draft'
  ));

commit;
