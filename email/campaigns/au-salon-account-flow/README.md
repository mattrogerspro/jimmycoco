# AU Salon — Post-Sample Account Flow

_Channel: email + WhatsApp · Audience: salons that have converted from the cold campaign · Built July 2026_

The partner lifecycle that begins **after** a salon says yes and the sample ships — carrying them from "sample in hand" → "terms agreed" → "first order placed." Event-triggered, not scheduled.

**Handoff:** the bridge in is `../au-salon-seeding/onboarding.md` ("yes — here's what's next"). This flow starts once the sample is on its way.

## The three touches

| # | Trigger | Purpose |
|---|---|---|
| 1 · Sample-received check-in | ~3–5 days after dispatch / on delivery | Get them to trial it + book the setup call |
| 2 · Trade-terms summary | Straight after the setup call | Put agreed terms in writing; make the opening order easy |
| 3 · First-order confirmation | Opening order placed | Confirm, set expectations, kick off onboarding |

## Contents

| File | What it is |
|---|---|
| `account-flow.md` | Copy-ready — all three touches, email (plain) + WhatsApp, tokens, triggers. |
| `templates/account-01-sample-check-in.html` | Branded check-in email. |
| `templates/account-02-trade-terms-summary.html` | Branded terms summary (with terms table). |
| `templates/account-03-first-order-confirmation.html` | Branded order confirmation (with order block). |

## Important — fill the commercial tokens
No prices or terms are invented. These are placeholders to complete with your real numbers before sending touches 2 and 3:
`{{wholesale_margin}}` · `{{trade_discount}}` · `{{min_opening_order}}` · `{{reorder_minimum}}` · `{{lead_time}}` · `{{order_number}}` · `{{order_summary}}` · `{{order_total}}` · `{{dispatch_date}}` · `{{tracking_link}}` · `{{order_link}}` · `{{support_email}}`

## Sending
Touches 2 and 3 are transactional — natural fits for **Resend** (see `../au-salon-seeding/README.md` for the Resend/domain-auth note). Touch 1 can go plain-text or branded.

## Extends into
Replenishment reminders, a reorder nudge, and a first-week-of-tans check-in turn this into an ongoing account relationship — easy to add next.
