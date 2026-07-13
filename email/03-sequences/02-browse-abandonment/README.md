# Sunless Browse Abandonment Sequence

The browse-abandonment sequence follows up when a known, marketing-consented visitor shows meaningful product or collection interest but does not add an item to cart or purchase.

It must feel like helpful continuation, not surveillance. The sequence should reconnect the customer with the exact category, product or result they explored, resolve likely uncertainty and direct them back to a useful next step.

## Sequence documents

- [`00-sequence-architecture.md`](00-sequence-architecture.md) — purpose, cadence, priorities and exit rules
- [`01-entry-trigger-consent-and-suppression.md`](01-entry-trigger-consent-and-suppression.md) — eligibility, identity, consent and exclusions
- [`02-email-01-continue-exploring.md`](02-email-01-continue-exploring.md) — first reminder based on strongest browse signal
- [`03-email-02-guidance-and-differentiation.md`](03-email-02-guidance-and-differentiation.md) — product suitability and comparison guidance
- [`04-email-03-proof-and-confidence.md`](04-email-03-proof-and-confidence.md) — relevant results, reviews and method reassurance
- [`05-email-04-final-useful-reminder.md`](05-email-04-final-useful-reminder.md) — final low-pressure return path
- [`06-branching-personalisation-and-state.md`](06-branching-personalisation-and-state.md) — browse-intent ranking, branches and handoffs
- [`07-resend-event-and-data-contract.md`](07-resend-event-and-data-contract.md) — Resend-ready payload, events and idempotency
- [`08-measurement-testing-and-qa.md`](08-measurement-testing-and-qa.md) — reporting, experiments and release checks

## Governing principles

1. Use only meaningful browse behaviour, not incidental page views.
2. Never imply that the customer is being watched.
3. One strongest browse intent per sequence.
4. Cart creation transfers ownership to cart abandonment.
5. Purchase, withdrawal of consent or unavailable products suppress the sequence immediately.
6. Validate product, price, stock and URL immediately before send.
7. Use approved source product and people imagery without generative alteration.

## Default cadence

Four emails across approximately five days. Behaviour can shorten, pause or terminate the flow.