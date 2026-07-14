# VIP and Loyalty — Resend Event and Data Contract

## Purpose

Define the data, event, delivery and reply-handling contract required to operate VIP and loyalty communications through Resend without allowing the provider to become the source of truth for programme state.

## Ownership boundary

The application owns:

- VIP qualification;
- tier rules;
- benefit eligibility;
- milestone calculations;
- consent and suppression;
- programme state;
- message orchestration;
- rendered content inputs;
- idempotency;
- customer-service handoffs.

Resend owns message submission, provider delivery processing and delivery-event transport.

Resend webhook events must update delivery state, but they must not independently qualify, upgrade, downgrade or re-enrol a customer.

## Internal event names

Recommended application events:

- `vip.qualified`
- `vip.welcome_eligible`
- `vip.benefit_activated`
- `vip.benefit_reserved`
- `vip.benefit_redeemed`
- `vip.milestone_reached`
- `vip.review_started`
- `vip.tier_renewed`
- `vip.tier_upgraded`
- `vip.grace_period_started`
- `vip.tier_transitioned`
- `vip.status_disputed`
- `vip.support_handoff`
- `vip.message_suppressed`

Each event should include a stable event ID, occurred-at timestamp, programme version and source.

## Minimum orchestration record

```json
{
  "sequence_id": "vip_and_loyalty",
  "sequence_version": "1",
  "contact_id": "contact_123",
  "customer_id": "customer_123",
  "programme_version": "2026-01",
  "tier": "vip",
  "previous_tier": "standard",
  "lifecycle_event": "qualified",
  "event_id": "evt_123",
  "message_step": "welcome_to_vip",
  "market": "GB",
  "currency": "GBP",
  "benefit_ids": [],
  "consent_state": "subscribed",
  "scheduled_for": "2026-07-14T10:00:00Z"
}
```

Values are illustrative. Production enums must be defined centrally.

## Render payload

The rendering layer may receive:

- first name with safe fallback;
- tier display name;
- qualification or milestone description;
- effective and review dates;
- approved benefit title and terms;
- benefit availability window;
- current programme URL;
- account URL;
- support URL or reply address;
- approved product modules;
- market, currency and locale;
- legal and preference-management content.

Do not send raw spend history, internal risk scores, qualification calculations or sensitive service notes to the template unless explicitly required and approved.

## Pre-send validation

Immediately before every Resend submission, validate:

- current marketing consent or approved service-message basis;
- provider suppression and deliverability;
- current tier and programme version;
- event has not been superseded;
- benefit is active and operational;
- benefit terms match the destination experience;
- effective and expiry dates remain valid;
- product, price, currency, stock and URLs are current when shown;
- no unresolved complaint, safety issue or service-risk state blocks promotion;
- global contact-pressure policy permits the send;
- idempotency key has not already completed.

## Idempotency

Recommended key shape:

```text
vip:{programme_version}:{contact_id}:{event_id}:{message_step}:{content_version}
```

Persist the key before provider submission using an atomic operation.

Retries must reuse the same logical key. A provider timeout must be reconciled before another submission is attempted.

## Resend tags

Attach non-sensitive operational tags where supported:

- `channel=email`
- `programme=vip_loyalty`
- `message_step=welcome_to_vip`
- `programme_version=2026-01`
- `tier=vip`
- `market=GB`
- `content_version=v1`

Do not place names, email addresses, spend totals, complaint data or sensitive profile attributes in tags.

## Message classifications

Separate:

- marketing VIP messages;
- benefit or programme-service notices;
- transactional order messages;
- customer-support replies.

A programme-status notice may contain a service element, but that does not automatically permit unrelated promotional content.

## Webhook handling

The webhook endpoint must:

1. verify authenticity using the current Resend-supported verification method;
2. retain the provider event ID;
3. deduplicate repeated delivery;
4. store the raw event securely according to retention policy;
5. update internal message state;
6. trigger suppression or support workflows where required;
7. acknowledge promptly;
8. process expensive work asynchronously.

Expected event families include delivery, bounce, complaint, failure and engagement events supported by the connected Resend version.

## Delivery-state effects

- **Delivered:** update delivery state only.
- **Hard bounce:** suppress the address and cancel pending marketing sends.
- **Complaint:** suppress marketing immediately and create the appropriate review record.
- **Temporary failure:** retry only under approved delivery policy.
- **Unsubscribe:** update the application consent source of truth immediately.
- **Open:** treat as directional only; do not change tier or programme ownership.
- **Click:** record the destination and evaluate genuine downstream behaviour.

## Inbound replies

Replies should route according to intent:

- benefit question → loyalty support;
- status dispute → programme review queue;
- product or shade question → expert support;
- order issue → customer service;
- complaint → complaint workflow and promotional pause;
- unsubscribe request → immediate suppression.

Preserve threading metadata where available, but never expose provider IDs to the customer.

## Benefit redemption

Email clicks must not themselves mark a benefit as redeemed.

Redemption should occur only when the application receives a valid qualifying action, such as:

- completed purchase using the benefit;
- confirmed booking;
- accepted gift allocation;
- completed support action;
- verified account redemption.

Use an atomic redemption operation and preserve the originating benefit ID.

## MCP integration

When the Resend MCP is connected, it may assist with inspection, testing and controlled operations, but it must not bypass:

- application consent checks;
- tier and benefit logic;
- idempotency;
- approval workflows;
- environment separation;
- audit logging.

Production sends should continue to originate from the approved application workflow unless a documented emergency or manual-send procedure explicitly applies.

## Required observability

Track:

- internal message ID;
- Resend message ID;
- programme event ID;
- contact and customer IDs;
- message step and version;
- render timestamp;
- submission timestamp;
- delivery state;
- suppression reason;
- benefit ID where applicable;
- handoff or completion reason;
- last webhook timestamp.

Never treat the provider dashboard as the only operational record.