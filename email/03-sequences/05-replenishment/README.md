# Sunless Replenishment Sequence

The replenishment sequence helps an existing customer replace a product at the point it is likely to be running low, without pretending the brand knows the exact moment the product will be finished.

It must behave like useful timing support, not pressure. The system should use product type, quantity, purchase history, elapsed time, repeat behaviour and customer preferences to estimate an appropriate reminder window, then revalidate the product, variant, stock, price and consent before every send.

## Sequence documents

- [`00-sequence-architecture.md`](00-sequence-architecture.md) — purpose, cadence, eligibility and sequence logic
- [`01-replenishment-model-and-timing.md`](01-replenishment-model-and-timing.md) — product-level timing estimates and confidence rules
- [`02-entry-trigger-consent-and-suppression.md`](02-entry-trigger-consent-and-suppression.md) — entry, consent, exclusions and flow ownership
- [`03-email-01-you-may-be-running-low.md`](03-email-01-you-may-be-running-low.md) — first low-pressure reminder
- [`04-email-02-make-your-next-application-easy.md`](04-email-02-make-your-next-application-easy.md) — routine continuity and application support
- [`05-email-03-reorder-or-adjust-your-routine.md`](05-email-03-reorder-or-adjust-your-routine.md) — reorder, switch or adjust path
- [`06-branching-product-state-and-handoffs.md`](06-branching-product-state-and-handoffs.md) — product, purchase and customer-state branches
- [`07-resend-event-and-data-contract.md`](07-resend-event-and-data-contract.md) — Resend-ready events, payloads and idempotency
- [`08-measurement-testing-and-qa.md`](08-measurement-testing-and-qa.md) — incrementality, margin, quality and launch checks

## Governing principles

1. Treat replenishment timing as an estimate, not a fact.
2. Use one primary product or routine need per sequence.
3. Do not send when a newer purchase has already reset the clock.
4. Current product, variant, price, currency, stock and URL must be validated immediately before send.
5. Reorder convenience must not override customer consent or global contact-pressure rules.
6. Customers should be able to reorder, switch product, retake shade match or delay reminders.
7. Discounts are optional commercial tools, not the default reason to repurchase.
8. Approved product and people imagery must remain faithful to the source assets.

## Default sequence length

Three emails across an estimated replenishment window. The exact start date and spacing must be calculated from the product-level model and adjusted by customer behaviour.