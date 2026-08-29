begin;

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
  if tg_table_name = 'resellers' then
    if new.application_id is not null then
      select a.data_mode into inherited_mode
      from public.reseller_applications a
      where a.id = new.application_id;
    end if;
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

commit;
