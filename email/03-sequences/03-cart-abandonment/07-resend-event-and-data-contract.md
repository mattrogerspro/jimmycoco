# Cart Abandonment — Resend Event and Data Contract

## Purpose

Define the application-owned data and Resend delivery contract for safe, observable cart-recovery sending.

Resend is the delivery provider. The application remains responsible for consent, eligibility, cart truth, sequencing, commercial validation, suppression and state transitions.

## Core application events

Recommended event names:

- `cart.created`
- `cart.updated`
- `cart.inactive`
- `cart.recovered`
- `checkout.started`
- `checkout.abandoned`
- `order.completed`
- `contact.marketing_unsubscribed`
- `email.suppressed`

Each event should include a unique event ID, event timestamp, contact ID, cart ID, cart revision and source.

## Enrolment record

Store:

- sequence enrolment ID;
- contact ID;
- cart ID;
- current cart revision;
- sequence state;
- current message index;
- entered, updated and next-eligible timestamps;
- consent snapshot and source;
- market, locale and currency;
- suppression, pause or exit reason;
- last idempotency key;
- last Resend message ID.

## Render payload

Immediately before send, construct a validated payload containing:

```json
{
  "sequence": "cart_abandonment",
  "message": "email_01",
  "contact_id": "contact_123",
  "cart_id": "cart_456",
  "cart_revision": 7,
  "locale": "en-GB",
  "currency": "GBP",
  "recovery_url": "signed-and-time-limited-url",
  "items": [
    {
      "product_id": "product_1",
      "variant_id": "variant_1",
      "name": "Validated product name",
      "variant_name": "Validated variant",
      "quantity": 1,
      "unit_price": "0.00",
      "image_url": "approved-asset-url",
      "product_url": "validated-product-url",
      "stock_state": "available"
    }
  ],
  "subtotal": "0.00",
  "discount": null,
  "delivery_copy_key": "validated-market-copy",
  "returns_copy_key": "validated-market-copy"
}
```

The values above are structural examples, not production facts.

## Resend send request

The provider request should include:

- approved `from` identity;
- validated recipient;
- reply-to address monitored by the support process;
- subject and HTML render;
- plain-text render;
- approved tags;
- deterministic idempotency key.

Recommended tags:

- `channel=email`
- `category=marketing`
- `flow=cart_abandonment`
- `message=email_01` through `email_04`
- `market=<market>`
- `template_version=<version>`

Do not put email addresses, names, cart contents or other personal data into tags.

## Idempotency

Recommended key structure:

`cart-abandonment:{enrolment_id}:{message_id}:{cart_revision}:{template_version}`

Persist the key before or atomically with provider submission. Retries must reuse the same key.

## Webhook handling

Verify Resend webhook signatures before processing. Store provider event ID and reject duplicates.

Relevant delivery events may include:

- accepted or sent;
- delivered;
- delayed;
- bounced;
- complained;
- opened where available and permitted;
- clicked where available and permitted.

Provider events update delivery status but do not replace application commerce events. `order.completed` remains the source of truth for purchase.

## Reply handling

Replies should route through the approved inbound-email process and retain enough message metadata to associate the response with the contact and cart without exposing secure recovery tokens unnecessarily.

A relevant customer reply may pause automated recovery until the support interaction is resolved.

## Failure handling

- **Transient provider failure:** retry with the same idempotency key under bounded backoff.
- **Hard bounce or complaint:** suppress immediately.
- **Template-render failure:** block send and alert; do not send a partial template.
- **Stale cart revision:** discard render and rebuild.
- **Expired recovery URL:** regenerate safely or suppress.
- **Unknown provider outcome:** reconcile before retrying to avoid duplicates.

## MCP readiness

When the Resend MCP is connected, it may assist with inspection, test sends, template operations and delivery diagnostics within its granted permissions. It must not bypass application consent, suppression, cart validation or approval rules.

Never store API keys or webhook secrets in this repository.