begin;

-- Keep the database catalogue's reference prices aligned with
-- pro-site/retail-pricing.json. Quantity tiers are calculated from that same
-- file by the portal at display time and again when an order is submitted.
update public.reseller_products
set retail_price_pence = 6000,
    trade_price_pence = 6000
where sku = 'MALIBU-1L';

update public.reseller_products
set retail_price_pence = 1550,
    trade_price_pence = 1250
where sku = 'MITT-BUFF-GLOW';

update public.reseller_products
set retail_price_pence = 2200,
    trade_price_pence = 1400
where sku = 'SOUFFLE-SELF-TAN';

update public.reseller_products
set retail_price_pence = 5900,
    trade_price_pence = 4900
where sku = 'KIT-A-LIST-GLOW';

commit;
