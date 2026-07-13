# Sunless Welcome Sequence

The welcome sequence is the first owned relationship after a customer subscribes, completes a shade match, creates an account or opts into marketing during checkout.

It must not behave like a generic discount funnel. Its purpose is to introduce Jimmy Coco’s professional method, reduce anxiety about choosing and applying self-tan, establish product confidence and guide the subscriber toward the most relevant first purchase.

## Sequence documents

- [`00-sequence-architecture.md`](00-sequence-architecture.md) — goals, cadence, branches and stop conditions
- [`01-entry-trigger-consent-and-suppression.md`](01-entry-trigger-consent-and-suppression.md) — eligibility, consent and exclusions
- [`02-email-01-welcome-and-brand-promise.md`](02-email-01-welcome-and-brand-promise.md) — immediate welcome
- [`03-email-02-the-jimmy-coco-method.md`](03-email-02-the-jimmy-coco-method.md) — authority and education
- [`04-email-03-find-your-right-result.md`](04-email-03-find-your-right-result.md) — shade and format guidance
- [`05-email-04-real-results-and-proof.md`](05-email-04-real-results-and-proof.md) — credible customer evidence
- [`06-email-05-personal-recommendation.md`](06-email-05-personal-recommendation.md) — product recommendation and purchase path
- [`07-email-06-your-complete-routine.md`](07-email-06-your-complete-routine.md) — preparation, application and finish
- [`08-branching-personalisation-and-state.md`](08-branching-personalisation-and-state.md) — behavioural branches and state transitions
- [`09-resend-event-and-data-contract.md`](09-resend-event-and-data-contract.md) — Resend-ready implementation contract
- [`10-measurement-testing-and-qa.md`](10-measurement-testing-and-qa.md) — reporting, testing and release criteria

## Governing principles

1. Guidance before promotion.
2. One primary message and one primary CTA per email.
3. No email gate before shade-match results.
4. Purchase and browse behaviour must suppress irrelevant messages.
5. Claims, review data, celebrity imagery and product imagery must use approved source assets and verified wording.
6. Every HTML email must include a useful plain-text alternative.
7. Transactional and service messages must remain operationally separate from marketing consent.

## Default sequence length

Six emails over approximately ten days. Timing may be compressed or extended by behaviour, but the subscriber must never receive multiple welcome messages on the same day unless they explicitly request information.