-- Preserve the latest bottle campaign attribution while the printed QR moves
-- to its permanent dynamic /q/bottle URL.
update public.qr_codes
set
  destination_url = 'https://jimmycoco.pro/?utm_source=pro_bottle',
  updated_at = now()
where code = 'bottle';
