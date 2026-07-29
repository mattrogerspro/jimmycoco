# Professional Litre Offer — HTML email

Direct conversion of the supplied Klaviyo campaign screenshot
(`screencapture-klaviyo-campaign-01KYJH0DS5FG9T687A91H3VN5V-web-view-2026-07-28-12_41_46.png`,
3600 × 11193) into a production-ready HTML email.

## Files

| File | Use |
|---|---|
| `index.html` | Local preview — image `src` paths are relative to `images/` |
| `email.html` | Send-ready — image `src` paths are absolute `https://jimmycoco.email/email-assets/professional-litre-offer/…` |
| `email.txt` | Plain-text multipart alternative |
| `images/*.jpg` | The 10 design modules, 1200px wide (2× retina for a 600px email) |
| `images/*.webp` | Same modules as WebP, ~50% smaller — swap in if you drop Outlook 2016–2019 support |
| `images/icon-*.png` | Footer social icons, 48px (2× of 24px) |

## Hosting

`email.html` expects the image folder at:

```
https://jimmycoco.email/email-assets/professional-litre-offer/
```

Copy `images/` to `public/email-assets/professional-litre-offer/` in this repo and deploy,
or change the base path at the top of `email.html`.

## How it was built

The email canvas was located inside the screenshot at x 1055–2554, y 130–11138
(1500 × 11009 — a 600px design captured at 2.5×), then cut at eleven boundaries detected
from uniform-colour bands and hard horizontal transitions, so the modules stack back into
the original canvas with no visible seams.

| # | Module | Display size | JPEG |
|---|---|---|---|
| 01 | Brand header | 600 × 89 | 11 KB |
| 02 | Hero — Shop Professional | 600 × 372 | 101 KB |
| 03 | Offer headline | 600 × 280 | 52 KB |
| 04 | Demand story + free gift | 600 × 619 | 197 KB |
| 05 | One solution editorial | 600 × 749 | 188 KB |
| 06 | Professional benefits | 600 × 415 | 110 KB |
| 07 | Lifestyle collection | 600 × 414 | 115 KB |
| 08 | Therapist quote | 600 × 336 | 79 KB |
| 09 | Exclusive offer / redemption | 600 × 611 | 148 KB |
| 10 | Formulation icons | 600 × 322 | 25 KB |

Total payload **≈1.0 MB** (≈0.5 MB with the WebP set). Rendered height 4,524px desktop / 2,982px at 375px.

## Email-client engineering

- 600px table layout with an MSO conditional wrapper for Outlook (Word engine).
- Every slice is `width:100%; max-width:600px; height:auto; display:block` inside a
  `font-size:0; line-height:0` cell — no 1px gaps between stacked images.
- Fluid scaling: the whole stack resizes as one canvas, so it behaves correctly at any width
  without a separate mobile image set.
- Hidden preheader plus zero-width-space padding so no body copy leaks into the inbox preview.
- Descriptive `alt` text on every module — the full offer, terms and redemption address are
  readable with images blocked.
- A **bulletproof HTML text button** under module 09, so the primary CTA still works when
  images are off.
- Live-text footer on `#664834`: copyright, Terms / Refund / Privacy / Unsubscribe links and the
  registered address are real text, not pixels.
- `color-scheme: light only` plus `prefers-color-scheme` and `[data-ogsc]` overrides to stop
  Outlook.com and Apple Mail inverting the cream and brown palette.
- `format-detection` off so iOS doesn't auto-link the address or turn the offer into a date.

## Before sending — items to confirm

1. **`{{unsubscribe_url}}`** in the footer is an ESP-neutral placeholder. Replace with your
   ESP's tag (Klaviyo `{% unsubscribe %}`, Resend `{{unsubscribe_link}}`, MailerLite `{$unsubscribe}`).
2. **Redemption address** — the artwork reads `PROSALES@JIMMYCOCO.CO.UK` (one "CO", not "COCO").
   Confirm this is the live monitored inbox before send; all three CTAs `mailto:` it.
3. **Policy links** assume Shopify paths on `jimmycoco.co.uk`. Verify they resolve.
4. **Social URLs** in the footer are placeholders — confirm the real profile URLs.
5. **Copyright year** was updated from the artwork's `2024` to `2026`.
6. **Offer terms** — RRP £22.00, the 2-for-4 mechanic and "limited time only" carry no dates.
   Confirm the price and add a real end date, or drop the urgency line.
7. **Subject line and preheader** — the preheader is set; the subject still needs choosing.
