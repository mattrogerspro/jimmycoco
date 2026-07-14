# UK Salon Onboarding — Professional Spray-Tan Line

**Goal:** onboard NEW UK professional spray-tan salons as stockists of the **Jimmy Coco professional spray-tan line** (the Sunset 1‑litre professional solution). Introduce the brand, educate on the product, and convert to a professional sample kit.
**Audience:** UK salons / spray-tan professionals.
**Market:** 🇬🇧 UK
**Primary product (hero):** Sunset professional solution — 1 litre, 25–30 tans, Dark/Extra Dark 10% DHA. £60 / 1 litre.
**Primary CTA (every email):** *Request your sample kit* → https://jimmycoco.co.uk/pages/why-choose-pro-professional · trade enquiries pro@jimmycoco.co.uk
**Secondary (never the headline):** the take-home retail range (Self Tan Soufflé, Face Brush, glow balm) as an optional second revenue line, surfaced only in emails 5 & 6 via a side panel + secondary link.
**Style:** the rich UK-stockist template — 600px, Playfair Display / Arial, warm #e7dccd palette, hero imagery, matte-bronze CTAs. Self-contained (no MailerLite).
**ESP:** Resend (templates `uk-onboarding-1..7`). Only reserved var used: `{{{RESEND_UNSUBSCRIBE_URL}}}`.

## Cadence (7 emails)

| # | Alias | Subject | Hero |
|---|-------|---------|------|
| 1 | uk-onboarding-1-welcome | Your clients already know this name | Kendall |
| 2 | uk-onboarding-2-the-formula | The professional formula, in one litre | Sunset 1L |
| 3 | uk-onboarding-3-the-glow | The glow clients book again for | Glow model + application |
| 4 | uk-onboarding-4-red-carpet | The tan behind the red carpet | Kendall + Jimmy quote |
| 5 | uk-onboarding-5-the-commercial-case | Why the professional line pays for itself | Application *(secondary: retail)* |
| 6 | uk-onboarding-6-whats-included | What a Jimmy Coco partnership includes | Glow *(secondary: retail)* |
| 7 | uk-onboarding-7-become-a-stockist | Ready to bring it to your salon? | Kendall + trust strip |

## Images — IMPORTANT
Email images are hosted, not embedded. They live at **ASSET_BASE** (set in `build_uk.py`):
`https://jimmycoco.email/email-assets/uk-stockist/`
Deploy the JPGs in `assets/` to that path (or change ASSET_BASE and re-run `build_uk.py`). Source celeb/product shots were `.webp` (not email-safe); these are converted, resized sRGB JPGs.

## Notes
- Celebrity imagery is used **generically** (no named endorsements, no fabricated quotes). Only Kendall (tasteful/editorial) + the brand's own model/product shots are used. Kim/Kylie/Teyana were converted but left unused (too revealing for a trade audience + right-of-publicity risk) — confirm rights before using any identifiable celebrity.
- `build_uk.py` regenerates all 7 emails. `emails/*.html` are the production (Resend) versions with `{{{RESEND_UNSUBSCRIBE_URL}}}`.
