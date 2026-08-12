# Post-Purchase Education — Measurement, Testing and QA

## Measurement objective

Evaluate whether the sequence improves successful product use and customer confidence, not simply whether it creates short-term revenue.

## Primary outcome groups

### Customer success

- application-guide engagement;
- preparation-guide engagement;
- self-reported confidence;
- support resolution quality;
- verified review completion;
- repeat use or purchase at an appropriate interval.

### Service quality

- avoidable “how do I use this?” contacts;
- delivery-state mismatch incidents;
- application-related complaint rate;
- return and refund reasons;
- unresolved support cases exposed to automation;
- duplicate or mistimed messages.

### Deliverability and trust

- accepted, delivered, bounced and complained events;
- unsubscribe rate;
- reply quality;
- inbox placement monitoring where available;
- suppression latency after complaints or consent withdrawal.

### Commercial impact

- later replenishment conversion;
- complimentary-product purchase when genuinely relevant;
- repeat-order rate;
- customer lifetime value;
- margin-aware incremental revenue.

Commercial outcomes must be interpreted alongside satisfaction, support and unsubscribe signals.

## Attribution

Do not credit every later order to the last email clicked. Use:

- sequence-level holdouts where volume permits;
- defined attribution windows;
- order-level and product-level cohort analysis;
- first-order versus repeat-order comparisons;
- product-family reporting;
- incremental lift rather than gross attributed revenue.

## Experiment priorities

Test one meaningful variable at a time. Suitable tests include:

- delivery-event timing versus conservative estimated timing;
- compact versus detailed instruction modules;
- written guide versus written guide plus video;
- product-led versus routine-led presentation for multi-item orders;
- support-first versus review-first closing email;
- first-time versus returning-customer cadence.

Do not test unsafe instructions, hidden review gating, misleading delivery language, manipulative urgency or unapproved claims.

## Required event coverage

Confirm tracking for:

- sequence entry, pause, resume, completion and exit;
- each scheduled, suppressed, rendered, accepted and delivered message;
- guide views and video engagement;
- support starts and resolutions;
- refund, return and cancellation events;
- review submission;
- repeat purchase;
- consent and suppression changes.

Events must use stable sequence, order, product, message and experiment identifiers.

## Content QA

For every branch confirm:

- instructions match the exact product and variant;
- preparation, application, development and aftercare timing are approved;
- face, body, contour, gradual and professional paths do not leak into one another;
- no unsupported medical, safety or performance claim appears;
- prices, product recommendations and availability are current when shown;
- review wording and provenance are valid;
- support routes work;
- copy does not imply delivery unless delivery is confirmed;
- plain-text content remains complete and useful.

## Data QA

Test:

- single-item and multi-item orders;
- partial fulfilment;
- delayed, failed and delivered states;
- cancellation before dispatch;
- full and partial refunds;
- returns and exchanges;
- replacement orders;
- first and repeat purchases;
- consent withdrawal between scheduling and send;
- support case opened during each step;
- duplicate and out-of-order commerce events;
- missing product-instruction profile;
- anonymous or guest checkout;
- locale, currency and timezone fallbacks.

## Rendering QA

Verify in the supported client matrix, including:

- major Gmail clients;
- Apple Mail;
- Outlook desktop and web;
- common Android clients;
- light and dark mode;
- images blocked;
- narrow mobile widths;
- enlarged text;
- screen-reader reading order.

Check live text, alt text, CTA size, contrast, link clarity, table stacking and footer compliance.

## Resend QA

Before release confirm:

- sending domain authentication;
- correct sender and reply-to identities;
- test and production environments are separated;
- idempotency keys are stable;
- provider message IDs are persisted;
- webhook signatures are verified;
- duplicate webhook events are harmless;
- bounce and complaint suppression is immediate;
- bounded retry behaviour uses the same idempotency key;
- tags contain no direct personal data;
- inbound replies create the correct support handoff.

## Safety and service QA

Use dedicated scenarios for:

- adverse-reaction wording;
- damaged or incorrect products;
- missing parcels;
- open refund or return cases;
- complaint replies;
- customer requests to stop contact.

Any such state must suppress review and promotional content and route to the approved human-support process.

## Release gates

The flow is ready only when:

1. product instruction profiles are approved and versioned;
2. all sequence branches render correctly;
3. transactional and marketing classifications are documented;
4. consent and suppression checks run immediately before send;
5. fulfilment and support-state handoffs are proven;
6. idempotency and webhook replay tests pass;
7. plain-text and accessibility checks pass;
8. review collection is honest and ungated;
9. monitoring and alerts exist;
10. an owner and rollback procedure are documented.

## Post-release monitoring

Review daily during initial rollout:

- message volume by step;
- suppression and pause reasons;
- delivery failures and complaints;
- service-state leakage;
- missing instruction-profile errors;
- duplicate sends;
- reply and support themes.

Then move to a regular weekly and monthly review cadence. Pause the sequence if unsafe, mistimed or materially inaccurate guidance is detected.