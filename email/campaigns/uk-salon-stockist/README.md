# UK Salon Stockist Recruitment

**Goal:** recruit UK salons as stockists of the Jimmy Coco Malibu professional tan.
**Audience:** UK salons / tanning professionals.
**Market:** 🇬🇧 UK
**Offer / hook:** £60 / 1 litre professional solution — "your clients already know this name." Stockist package: exclusive trade pricing, marketing support, professional training, dedicated stockist support.
**Channel:** Email — **MailerLite** (note the merge tags and CDN-hosted images below).
**Status:** Email 1 live template; rest of sequence TBD.
**Primary CTA:** Order Now → https://jimmycoco.co.uk/pages/why-choose-pro-professional · trade enquiries pro@jimmycoco.co.uk

## Cadence

| # | Touch | Channel | Template |
|---|-------|---------|----------|
| 1 | Broadcast — "Your clients already know this name" | Email | `templates/01-your-clients-know-this-name.html` |
| 2+ | TBD | Email | — |

## Files
- `sequence.md` — the written content
- `templates/01-your-clients-know-this-name.html` — email 1 (production HTML)

## Notes — don't break these
- **Images** are hosted on the MailerLite CDN (`storage.mlcdn.com/account_image/2446693/…`). Keep those URLs live; if the MailerLite account changes, the images 404.
- **Merge tags** `{$unsubscribe}` and `{$forward}` are **MailerLite** syntax — they won't work in Resend or another ESP without translation.
- Built with a `Playfair Display` (serif) → Georgia fallback and Arial body stack; hero uses a background image with a VML fallback for Outlook.
