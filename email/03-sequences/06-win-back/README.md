# Sunless Win-Back Sequence

The win-back sequence re-engages previously active customers whose purchase or engagement behaviour has materially lapsed.

It must not treat every quiet customer as disengaged, nor rely on repetitive discounts. Its role is to understand likely reasons for inactivity, reintroduce relevant value, offer a low-friction route back and respect customers who no longer wish to hear from the brand.

## Sequence documents

- [`00-sequence-architecture.md`](00-sequence-architecture.md) — purpose, cadence, eligibility and exit rules
- [`01-lapse-model-and-segmentation.md`](01-lapse-model-and-segmentation.md) — inactivity thresholds, confidence and customer segments
- [`02-entry-trigger-consent-and-suppression.md`](02-entry-trigger-consent-and-suppression.md) — entry, consent, exclusions and flow ownership
- [`03-email-01-we-have-missed-you.md`](03-email-01-we-have-missed-you.md) — soft reintroduction and relevant return path
- [`04-email-02-what-is-new-and-useful.md`](04-email-02-what-is-new-and-useful.md) — meaningful product, routine or guidance update
- [`05-email-03-a-reason-to-return.md`](05-email-03-a-reason-to-return.md) — optional policy-controlled offer or high-value reason to re-engage
- [`06-email-04-preference-reset-or-farewell.md`](06-email-04-preference-reset-or-farewell.md) — preference reset, pause or respectful closure
- [`07-branching-customer-state-and-handoffs.md`](07-branching-customer-state-and-handoffs.md) — lifecycle branches, reactivation and suppression
- [`08-resend-event-and-data-contract.md`](08-resend-event-and-data-contract.md) — Resend-ready events, payloads and idempotency
- [`09-measurement-testing-and-qa.md`](09-measurement-testing-and-qa.md) — incrementality, margin, list quality and release checks

## Governing principles

1. Define lapse relative to the customer’s normal cycle, not one universal number.
2. Use current customer value and recent service history carefully; do not target unresolved complaints.
3. Start with relevance, guidance and product value before incentives.
4. Never imply that the customer owes the brand attention or a purchase.
5. Purchase, active cart, support escalation, unsubscribe or complaint must suppress the sequence immediately.
6. Every send must revalidate consent, deliverability, product data, price, stock, URLs and contact pressure.
7. Give customers a clear route to reduce frequency, change preferences, pause or unsubscribe.
8. Approved product, customer and celebrity imagery must remain faithful to the original source assets.

## Default sequence length

Four emails across approximately 14–21 days. Timing and message count should vary by lapse confidence, customer history and behaviour.