# Win-Back — Lapse Model and Segmentation

## Purpose

Define when inactivity is meaningful enough to justify a win-back message and prevent the system from treating normal purchase gaps as disengagement.

## Core principle

Lapse must be assessed relative to expected customer behaviour. A customer purchasing a long-lasting professional product should not be measured against the same timeline as someone regularly replacing an at-home tanning product.

## Inputs

Use approved first-party data such as:

- product category and expected usage window;
- quantity purchased;
- first-order or repeat-customer status;
- median and recent customer-specific repurchase interval;
- household versus professional-use indicators where explicitly known;
- completed orders and fulfilment dates;
- replenishment history;
- recent meaningful site, shade-match and email activity;
- active service, refund or complaint state;
- consent and communication preferences.

Do not infer sensitive personal characteristics or use opaque third-party data.

## Lapse confidence

### Low confidence

Examples:

- one historical purchase;
- unknown usage rate;
- product has a broad consumption window;
- incomplete fulfilment data;
- recent non-purchase engagement still exists.

Treatment: delay entry, use only a soft reintroduction or exclude until stronger evidence exists.

### Medium confidence

Examples:

- a known product category with an established broad reorder range;
- one or two completed purchases;
- no recent service issue;
- no meaningful engagement inside the expected window.

Treatment: standard win-back sequence with conservative timing.

### High confidence

Examples:

- multiple completed purchases;
- stable customer-specific reorder pattern;
- current inactivity materially exceeds that pattern;
- no recent purchase, cart, support or preference change.

Treatment: more personalised product or routine context, while still describing timing as an estimate.

## Suggested state model

- `active`
- `approaching_lapse`
- `lapsed_low_confidence`
- `lapsed_medium_confidence`
- `lapsed_high_confidence`
- `win_back_active`
- `reactivated`
- `win_back_completed`
- `reduced_frequency`
- `marketing_paused`
- `suppressed`

## Segmentation dimensions

### Purchase maturity

- first-time buyer;
- repeat buyer;
- historically high-frequency buyer;
- historically high-value buyer;
- subscriber without purchase but with meaningful prior engagement.

### Product relationship

- one dominant replenishable product;
- multi-product routine;
- discontinued or replaced product;
- customer whose previous product may no longer suit their stated preference;
- professional-use customer requiring a separate commercial pathway.

### Likely barrier

Only classify a barrier when supported by behaviour or explicit feedback:

- choice uncertainty;
- product availability;
- price sensitivity;
- routine complexity;
- change in desired result;
- poor prior experience;
- service issue;
- unknown.

Never present a guessed barrier as fact.

## Threshold governance

Initial thresholds are hypotheses, not permanent truths. They should be calibrated using:

- actual reorder distributions;
- holdout-group reactivation;
- unsubscribe and complaint rates;
- margin after incentives;
- product category;
- seasonality;
- jurisdiction and contact-pressure policy.

Review thresholds at least quarterly and after meaningful catalogue, pricing or customer-behaviour changes.

## Exclusions from lapse scoring

Do not treat these customers as ordinary lapsed contacts:

- active subscribers or autoship customers;
- open support, return, refund, replacement or safety cases;
- cancelled or failed orders without a later successful order;
- customers who explicitly paused marketing;
- contacts with invalid consent provenance;
- wholesale or professional accounts governed by a separate programme;
- customers whose relevant product is unavailable and has no approved successor.