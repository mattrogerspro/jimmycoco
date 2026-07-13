# AU Salon Account Flow — Post-Sample

**Goal:** carry a converted salon from "sample in hand" → "terms agreed" → "first order placed." Event-triggered, not scheduled.
**Audience:** AU salons that converted from [`../au-salon-seeding/`](../au-salon-seeding/).
**Market:** 🇦🇺 AU
**Channel:** Email + WhatsApp. ESP: Resend (touches 2 & 3 are transactional).
**Status:** Draft
**Handoff in:** `../au-salon-seeding/onboarding.md` (fires once the sample ships).

## Cadence (event-triggered)

| # | Trigger | Touch | File |
|---|---------|-------|------|
| 1 | ~3–5 days after dispatch | Sample-received check-in | `emails/1-sample-check-in.html` |
| 2 | after the setup call | Trade-terms summary | `emails/2-trade-terms-summary.html` |
| 3 | opening order placed | First-order confirmation | `emails/3-first-order-confirmation.html` |

## Files
- `sequence.md` — all three touches, email (plain) + WhatsApp, with tokens & triggers
- `emails/` — branded HTML: `1-sample-check-in`, `2-trade-terms-summary`, `3-first-order-confirmation`

## Notes — fill before sending
Commercial specifics are **placeholders** (no invented numbers): `{{wholesale_margin}}`, `{{min_opening_order}}`, `{{reorder_minimum}}`, `{{lead_time}}`, `{{order_number}}`, `{{order_summary}}`, `{{order_total}}`, `{{dispatch_date}}`, `{{tracking_link}}`, `{{order_link}}`, `{{support_email}}`.
