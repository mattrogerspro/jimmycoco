-- Retain a concise operational audit for manually delivered customer invoices.
-- These fields describe delivery only; they never alter the issued invoice content.
begin;

alter table public.invoices
  add column if not exists customer_emailed_at timestamptz,
  add column if not exists customer_emailed_to text,
  add column if not exists customer_email_resend_id text,
  add column if not exists customer_emailed_by uuid references auth.users(id) on delete set null;

create index if not exists invoices_customer_emailed_at
  on public.invoices (customer_emailed_at desc)
  where customer_emailed_at is not null;

commit;
