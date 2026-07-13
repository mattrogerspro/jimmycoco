# Resend Event and Data Contract

## Purpose

Define the implementation boundary between the Sunless application, the welcome-sequence orchestration layer and Resend.

Resend is the delivery and inbound-email provider. The application remains the source of truth for consent, customer state, sequence state, product data, recommendation logic and send eligibility.

## Responsibilities

### Application

- stores consent and suppression state;
- determines sequence eligibility;
- schedules and selects the next welcome message;
- resolves personalisation and product data;
- renders HTML and plain text from approved templates;
- creates idempotency keys;
- records the internal message before sending;
- processes Resend webhook events;
- handles retries, suppression and sequence transitions.

### Resend

- accepts the prepared outbound message;
- delivers to the recipient mailbox;
- returns provider message identifiers;
- emits delivery, bounce, complaint and engagement events where available;
- receives replies or inbound messages when configured.

## Canonical send request

The application should produce an internal request similar to:

```json
{
  "message_type": "marketing",
  "sequence_key": "welcome_v1",
  "sequence_step": "email_01",
  "contact_id": "contact_123",
  "to": "customer@example.com",
  "from_key": "marketing_default",
  "subject": "Welcome to Sunless by Jimmy Coco",
  "html": "<rendered html>",
  "text": "Rendered plain text",
  "headers": {
    "List-Unsubscribe": "<https://example.com/unsubscribe/...>"
  },
  "tags": {
    "lifecycle": "welcome",
    "step": "01",
    "template_version": "welcome-email-01@1.0.0"
  },
  "idempotency_key": "welcome:contact_123:email_01:v1"
}
```

Field names may change during implementation, but the ownership and audit requirements must remain.

## Required template data

Shared fields:

- `contact_id`
- `email`
- `first_name` or neutral fallback
- `country`
- `currency`
- `locale`
- `unsubscribe_url`
- `preference_centre_url`
- `view_in_browser_url` where supported
- `sequence_version`
- `template_version`

Conditional fields:

- `shade_match_status`
- `recommendation_id`
- `recommended_product`
- `recommended_variant`
- `recommendation_reason`
- `product_price`
- `product_currency`
- `product_availability`
- `product_image_url`
- `result_story_ids`
- `incentive` and terms when approved

## Pre-send record

Create an internal message record before calling Resend:

- internal message ID;
- contact ID;
- sequence and step;
- template version;
- rendered-data snapshot or safe reference;
- idempotency key;
- scheduled time;
- eligibility-decision version;
- status `prepared`.

After provider acceptance, store the Resend message ID and set status to `accepted` or equivalent.

## Idempotency

A retry must not produce duplicate welcome emails. Use one stable key for the logical message. Do not generate a fresh key merely because a network call timed out.

Recommended pattern:

```text
welcome:{sequence_version}:{contact_id}:{step_key}
```

## Webhook events

Process at minimum:

- delivered;
- delivery delayed, where available;
- bounced;
- complained;
- opened, where available and legally appropriate;
- clicked, where available;
- unsubscribed through the application;
- inbound reply, when configured.

Webhook processing must verify authenticity, deduplicate provider event IDs and remain replay-safe.

## Event consequences

### Delivered
Update delivery state only. Do not equate delivery with engagement.

### Hard bounce
Suppress the address, stop the sequence and prevent further marketing sends.

### Complaint
Suppress immediately and preserve an audit record.

### Open
Use cautiously because privacy features can make opens unreliable. Do not use opens alone for high-impact personalisation.

### Click
Record destination and message context. A click may update engagement state but must not create sensitive inferred traits.

### Purchase
This should come from the commerce application, not Resend. Exit the welcome sequence and route to post-purchase.

### Reply
Route according to the configured inbound-email workflow. Do not leave customer replies in an unmonitored mailbox.

## Tagging convention

Every welcome message should include stable provider tags or metadata for:

- environment;
- lifecycle flow;
- sequence version;
- sequence step;
- template version;
- audience branch;
- experiment ID where applicable.

Do not place sensitive personal data in provider tags.

## Failure handling

- retry temporary provider failures with bounded backoff;
- do not retry permanent validation failures without correction;
- place exhausted failures into an operational queue;
- alert on abnormal bounce, complaint or rejection rates;
- preserve the exact error and attempted payload metadata without logging unnecessary personal content.

## MCP readiness

When the Resend MCP is connected, it may assist with inspection, controlled test sends, event investigation and template validation. It must not bypass the application’s consent, approval, idempotency or environment controls.

## Release gate

No welcome message may enter production until:

- domain authentication is healthy;
- sender identities are approved;
- webhook verification is configured;
- suppression processing is tested;
- unsubscribe behaviour is verified;
- idempotency is tested;
- HTML and plain text are approved;
- seed-list delivery has been reviewed.