# IE Salon Onboarding — Professional Spray-Tan Line

**Goal:** onboard NEW Irish (Republic of Ireland) professional spray-tan salons as stockists of the **Jimmy Coco professional spray-tan line** (the Sunset 1‑litre professional solution). Introduce the brand, educate on the product, and convert to a professional sample kit.
**Audience:** Irish salons / spray-tan professionals.
**Market:** 🇮🇪 IE
**Localised from:** `uk-salon-onboarding` (same style, imagery and structure).
**Primary product (hero):** Sunset professional solution — 1 litre, 25–30 tans, Dark/Extra Dark 10% DHA. **£60 / 1 litre (GBP — kept in pounds per owner decision).**
**Delivery line:** "fast delivery to Ireland" (per owner instruction, 2026-07-21).
**Primary CTA (every email):** *Request your sample kit* → https://jimmycoco.co.uk/pages/why-choose-pro-professional · trade enquiries pro@jimmycoco.co.uk
**Secondary (never the headline):** the take-home retail range (Self Tan Soufflé, Face Brush, glow balm) as an optional second revenue line, surfaced only in emails 5 & 6 via a side panel + secondary link.
**Style:** the rich UK-stockist template — 600px, Playfair Display / Arial, warm #e7dccd palette, hero imagery, matte-bronze CTAs. Self-contained (no MailerLite).
**ESP:** Resend (templates `ie-onboarding-1..7`). Only reserved var used: `{{{RESEND_UNSUBSCRIBE_URL}}}`.

## Status
**DISABLED / draft.** Templates are intended to be created in Resend as **drafts** only. Not registered in `shared/campaign-registry.js` and not enabled for sending. `resend.json` has `publish: false`. Do not enable, publish or send without fresh explicit approval.

## Cadence (7 emails)

| # | Alias | Subject | Hero |
|---|-------|---------|------|
| 1 | ie-onboarding-1-welcome | Now landing in Irish salons: the celebrity spray tan | Kendall |
| 2 | ie-onboarding-2-the-formula | The professional formula, now stocked in Ireland | Sunset 1L |
| 3 | ie-onboarding-3-the-glow | The glow Irish clients keep rebooking for | Glow model + application |
| 4 | ie-onboarding-4-red-carpet | The red-carpet tan — now for salons across Ireland | Kendall + Jimmy quote |
| 5 | ie-onboarding-5-the-commercial-case | Why Irish salons are adding this to their price list | Application *(secondary: retail)* |
| 6 | ie-onboarding-6-whats-included | Inside a Jimmy Coco Ireland stockist partnership | Glow *(secondary: retail)* |
| 7 | ie-onboarding-7-become-a-stockist | Ready to bring it to your Irish salon? | Kendall + trust strip |

## Localisation notes (vs UK)
- UK → Ireland / Irish salons throughout (emails 1 & 7 copy, email 1 preview).
- "fast UK delivery" → "fast delivery to Ireland" (email 1 CTA subline, email 2 price note, email 7 trust strip).
- Pricing **unchanged**: £60 / 1 litre (GBP), per owner decision — no EUR conversion.
- Aliases `uk-onboarding-*` → `ie-onboarding-*`; template names `IE Onboarding N — …`.
- Imagery **reused** from the UK sequence (`ASSET_BASE = …/email-assets/uk-stockist/`) — identical celebrity/product shots, no new asset deploy required.
- Brand header uses the shared approved `assets/email/logo.webp`, delivered from `https://jimmycoco.email/email-assets/logo.webp`; the legacy live-text wordmark must not be restored.
- Trade email and pro URL unchanged (`pro@jimmycoco.co.uk`, `/pages/why-choose-pro-professional`).

## Build
- `python3 build_ie.py` regenerates all 7 emails into `emails/`.
- `emails/*.html` are the production (Resend) versions with `{{{RESEND_UNSUBSCRIBE_URL}}}`.

## Notes
- Celebrity imagery is used **generically** (no named endorsements, no fabricated quotes) — same treatment as the UK sequence. Confirm rights before using any identifiable celebrity.
