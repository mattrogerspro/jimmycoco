# Sunless Post-Purchase Education Sequence

The post-purchase education sequence begins after a customer completes a purchase and continues through preparation, application, result development, aftercare and confident repeat use.

Its purpose is not to sell immediately. It is to protect the customer’s first experience, reduce avoidable application mistakes, answer practical questions before they become support tickets and strengthen long-term product confidence.

## Sequence documents

- [`00-sequence-architecture.md`](00-sequence-architecture.md) — purpose, cadence, product states and exit rules
- [`01-entry-trigger-order-state-and-suppression.md`](01-entry-trigger-order-state-and-suppression.md) — eligibility, fulfilment state and exclusions
- [`02-email-01-order-confidence-and-what-happens-next.md`](02-email-01-order-confidence-and-what-happens-next.md) — immediate reassurance and preparation
- [`03-email-02-prepare-for-your-best-result.md`](03-email-02-prepare-for-your-best-result.md) — preparation guidance before use
- [`04-email-03-how-to-apply-your-product.md`](04-email-03-how-to-apply-your-product.md) — product-specific application education
- [`05-email-04-development-and-first-result.md`](05-email-04-development-and-first-result.md) — development timing and first-result expectations
- [`06-email-05-aftercare-and-longer-lasting-colour.md`](06-email-05-aftercare-and-longer-lasting-colour.md) — maintenance and fade quality
- [`07-email-06-review-support-and-next-step.md`](07-email-06-review-support-and-next-step.md) — support, feedback and careful transition to retention
- [`08-branching-product-state-and-service-handoffs.md`](08-branching-product-state-and-service-handoffs.md) — product families, fulfilment state and support ownership
- [`09-resend-event-and-data-contract.md`](09-resend-event-and-data-contract.md) — Resend-ready events, payloads and idempotency
- [`10-measurement-testing-and-qa.md`](10-measurement-testing-and-qa.md) — experience metrics, testing and release criteria

## Governing principles

1. Service before selling.
2. Guidance must match the actual product, variant and intended use purchased.
3. Fulfilment and delivery state govern timing.
4. Do not send “how to use” instructions before the product is likely to arrive unless the message is explicitly framed as preparation.
5. Transactional order communications remain separate from marketing education.
6. Support issues, refunds, cancellations and failed deliveries override promotional or review requests.
7. Use approved product, customer and instructional assets without generative alteration.
8. Every message must include a useful plain-text version.

## Default sequence length

Six educational emails across approximately 14–21 days, adapted to dispatch, delivery, product type, development time, repeat-purchase behaviour and support state.