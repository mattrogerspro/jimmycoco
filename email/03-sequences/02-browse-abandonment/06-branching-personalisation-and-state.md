# Browse Abandonment — Branching, Personalisation and State

## Purpose

Define how the sequence selects one browse intent, personalises safely, responds to new behaviour and hands control to more appropriate lifecycle flows.

## State model

Maintain one active browse-recovery record per contact with at least:

- `sequence_id`
- `contact_id`
- `status`
- `entered_at`
- `last_evaluated_at`
- `next_send_at`
- `current_step`
- `intent_type`
- `intent_score`
- `product_id` or `collection_id`
- `variant_id` when reliable
- `source_session_id`
- `source_event_ids`
- `shade_match_result_id` when applicable
- `last_browse_at`
- `flow_owner`
- `exit_reason`

Recommended statuses:

- `eligible`
- `scheduled`
- `active`
- `paused`
- `transferred`
- `suppressed`
- `completed`
- `cancelled`

## Intent types

Use a controlled set such as:

- `single_product`
- `product_family`
- `collection`
- `filtered_collection`
- `results_gallery_product`
- `comparison`
- `uncertain_choice`

Do not create a free-text recommendation state that cannot be audited.

## Intent scoring

The application should calculate an explainable score from approved signals. Possible inputs include:

- repeat product views;
- engaged product interaction;
- product media or accordion use;
- shade or variant interaction;
- collection filtering;
- result-gallery to product click;
- recency;
- repeated visits across sessions.

Use negative or disqualifying signals for:

- immediate exits;
- invalid or bot traffic;
- service-navigation behaviour;
- product unavailability;
- stale events outside the lookback period.

Exact weights must be calibrated from real data. Do not present the score to customers as a personal preference or recommendation.

## Choosing the active intent

Select one strongest valid intent at sequence entry.

When multiple products score similarly:

- prefer the more recent engaged signal;
- prefer a product tied to explicit shade-match or result-gallery interaction;
- otherwise branch to a category or comparison route rather than pretending certainty.

Do not show a history of every viewed product.

## Personalisation levels

### Level 0 — Contextual only

Use when identity or product confidence is limited:

- category name;
- general result objective;
- shade-match or comparison CTA.

### Level 1 — Product-specific

Use when one product has a strong reliable signal:

- product name and approved image;
- current product details;
- relevant suitability guidance.

### Level 2 — Recommendation-aware

Use only when a valid shade-match result or explicit customer selection exists:

- selected variant;
- recommendation explanation;
- result-specific proof.

Never move a contact to a higher personalisation level from browse behaviour alone.

## Dynamic updates during the sequence

New behaviour should update the active record rather than create another enrolment.

### Stronger browse intent

When the contact meaningfully engages with a different product:

- rescore both intents;
- switch only when the new intent is materially stronger;
- regenerate future content from the new state;
- do not resend a completed sequence step merely because the target changed.

### Shade match completed

When a new valid shade-match result is more specific:

- transfer ownership to shade-match follow-up;
- cancel future browse sends;
- preserve the browse source for attribution.

### Add to cart

When any relevant product enters cart:

- transfer ownership to cart abandonment when eligible;
- cancel all scheduled browse sends;
- use the actual cart contents, not the prior browse target.

### Checkout started

Transfer to checkout recovery or transactional logic according to the application architecture.

### Purchase completed

Exit immediately and allow post-purchase messaging to take ownership.

## Product and stock changes

Before every send:

- refresh product title, status, price, currency, image and URL;
- validate the intended variant;
- check stock and merchandising eligibility.

If the exact item is unavailable:

1. use an explicitly mapped same-intent alternative;
2. otherwise degrade to the relevant collection or guidance route;
3. otherwise suppress the message.

Never silently substitute a materially different result.

## Review and proof matching

Proof content may be selected only from approved relationships:

- exact product;
- exact routine;
- approved product family;
- same documented result objective.

Do not infer that a model or reviewer matches the recipient’s appearance or identity.

## Flow ownership lock

Before scheduling and before sending, acquire or verify the contact’s lifecycle flow lock.

The lock should prevent concurrent ownership by browse, shade-match, cart, checkout or post-purchase flows. A failed lock should pause or cancel the lower-priority message.

## Idempotency

Use a deterministic key such as:

`browse:{contact_id}:{sequence_instance_id}:{step}`

A target-product change must not create a second send for the same step.

## Exit reasons

Record a structured reason, including:

- `purchased`
- `cart_created`
- `checkout_started`
- `shade_match_transfer`
- `consent_withdrawn`
- `suppressed_address`
- `product_unavailable`
- `frequency_limit`
- `sequence_complete`
- `manual_cancel`
- `data_validation_failed`

This data is required for operational auditing and meaningful performance analysis.