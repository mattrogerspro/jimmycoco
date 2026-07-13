# Sunless Shade-Match Follow-Up Sequence

This sequence begins after a customer completes the Sunless shade match, receives a recommendation and does not complete a purchase.

It is a recommendation-confidence flow, not a generic welcome flow. The customer has already provided useful intent data, so every message should preserve and build on that context rather than restarting broad education.

## Sequence documents

- [`00-sequence-architecture.md`](00-sequence-architecture.md) — role, cadence, branches and exit rules
- [`01-entry-trigger-consent-and-suppression.md`](01-entry-trigger-consent-and-suppression.md) — eligibility, consent and exclusions
- [`02-email-01-your-personal-match.md`](02-email-01-your-personal-match.md) — immediate recommendation recap
- [`03-email-02-why-this-result-suits-you.md`](03-email-02-why-this-result-suits-you.md) — recommendation rationale
- [`04-email-03-how-to-use-your-match.md`](04-email-03-how-to-use-your-match.md) — application confidence
- [`05-email-04-real-results-like-yours.md`](05-email-04-real-results-like-yours.md) — relevant proof
- [`06-email-05-complete-your-routine.md`](06-email-05-complete-your-routine.md) — restrained routine support
- [`07-email-06-final-confidence-reminder.md`](07-email-06-final-confidence-reminder.md) — final non-pressured reminder
- [`08-branching-personalisation-and-state.md`](08-branching-personalisation-and-state.md) — behavioural logic and state transitions
- [`09-resend-event-and-data-contract.md`](09-resend-event-and-data-contract.md) — Resend-ready event and payload contract
- [`10-measurement-testing-and-qa.md`](10-measurement-testing-and-qa.md) — reporting, testing and release criteria

## Governing principles

1. Preserve the customer’s actual recommendation state.
2. Never fabricate certainty, undertone or skin-profile data.
3. One primary message and one primary CTA per email.
4. Stop or change the flow when the customer purchases, starts checkout, changes their match or withdraws consent.
5. Revalidate product availability, price, variant and destination URL before every send.
6. Customer, celebrity and product imagery must use approved source assets without generative alteration.
7. Every HTML email must have a useful plain-text version.

## Default sequence length

Six emails over approximately nine days. Behaviour may shorten, pause or terminate the sequence.