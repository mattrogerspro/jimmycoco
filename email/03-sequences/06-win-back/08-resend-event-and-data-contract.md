# Win-Back — Resend Event and Data Contract

## Purpose

Define the application-owned data, Resend payload, idempotency, webhook and inbound-reply requirements for the win-back sequence.

Resend is the delivery and receipt layer. The application remains responsible for eligibility, lifecycle state, timing, content selection, consent, suppression, product validation and sequence ownership.

## Core sequence record

Each enrolment should persist:

- `sequence_instance_id`
- `sequence_key`: `win_back`
- `sequence_version`
- `contact_id`
- `customer_id`
- `email_address`
- `locale`
- `timezone`
- `currency`
- `lapse_segment`
- `lapse_confidence`
- `last_qualifying_purchase_at`
- `expected_purchase_interval_days`
- `last_meaningful_engagement_at`
- `prior_product_ids`
- `prior_variant_ids`
- `prior_order_count`
- `customer_value_segment`
- `service_risk_state`
- `consent_snapshot_id`
- `contact_pressure_score`
- `current_step`
- `status`
- `entry_at`
- `expires_at`
- `completion_reason`

Do not depend on provider message history as the only source of lifecycle truth.

## Application events

Recommended internal events:

- `win_back.eligible`
- `win_back.enrolled`
- `win_back.send_scheduled`
- `win_back.pre_send_validation_failed`
- `win_back.email_rendered`
- `win_back.send_requested`
- `win_back.send_accepted`
- `win_back.delivered`
- `win_back.clicked`
- `win_back.replied`
- `win_back.preference_updated`
- `win_back.transferred`
- `win_back.reactivated`
- `win_back.completed`
- `win_back.suppressed`

Events should be append-only where practical and include an occurred-at timestamp, source, sequence instance and correlation ID.

## Pre-send validation payload

Before every send, resolve fresh values for:

- current consent and suppression state;
- unresolved support, complaint, refund, return or safety state;
- current lifecycle owner;
- latest cart, checkout and purchase events;
- contact-pressure and quiet-hour eligibility;
- current product and variant availability;
- current product name, image, price, currency and destination URL;
- current offer eligibility and expiry when an incentive is used;
- preference state;
- sequence expiry and step eligibility.

A rendered message must not be sent when any required value is stale, missing or contradictory.

## Render data contract

Suggested envelope:

```json
{
  "sequence": {
    "key": "win_back",
    "version": "1",
    "instance_id": "wb_...",
    "step": 1,
    "segment": "repeat_customer_lapsed",
    "lapse_confidence": "medium"
  },
  "recipient": {
    "contact_id": "con_...",
    "email": "customer@example.com",
    "first_name": "Alex",
    "locale": "en-GB",
    "timezone": "Europe/London"
  },
  "context": {
    "last_purchase_at": "2026-01-10T12:00:00Z",
    "prior_order_count": 3,
    "preferred_product_family": "face_tan",
    "preference_url": "https://...",
    "unsubscribe_url": "https://..."
  },
  "primary_product": {
    "product_id": "prod_...",
    "variant_id": "var_...",
    "name": "...",
    "variant_name": "...",
    "price": "...",
    "currency": "GBP",
    "image_url": "https://...",
    "destination_url": "https://...",
    "availability": "in_stock"
  },
  "offer": null,
  "tracking": {
    "correlation_id": "corr_...",
    "campaign_key": "win_back_email_01",
    "experiment_id": null,
    "holdout_group": false
  }
}
```

Only include fields supported by current source data. Do not manufacture a product preference, prior routine or first name.

## Resend send request

Each send should include:

- approved `from` identity;
- monitored `reply_to` address;
- recipient address;
- subject;
- HTML body;
- useful plain-text body;
- Resend tags for sequence, step, version, locale and experiment;
- application correlation ID in stored metadata;
- one application-generated idempotency key.

Suggested tags:

- `channel=email`
- `lifecycle=win_back`
- `sequence_version=v1`
- `step=email_01`
- `segment=repeat_lapsed`
- `locale=en_GB`

Do not place personal or sensitive data in provider tags.

## Idempotency

Generate the key from stable send intent, for example:

`win_back:{sequence_instance_id}:{step}:{content_version}`

The application must reject a second successful send request using the same key. Retries caused by timeouts must reuse the original key.

Persist:

- idempotency key;
- request timestamp;
- provider response ID;
- accepted or failed state;
- retry count;
- final outcome.

## Webhook handling

Verify webhook authenticity according to the active Resend integration standard before processing.

Relevant provider events may include:

- sent;
- delivered;
- delayed;
- bounced;
- complained;
- opened;
- clicked.

Webhook processing must be idempotent. Store the provider event ID and ignore duplicates after a successful application update.

Hard bounce or complaint should immediately update global suppression. Delivery and click events may update reporting, but opens must not control lifecycle ownership because open tracking is unreliable.

## Click handling

Use signed or otherwise tamper-resistant redirect parameters where customer or sequence state is embedded.

Record:

- sequence instance;
- message step;
- destination type;
- product or preference context;
- experiment assignment;
- click timestamp.

A click alone does not equal reactivation. Purchase, qualified account action or another defined value event should determine reactivation.

## Inbound replies

Replies received through Resend should be normalised into an internal inbound-message record and routed by intent.

Minimum fields:

- inbound message ID;
- provider message ID;
- related outbound message ID when available;
- sender address;
- recipient address;
- subject;
- plain-text or safely parsed content;
- attachments metadata;
- received timestamp;
- routing status.

Routing examples:

- product or shade question → product guidance or support;
- order issue → customer service;
- complaint or dissatisfaction → complaint queue and marketing pause;
- unsubscribe request → immediate suppression;
- preference request → apply or request confirmation through the approved workflow.

Do not allow an automated reply parser to override explicit unsubscribe language.

## Offer data

When Email 03 uses an approved incentive, include:

- offer policy ID;
- offer code or secure claim reference;
- eligible products or exclusions;
- start and expiry timestamps;
- currency or market restrictions;
- margin guardrail result;
- customer eligibility result.

Validate the offer immediately before send and again when the customer lands or checks out.

## Failure handling

Retry only transient provider or network failures. Do not retry:

- invalid recipient;
- withdrawn consent;
- global suppression;
- expired sequence;
- failed product validation;
- invalid or expired offer;
- duplicate idempotency key after confirmed acceptance;
- active complaint or service-risk suppression.

Route persistent technical failure to operational monitoring with correlation IDs and no exposed personal data.

## Data retention and privacy

Store only what is necessary for lifecycle execution, support, compliance and measurement. Apply the project retention policy to provider payloads, inbound content, events and rendered snapshots.

Access to inbound replies and customer-history context must be role-controlled and auditable.

## MCP integration boundary

When the Resend MCP is connected later, it may assist with provider operations, inspection and controlled sending. It must not become the authority for:

- consent;
- lifecycle eligibility;
- suppression;
- customer segmentation;
- product truth;
- offer eligibility;
- sequence state.

Those remain application-owned and must be supplied explicitly to any MCP-driven operation.