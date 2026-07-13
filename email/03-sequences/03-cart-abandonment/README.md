# Sunless Cart Abandonment Sequence

The cart-abandonment sequence follows up when a known, eligible customer adds one or more products to cart but does not complete checkout.

It must preserve the cart accurately, remove friction, answer the most likely purchase concerns and return the customer to a recoverable checkout state. It must not use fabricated scarcity, misleading stock language or automatic discounting.

## Sequence documents

- [`00-sequence-architecture.md`](00-sequence-architecture.md) — purpose, cadence, ownership and exit rules
- [`01-entry-trigger-consent-and-suppression.md`](01-entry-trigger-consent-and-suppression.md) — eligibility, cart identity and exclusions
- [`02-email-01-your-cart-is-ready.md`](02-email-01-your-cart-is-ready.md) — immediate cart recovery
- [`03-email-02-confidence-and-objection-handling.md`](03-email-02-confidence-and-objection-handling.md) — suitability, delivery and returns reassurance
- [`04-email-03-proof-and-routine-context.md`](04-email-03-proof-and-routine-context.md) — relevant proof and product-use confidence
- [`05-email-04-final-cart-reminder.md`](05-email-04-final-cart-reminder.md) — final restrained recovery message
- [`06-branching-cart-state-and-handoffs.md`](06-branching-cart-state-and-handoffs.md) — cart mutations, checkout state and cross-flow ownership
- [`07-resend-event-and-data-contract.md`](07-resend-event-and-data-contract.md) — Resend-ready events, payloads and idempotency
- [`08-measurement-testing-and-qa.md`](08-measurement-testing-and-qa.md) — reporting, experimentation and release standards

## Governing principles

1. The live cart is the source of truth.
2. Never show stale prices, quantities, variants, discounts or stock states.
3. Checkout and purchase events suppress recovery immediately.
4. One primary CTA should restore the active cart or checkout.
5. Discounts are controlled commercial decisions, not a default recovery tactic.
6. Delivery, returns and suitability information must be accurate for the customer’s market.
7. Product and people imagery must use approved source assets without generative alteration.
8. Every HTML message requires a useful plain-text alternative.

## Default cadence

Four emails over approximately four days. Timing must adapt to checkout activity, cart changes, local time, contact pressure and stock state.