# Post-Purchase Education — Resend Event and Data Contract

## Purpose

Define the application-owned data and Resend delivery contract required to operate the sequence safely.

The application owns eligibility, timing, content selection, consent, order state and idempotency. Resend renders and delivers the prepared message and returns delivery events.

## Source events

Recommended application events:

- `order.confirmed`
- `order.cancelled`
- `order.refunded`
- `order.partially_refunded`
- `order.returned`
- `fulfilment.dispatched`
- `fulfilment.in_transit`
- `fulfilment.delivered`
- `fulfilment.delayed`
- `fulfilment.failed`
- `support.case_opened`
- `support.case_resolved`
- `review.submitted`
- `marketing.consent_changed`

Events must include stable identifiers, event time and source version.

## Sequence instance

Minimum record:

```json
{
  "sequence_instance_id": "pp_...",
  "sequence_key": "post_purchase_education",
  "sequence_version": "1",
  "contact_id": "contact_...",
  "order_id": "order_...",
  "fulfilment_ids": ["fulfilment_..."],
  "product_profiles": [],
  "current_step": 1,
  "status": "active",
  "pause_reason": null,
  "entered_at": "ISO-8601",
  "completed_at": null
}
```

## Render payload

Each send job should receive validated data such as:

```json
{
  "message_key": "post_purchase.email_03",
  "sequence_instance_id": "pp_...",
  "contact": {
    "id": "contact_...",
    "email": "customer@example.com",
    "first_name": "Customer",
    "locale": "en-GB",
    "timezone": "Europe/London"
  },
  "order": {
    "id": "order_...",
    "status": "fulfilled",
    "currency": "GBP"
  },
  "fulfilment": {
    "status": "delivered",
    "delivered_at": "ISO-8601"
  },
  "products": [],
  "content_profile": "body_souffle_first_time",
  "primary_url": "https://...",
  "support_url": "https://...",
  "consent": {
    "marketing": true,
    "checked_at": "ISO-8601"
  }
}
```

Never send raw internal secrets, unsupported personal attributes or unnecessary customer data to the template.

## Resend send requirements

Every request should include:

- approved sending domain and sender identity;
- recipient address;
- subject and preview-text-aware HTML;
- useful plain-text body;
- stable tags for sequence, step, order class and experiment;
- unique idempotency key;
- correlation identifier stored before dispatch.

Recommended tags:

- `channel=email`
- `flow=post_purchase_education`
- `step=email_01` through `email_06`
- `sequence_version=1`
- `customer_state=first_order` or `repeat_order`
- `experiment=<assignment>` when applicable

Do not include email addresses, order numbers or other direct personal data in provider tags.

## Idempotency

Construct a stable key from:

`post_purchase_education:{sequence_instance_id}:{step}:{content_version}`

Persist the planned message before calling Resend. A timeout or ambiguous response must trigger reconciliation, not an immediate duplicate retry.

## Pre-send transaction

Immediately before send:

1. lock or atomically claim the message job;
2. reload order, fulfilment, support, consent and suppression state;
3. validate the exact product instruction profile;
4. render HTML and text;
5. persist content version, payload checksum and idempotency key;
6. call Resend;
7. store provider message ID and accepted state;
8. release or complete the job.

## Webhook handling

Process Resend events for accepted, delivered, delayed, bounced, complained and other supported outcomes.

Webhook processing must:

- verify authenticity according to current Resend guidance;
- store the raw event securely;
- deduplicate by provider event ID;
- update the message record idempotently;
- apply suppression immediately for complaints and permanent failures;
- avoid treating opens as reliable evidence of product use or satisfaction.

## Event ordering

Provider events may arrive late, duplicated or out of order. Preserve event history and derive current delivery state deterministically rather than overwriting blindly.

## Inbound replies

When replies are enabled through Resend receiving:

- associate the inbound message with the outbound correlation ID where possible;
- create or update a customer-support conversation;
- scan and store attachments under the approved security policy;
- never feed inbound content directly into an automated marketing response without validation;
- pause the post-purchase sequence when the reply indicates a service, safety or delivery issue.

## Failure policy

- Template validation failure: do not send; alert and retain the job.
- Missing product instructions: suppress the step and escalate content debt.
- Temporary provider failure: retry with bounded backoff and the same idempotency key.
- Permanent bounce or complaint: suppress the address immediately.
- Missing delivery data: use conservative timing and non-confirmatory wording or pause.

## MCP readiness

When the Resend MCP is connected, it may inspect delivery state, templates, domains and operational records only within approved permissions. It must not become the source of truth for consent, commerce, sequence eligibility or customer lifecycle state.