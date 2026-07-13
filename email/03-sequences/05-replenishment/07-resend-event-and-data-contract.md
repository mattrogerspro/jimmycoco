# Replenishment — Resend Event and Data Contract

## Purpose

Define the application-owned data, scheduling decisions and Resend delivery contract required to operate the replenishment sequence safely.

Resend is the transport and event source for email delivery. The application remains responsible for consent, timing, product truth, lifecycle ownership, rendering decisions and sequence state.

## Ownership boundary

### Application responsibilities

The application must:

- determine eligibility;
- calculate the estimated replenishment window;
- store model confidence and reasoning inputs;
- enforce consent, suppression, quiet hours and contact pressure;
- select the correct product and variant;
- validate stock, price, currency and URLs;
- render HTML and plain text;
- generate idempotency keys;
- decide whether to send, pause, cancel or transfer the flow;
- process and reconcile Resend webhook events.

### Resend responsibilities

Resend should:

- accept approved outbound messages;
- return a provider message ID;
- deliver messages;
- emit delivery, bounce, complaint and engagement events where available;
- receive replies through the configured inbound architecture when enabled.

Resend must not be treated as the source of truth for customer consent, product state or replenishment timing.

## Required internal events

Suggested application events:

- `order.line.fulfilled`
- `replenishment.estimated`
- `replenishment.eligible`
- `replenishment.enrolled`
- `replenishment.message.scheduled`
- `replenishment.message.cancelled`
- `replenishment.message.sent`
- `replenishment.reminder.delayed`
- `replenishment.reminder.paused`
- `replenishment.product.changed`
- `replenishment.reordered`
- `replenishment.completed`
- `replenishment.suppressed`

Every event should include an immutable event ID and event timestamp.

## Minimum enrolment payload

```json
{
  "sequence": "replenishment",
  "sequence_version": "1",
  "enrolment_id": "repl_enrolment_id",
  "contact_id": "contact_id",
  "order_id": "order_id",
  "order_line_id": "order_line_id",
  "product_id": "product_id",
  "variant_id": "variant_id",
  "quantity": 1,
  "fulfilled_at": "ISO-8601 timestamp",
  "estimated_window_start": "ISO-8601 timestamp",
  "estimated_window_end": "ISO-8601 timestamp",
  "confidence": "low|medium|high",
  "model_version": "replenishment-model-version",
  "consent_snapshot_id": "consent_snapshot_id"
}
```

Store model inputs and outputs internally so timing decisions can be audited. Do not expose unnecessary internal scoring in the email.

## Pre-send render payload

The renderer should receive validated, current data rather than a stale snapshot.

```json
{
  "message_key": "replenishment.email_01",
  "message_version": "1",
  "enrolment_id": "repl_enrolment_id",
  "contact": {
    "id": "contact_id",
    "email": "customer@example.com",
    "first_name": "Customer",
    "locale": "en-GB",
    "timezone": "Europe/London"
  },
  "product": {
    "id": "product_id",
    "variant_id": "variant_id",
    "name": "Validated product name",
    "variant_name": "Validated variant name",
    "price": "Validated display price",
    "currency": "GBP",
    "availability": "in_stock",
    "image_url": "approved asset URL",
    "product_url": "validated destination URL"
  },
  "replenishment": {
    "confidence": "medium",
    "estimated_window_start": "ISO-8601 timestamp",
    "estimated_window_end": "ISO-8601 timestamp",
    "reminder_preference_url": "signed preference URL"
  },
  "tracking": {
    "sequence": "replenishment",
    "step": 1,
    "enrolment_id": "repl_enrolment_id"
  }
}
```

Omit optional values when unavailable. The template must degrade safely without inventing a first name, price, variant or estimated usage claim.

## Pre-send gate

Immediately before calling Resend, verify:

