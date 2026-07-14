# Data Model and Event Map

## Purpose

Define the minimum canonical data and event foundations required to implement the Sunless website, lifecycle email system, Resend integration and measurement layer.

## Core rule

Business state belongs to the application database. Provider systems may transport messages or emit delivery events, but they must not become the source of truth for customer identity, consent, products, orders, lifecycle ownership or suppression.

## Canonical entities

### Customer

Minimum fields:

- stable customer ID;
- email and normalised email;
- first and last name where provided;
- market and locale;
- account state;
- created and updated timestamps;
- source and acquisition metadata;
- last meaningful activity;
- deletion or anonymisation state.

### Consent and preferences

Store purpose-specific state rather than one ambiguous marketing flag.

Minimum fields:

- customer ID;
- channel;
- purpose or preference category;
- status;
- legal basis or capture context;
- source;
- timestamp;
- policy version;
- proof or source reference;
- withdrawal timestamp where applicable.

### Suppression

Minimum fields:

- customer or email identity;
- scope;
- reason;
- source;
- created timestamp;
- expiry where temporary;
- provider event reference;
- manual override metadata where permitted.

### Product and variant

Minimum fields:

- product and variant IDs;
- canonical name;
- slug;
- product type;
- shade and undertone metadata where relevant;
- price and currency;
- availability;
- current packaging version;
- approved claim references;
- asset IDs;
- market availability;
- updated timestamp.

### Cart and cart item

Minimum fields:

- cart ID;
- customer or anonymous identity;
- market and currency;
- status;
- created, updated and abandoned timestamps;
- item product and variant IDs;
- quantity;
- captured price;
- current validation state;
- recovery eligibility.

### Order and fulfilment

Minimum fields:

- order ID and public reference;
- customer ID;
- order state;
- payment state;
- fulfilment state;
- market and currency;
- totals;
- line items;
- delivery method;
- created and updated timestamps;
- dispatch and delivery events;
- cancellation and refund state.

### Shade-match result

Minimum fields:

- result ID;
- customer or session identity;
- result version;
- answer payload reference;
- recommended product and variant IDs;
- confidence or rule outcome where legitimately defined;
- created timestamp;
- superseded state.

The model must not infer sensitive traits or store unsupported personal conclusions.

### Lifecycle state

Minimum fields:

- customer ID;
- sequence ID;
- current step;
- state;
- entered timestamp;
- next eligible timestamp;
- exit reason;
- owning trigger;
- precedence lock where required;
- test assignment;
- version.

### Message and provider event

Minimum message fields:

- internal message ID;
- customer ID;
- sequence and step IDs;
- message category;
- template release;
- copy and asset versions;
- idempotency key;
- requested, queued and sent timestamps;
- provider message ID;
- current derived delivery state;
- failure reason;
- attribution metadata.

Provider events remain append-only with:

- provider event ID;
- provider message ID;
- event type;
- occurred and received timestamps;
- verified payload reference;
- processing state;
- retry count;
- error details.

## Canonical business events

Recommended event namespace:

`domain.action.v1`

Examples:

- `customer.created.v1`
- `consent.granted.v1`
- `consent.withdrawn.v1`
- `product.viewed.v1`
- `shade_match.completed.v1`
- `cart.updated.v1`
- `cart.abandoned.v1`
- `checkout.started.v1`
- `order.placed.v1`
- `order.fulfilled.v1`
- `order.cancelled.v1`
- `refund.completed.v1`
- `lifecycle.entered.v1`
- `lifecycle.exited.v1`
- `email.queued.v1`
- `email.submitted.v1`
- `email.delivered.v1`
- `email.bounced.v1`
- `email.complained.v1`
- `email.clicked.v1`

## Event envelope

```json
{
  "event_id": "evt_...",
  "event_name": "order.placed.v1",
  "occurred_at": "2026-07-14T10:00:00Z",
  "producer": "commerce",
  "subject_type": "order",
  "subject_id": "ord_...",
  "customer_id": "cus_...",
  "market": "GB",
  "schema_version": 1,
  "payload": {},
  "correlation_id": "...",
  "causation_id": "..."
}
```

## Event rules

- Event IDs must be globally unique.
- Producers must write events only after the relevant state transition succeeds.
- Consumers must be idempotent.
- Events may be delayed, duplicated or processed out of order.
- Schemas must be versioned.
- Historical payloads must not be silently reinterpreted under new rules.
- Sensitive data must be minimised.

## Trigger map

### Welcome

Source event: customer or subscriber creation with valid marketing consent.

Exit events include consent withdrawal, suppression, account deletion or higher-priority conflict.

### Shade match

Source event: completed and valid shade-match result.

Required joins: customer identity, current recommendation, product availability, market and asset mapping.

### Browse abandonment

Source event: meaningful product view activity followed by inactivity.

Required controls: identity confidence, product availability, frequency, cart or purchase precedence.

### Cart abandonment

Source event: eligible cart inactivity.

Required controls: current cart state, checkout or order cancellation, price and availability revalidation.

### Post-purchase

Source event: valid order placement or fulfilment milestone depending on step.

Required controls: cancellation, refund, fulfilment and product-specific content.

### Replenishment

Source event: fulfilled product purchase plus approved replenishment interval.

Required controls: repeat purchase, return, cancellation, product availability and sequence precedence.

### Win-back

Source event: customer inactivity crossing an approved threshold.

Required controls: recent engagement, consent, suppression, order state and active lifecycle conflicts.

### VIP and loyalty

Source event: deterministic programme qualification or milestone.

Required controls: current tier, benefit validity, returns and manual adjustments.

## Data quality gates

Block or defer a message when:

- identity is ambiguous;
- consent cannot be proven;
- suppression state is unresolved;
- product or variant no longer exists;
- price, currency or offer terms are stale;
- required assets are unapproved;
- lifecycle state conflicts;
- event schema validation fails.

## Migration approach

1. Inventory current tables and fields.
2. Map each to canonical entities.
3. identify duplicates and conflicting meanings.
4. Define additive migrations.
5. Backfill with provenance.
6. Run validation reports.
7. Switch reads behind controlled flags.
8. Switch writes.
9. Reconcile historical and new state.
10. Remove deprecated fields only after a defined observation period.

## Completion criteria

This foundation is ready when entity schemas, event envelopes, ownership, migrations, retention, privacy rules, indexes, constraints and consumer contracts are documented, tested and reproducible across local, staging and production environments.