# Email Rendering and Delivery Workflow

## Purpose

Define how an email moves from approved strategy and template source to a delivered Resend message.

## Production stages

1. Select template family and sequence position.
2. Load approved content and data contract.
3. Render with representative test data.
4. Generate HTML and plain-text versions.
5. Validate links, fallbacks, images and legal content.
6. Preview at desktop and mobile widths.
7. Test across priority inbox clients.
8. Send to an internal seed list.
9. Approve content, rendering and tracking.
10. Send through Resend using the approved sender identity.
11. Record the Resend message identifier against the internal send record.
12. Process delivery events through verified webhooks.

## Environments

### Local
Use fixtures and non-sensitive test data. No production audience sends.

### Preview
Use approved internal recipients and a clearly marked preview subject. Suppress lifecycle automation.

### Production
Use verified sending domains, approved audiences, consent checks and idempotency controls.

## Idempotency

Every automated message should have an internal send key derived from recipient, flow, message step and triggering event. Before sending, confirm the same logical message has not already been delivered or queued.

## Render validation

Confirm:
- no unresolved variables;
- all optional fields have safe fallbacks;
- all images include useful alt text;
- links resolve to approved destinations;
- the first CTA matches the email objective;
- legal and preference links are present where required;
- the plain-text version communicates the full essential message.

## Event handling

Delivery events should update the internal message record rather than act as the only source of truth. Event processing must tolerate duplicates, delayed delivery and out-of-order arrival.

## Failure policy

- Retry temporary send failures with bounded backoff.
- Do not endlessly retry permanent failures.
- Suppress known hard-bounce addresses.
- Record complaint and unsubscribe events immediately.
- Route webhook-processing failures to observability and replay tooling.

## Approval gate

No email template or sequence step is production-ready until it passes design, copy, accessibility, data, legal, deliverability and event-tracking review.
