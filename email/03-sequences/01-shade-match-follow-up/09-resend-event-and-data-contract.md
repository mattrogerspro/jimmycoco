# Resend Event and Data Contract

## Purpose

This document defines the implementation contract for delivering the shade-match follow-up sequence through Resend while preserving consent, idempotency, observability and accurate personalisation.

## System ownership

The application owns:

- eligibility
- consent and suppression
- sequence state
- recommendation logic
- catalogue validation
- template selection
- send timing
- idempotency
- analytics attribution

Resend owns:

- message transport
- provider message IDs
- delivery events
- bounce and complaint events
- inbound email events where configured

Resend must not become the source of truth for customer lifecycle state.

## Entry event

Recommended internal event:

```json
{
  "event_name": "shade_match.completed",
  "event_version": 1,
  "occurred_at": "ISO-8601 timestamp",
  "contact_id": "internal contact id",
  "shade_match_id": "unique match id",
  "recommendation_version": "version id",
  "recommended_product_id": "catalogue product id",
  "recommended_variant_id": "catalogue variant id",
  "reason_codes": ["desired_depth", "format_preference"],
  "marketing_consent": true,
  "source": "website"
}
```

Do not send directly from an unvalidated browser event. The server must verify and persist the completed result first.

## Send request contract

Each scheduled message should create an internal send record containing:

- internal message ID
- contact ID
- shade-match ID
- sequence ID
- sequence step
- template version
- recommendation version
- scheduled timestamp
- idempotency key
- rendered subject
- destination URL set
- catalogue snapshot identifiers
- consent-check timestamp

## Idempotency key

Recommended format:

```text
shade-match-follow-up:{contact_id}:{shade_match_id}:{step}:{template_version}
```

The application must reject duplicate sends with the same key, including retries caused by timeouts or webhook replay.

## Resend request metadata

Where supported, attach metadata or tags for:

- `flow=shade_match_follow_up`
- `step=01` through `06`
- `shade_match_id`
- `template_version`
- `campaign_category=marketing`

Do not expose sensitive customer questionnaire answers in provider metadata.

## Required pre-send checks

Immediately before the Resend API call, verify:

1. contact exists;
2. marketing consent is active;
3. contact is not globally suppressed;
4. contact has not purchased the recommended item;
5. no higher-priority flow owns the contact;
6. the recommendation is still current;
7. product and selected variant remain available;
8. current price and URL are valid;
9. template data passes schema validation;
10. idempotency key has not been consumed.

## Suggested send payload shape

```json
{
  "from": "Sunless by Jimmy Coco <approved-sender-domain>",
  "to": ["recipient@example.com"],
  "subject": "rendered subject line",
  "html": "rendered HTML",
  "text": "rendered plain text",
  "reply_to": "approved support address",
  "tags": [
    {"name": "flow", "value": "shade_match_follow_up"},
    {"name": "step", "value": "01"}
  ]
}
```

Sender addresses, domains and API details must be supplied from environment configuration, never hard-coded into documentation or templates.

## Webhook events

Persist and process relevant Resend events such as:

- sent
- delivered
- delivery delayed
- bounced
- complained
- opened, when enabled and legally appropriate
- clicked, when enabled and legally appropriate

Treat webhook payloads as untrusted input. Verify signatures according to current Resend documentation after the MCP is connected.

## Webhook processing rules

- Verify authenticity before processing.
- Store the raw event securely for reconciliation.
- Deduplicate using provider event ID.
- Update the internal message record.
- Apply hard-bounce and complaint suppression immediately.
- Do not treat opens as strong intent because privacy protections can inflate them.
- Attribute clicks through first-party destination parameters and server-side events where possible.

## Purchase and cart events

The sequence engine must consume first-party events:

- `product.viewed`
- `cart.item_added`
- `checkout.started`
- `order.completed`
- `shade_match.completed`
- `marketing_consent.withdrawn`

`order.completed` must cancel all unsent messages in this flow before post-purchase enrolment.

## Inbound replies

Where replies are received through Resend:

- associate the inbound message with the contact and latest outbound thread where possible;
- pause automated marketing until the reply is triaged;
- route product, application and order questions to the correct support workflow;
- never auto-send a fabricated expert answer.

## Data retention

Store only the data required for delivery, support, audit and lawful measurement. Apply documented retention periods to raw webhook payloads, rendered message bodies and questionnaire-derived personalisation fields.

## MCP readiness checklist

Before connecting the Resend MCP:

- verify sending domains and sender identities;
- confirm webhook endpoints and signing secrets;
- define environment separation for development, staging and production;
- create test recipient allowlists;
- confirm suppression-table ownership;
- map MCP operations to existing internal send records;
- prevent MCP actions from bypassing consent or idempotency checks;
- test a non-production message end to end.

## Acceptance criteria

The integration is ready when every message can be traced from shade-match completion to application send record, Resend message ID, delivery events, customer action and final sequence exit without duplicate or unauthorised sends.
