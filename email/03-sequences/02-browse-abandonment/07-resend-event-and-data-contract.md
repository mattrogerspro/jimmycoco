# Browse Abandonment — Resend Event and Data Contract

## Purpose

Define the application-owned data, rendering payload, send request and webhook handling required to operate the browse-abandonment sequence through Resend.

Resend is the delivery provider. The application remains responsible for consent, eligibility, lifecycle state, content selection, rendering data, idempotency and suppression decisions.

## Trigger events

The application may evaluate browse eligibility from first-party events such as:

- `product_viewed`
- `product_engaged`
- `variant_viewed`
- `collection_viewed`
- `collection_filtered`
- `result_viewed`
- `result_product_clicked`
- `shade_match_result_viewed`
- `session_ended`

These event names are implementation recommendations, not provider-defined Resend events.

Each event should include:

- stable event ID;
- contact or anonymous profile ID;
- session ID;
- event timestamp;
- product, variant, collection or result identifiers;
- page URL or route identifier;
- consent and identity context where appropriate;
- source and campaign attribution where available;
- schema version.

Do not place unnecessary sensitive data in event payloads.

## Sequence-entry event

When eligibility is confirmed, create an internal event such as:

`browse_abandonment_entered`

Recommended payload:

```json
{
  "event_id": "evt_...",
  "contact_id": "contact_...",
  "sequence_instance_id": "browse_...",
  "intent_type": "single_product",
  "intent_score": 0.82,
  "product_id": "prod_...",
  "variant_id": null,
  "collection_id": null,
  "source_session_id": "session_...",
  "entered_at": "ISO-8601",
  "schema_version": 1
}
```

The score is internal and must not be presented to the recipient.

## Pre-send payload

Build a validated rendering payload immediately before each send.

Recommended fields:

```json
{
  "message_id": "msg_...",
  "sequence_instance_id": "browse_...",
  "step": 1,
  "template_key": "browse_continue_exploring",
  "contact": {
    "id": "contact_...",
    "email": "customer@example.com",
    "first_name": null,
    "locale": "en-GB",
    "currency": "GBP",
    "timezone": "Europe/London"
  },
  "intent": {
    "type": "single_product",
    "product_id": "prod_...",
    "variant_id": null,
    "collection_id": null,
    "source": "product_detail"
  },
  "product": {
    "name": "Validated product name",
    "descriptor": "Approved short descriptor",
    "price_display": "£00.00",
    "image_url": "approved asset URL",
    "destination_url": "signed or tracked destination URL",
    "in_stock": true
  },
  "content": {
    "subject": "Approved subject line",
    "preview_text": "Approved preview text",
    "headline": "Approved headline",
    "body": "Approved body copy",
    "cta_label": "View the product"
  },
  "tracking": {
    "campaign": "browse_abandonment",
    "step": "01",
    "intent_type": "single_product"
  },
  "schema_version": 1
}
```

Never send null or unvalidated commercial facts merely because the template can render them. Optional modules should disappear cleanly when data is unavailable.

## Resend send request

The application should send through the approved Resend SDK or API using:

- verified `from` identity;
- approved reply-to address;
- one recipient;
- rendered HTML;
- complete plain-text alternative;
- stable tags or metadata for sequence and step;
- deterministic idempotency key;
- no raw secrets in logs.

Recommended idempotency key:

`browse:{contact_id}:{sequence_instance_id}:{step}`

Store the provider message ID returned by Resend against the internal message record.

## Suggested Resend tags

Use a controlled, low-cardinality set such as:

- `channel=email`
- `program=browse_abandonment`
- `step=01`
- `message_type=marketing`
- `intent_type=single_product`

Do not place email addresses, names, product titles or other high-cardinality personal data in provider tags.

## Internal message record

Persist at least:

- internal message ID;
- contact ID;
- sequence instance ID;
- step;
- template version;
- rendering schema version;
- idempotency key;
- scheduled time;
- send-attempt time;
- Resend message ID;
- delivery status;
- target product or collection IDs;
- consent snapshot reference;
- subject-line variant;
- exit or cancellation reason.

## Webhook events

Process relevant Resend webhook events for:

- delivered;
- bounced;
- complained;
- opened, where available and permitted;
- clicked, where available and permitted;
- delayed or failed states supported by the provider.

Webhook processing must:

- verify authenticity according to current Resend documentation;
- store the provider event ID;
- deduplicate repeated deliveries;
- preserve the raw event securely for audit where appropriate;
- update the internal message state idempotently;
- trigger suppression on hard bounce or complaint;
- never enrol a contact into a new marketing flow solely from an open pixel.

## Click handling

Tracked destination links should preserve enough context to attribute:

- program;
- sequence instance;
- step;
- content or CTA identifier;
- target product or collection;
- approved experiment variant.

Do not expose internal IDs that create a security or privacy risk. Use signed or opaque tokens where needed.

## Open tracking caution

Open data may be incomplete or inflated by privacy protections and automated prefetching. Treat opens as directional diagnostics, not a reliable expression of customer intent.

Clicks, authenticated site behaviour, cart creation and purchase are stronger signals.

## Handoffs from site events

The application must listen for:

- `cart_item_added`
- `checkout_started`
- `order_completed`
- `shade_match_completed`
- `marketing_consent_withdrawn`

These events should cancel scheduled lower-priority sends before the next dispatch job runs.

## Failure handling

### Provider rejection

- record the response code and safe error category;
- do not repeatedly retry permanent failures;
- retry temporary failures using bounded backoff;
- preserve the same idempotency key;
- alert when failure rate exceeds the operational threshold.

### Rendering failure

- do not send partial email;
- record missing or invalid fields;
- pause or suppress the step;
- route repeated failures to monitoring.

### Webhook delay

Site and order events remain the source of truth for lifecycle ownership. Do not wait for email webhooks to stop a browse send after a purchase.

## MCP readiness

When the Resend MCP is connected later, it may assist with provider inspection, message lookup, domain state and operational diagnostics.

The MCP must not become the source of truth for:

- customer consent;
- browse eligibility;
- lifecycle ownership;
- product data;
- sequence state;
- commercial content approval.

All write actions through the MCP should remain explicit, reviewable and environment-aware.