- contact still has valid marketing consent;
- email is not globally or provider suppressed;
- sequence still owns the customer;
- no newer qualifying purchase has reset the replenishment clock;
- no cart, checkout, support or safety state has priority;
- product and variant are current;
- price and currency are current;
- stock state is acceptable;
- destination and preference URLs are valid;
- approved image asset exists;
- scheduled time complies with quiet hours and contact-pressure policy;
- the idempotency key has not been consumed.

Fail closed when an essential check cannot be completed.

## Resend send request

The exact SDK or API shape may change and must be confirmed against the installed Resend version when implemented.

Conceptually, each request should include:

- approved from address;
- customer destination address;
- optional reply-to address;
- approved subject;
- rendered HTML;
- useful plain-text alternative;
- tags for sequence, step, version and environment;
- application-generated idempotency key.

Suggested tags:

- `channel=email`
- `sequence=replenishment`
- `step=1|2|3`
- `template_version=<version>`
- `environment=production|staging`

Do not place sensitive customer or order data in provider tags.

## Idempotency

Suggested key format:

```text
replenishment:{enrolment_id}:{message_key}:{message_version}
```

Requirements:

- one logical message must map to one stable key;
- retries reuse the same key;
- a template correction that requires a genuinely new send must use a new approved version or explicit resend record;
- webhook retries must never create outbound duplicates.

## Provider message record

Store at least:

- internal message ID;
- enrolment ID;
- contact ID;
- sequence and step;
- template version;
- idempotency key;
- Resend message ID;
- requested timestamp;
- accepted timestamp;
- latest delivery state;
- rendered-data snapshot reference;
- suppression or failure reason;
- last webhook timestamp.

Do not rely on provider retention as the only operational record.

## Webhook processing

Webhook handling must:

- verify authenticity using the current official Resend method;
- store the provider event ID;
- deduplicate repeated deliveries;
- preserve the raw payload securely for debugging within retention policy;
- update the internal message state idempotently;
- tolerate out-of-order events;
- return success only after durable processing or durable queueing.

Relevant states may include accepted, delivered, delayed, bounced, complained, opened and clicked, depending on the enabled Resend event set.

Delivery, bounce and complaint events are operationally authoritative. Open events are not a reliable measure of human attention and must not be used alone to alter replenishment timing.

## Bounce and complaint handling

### Hard bounce

- suppress the address;
- cancel future replenishment messages;
- retain the operational reason;
- do not retry through another marketing route.

### Soft or transient failure

- follow the approved retry policy;
- do not extend retries beyond the useful replenishment window;
- preserve the same logical-message idempotency key.

### Complaint

- suppress marketing immediately;
- cancel active lifecycle sequences;
- record the complaint source and time;
- reconcile provider and internal suppression state.

## Click and purchase reconciliation

Use signed first-party links that preserve:

- enrolment ID;
- message ID;
- sequence step;
- destination product or variant;
- campaign attribution parameters where approved.

A later purchase must be matched using first-party order and customer data, not provider click data alone.

On confirmed purchase of the same or approved successor product:

- mark the active sequence converted;
- cancel scheduled sends;
- create a new replenishment clock only after the new order becomes eligible;
- avoid double attribution across cart, campaign and replenishment flows.

## Inbound replies

When inbound email is configured, replies should be routed to support or customer care rather than ignored.

The inbound handler should:

- validate the inbound event;
- associate the reply with the contact and outbound message where possible;
- detect service, product and safety concerns;
- pause promotional sends when human attention is required;
- avoid automated medical or safety conclusions.

## Environments

Staging and production must use separate:

- API keys;
- domains or approved sender identities;
- webhook endpoints;
- data stores or clear environment partitions;
- Resend tags;
- recipient allowlists in non-production.

Never allow staging to send to the full production audience.

## MCP integration readiness

When the Resend MCP is connected later, use it for inspection and supported operational actions, but preserve the same ownership boundary.

Before allowing write actions through MCP:

- confirm the connected Resend account and environment;
- verify sender domain and intended audience;
- require explicit approval for live sends;
- avoid exposing secrets or raw customer data in prompts;
- log consequential actions;
- prevent MCP actions from bypassing consent, suppression or application idempotency controls.