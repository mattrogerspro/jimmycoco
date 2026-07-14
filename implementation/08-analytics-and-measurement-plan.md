# Analytics and Measurement Plan

## Purpose

Define a measurement system that links website behaviour, lifecycle eligibility, email delivery and commercial outcomes without treating noisy engagement signals as perfect truth.

## Measurement principles

- Measure decisions, not vanity metrics.
- Separate observed facts from attributed outcomes.
- Preserve event and experiment versions.
- Minimise personal data.
- Do not allow analytics tooling to become the source of consent or order truth.
- Document attribution assumptions.
- Treat opens as unreliable and clicks as directional.

## Website measurement

Track meaningful events such as:

- page viewed;
- product viewed;
- collection viewed;
- shade match started and completed;
- variant selected;
- add to cart;
- remove from cart;
- checkout started;
- purchase completed;
- content or routine engagement where it informs a decision;
- form or preference submission;
- error and failed conversion state.

Avoid indiscriminate event collection without a defined business use.

## Email measurement

Track by internal message ID:

- eligible;
- excluded with reason;
- queued;
- submitted;
- provider accepted;
- delivered;
- temporarily bounced;
- permanently bounced;
- complained;
- unsubscribed;
- clicked;
- converted under the declared attribution model;
- sequence exited;
- suppression applied.

## Required dimensions

Where lawful and useful:

- market;
- message category;
- lifecycle sequence and step;
- template release;
- copy variant;
- asset version;
- product and variant;
- acquisition source;
- experiment assignment;
- device class;
- new versus returning customer;
- attribution window.

Do not create uncontrolled high-cardinality dimensions from free text.

## Funnel model

Recommended commerce funnel:

1. Qualified session
2. Product discovery
3. Product consideration
4. Shade or variant confidence
5. Add to cart
6. Checkout start
7. Purchase
8. Fulfilment
9. Repeat purchase
10. Loyalty or VIP progression

Define each stage in code and documentation.

## Lifecycle reporting

For each sequence report:

- eligible population;
- entry rate;
- exclusions and reasons;
- send and delivery rates;
- bounce and complaint rates;
- click rate;
- conversion rate;
- incremental outcome where tested;
- exits and cancellation reasons;
- time to conversion;
- frequency overlap;
- downstream repeat purchase or retention.

## Attribution

Attribution must specify:

- eligible channels;
- click-through and view-through treatment;
- attribution windows;
- first, last or multi-touch method;
- direct and organic overwrite rules;
- refund and cancellation adjustments;
- currency handling;
- identity resolution assumptions.

Attributed revenue is a model, not an accounting fact.

## Experimentation

Every experiment requires:

- hypothesis;
- primary metric;
- guardrail metrics;
- unit of randomisation;
- audience eligibility;
- sample-size or duration plan;
- single controlled change where possible;
- versioned assignment;
- stopping rule;
- decision record.

Guardrails should include complaints, unsubscribes, bounce, page performance, accessibility and downstream conversion quality.

## Data pipeline

Recommended flow:

1. Application emits canonical business event.
2. Event is validated and stored.
3. Analytics destination receives an approved projection.
4. Message and provider events are reconciled by internal IDs.
5. Orders, refunds and cancellations update outcome facts.
6. Reporting models derive funnels and attribution.
7. Quality checks compare source totals to reports.

## Privacy and retention

- Collect only necessary fields.
- Avoid sensitive-trait inference.
- Respect consent and deletion requirements.
- Define retention by event class.
- Restrict access to raw customer-level data.
- Prefer aggregated reporting where practical.
- Document third-party destinations and processors.

## Data quality checks

Monitor:

- duplicate event IDs;
- schema failures;
- missing customer, product or order joins;
- unexpected event-volume changes;
- impossible funnel transitions;
- provider-to-internal reconciliation gaps;
- currency or revenue anomalies;
- experiment imbalance;
- timestamp and timezone errors;
- deleted or suppressed identity leakage.

## Dashboard hierarchy

### Executive

- revenue and conversion;
- new and repeat customers;
- lifecycle contribution;
- deliverability health;
- retention;
- major test outcomes.

### Product and UX

- funnel progression;
- page and component performance;
- shade-match usage;
- cart and checkout failure;
- responsive and performance indicators.

### Lifecycle

- sequence entry, delivery, conversion and exit;
- frequency and overlap;
- complaints and unsubscribes;
- incremental test results.

### Operations

- queue and webhook health;
- event lag;
- schema failures;
- data reconciliation;
- domain and sender reputation.

## Acceptance criteria

Measurement is ready when:

- canonical events are documented and versioned;
- website, order, lifecycle and provider events reconcile;
- consent and deletion requirements are enforced;
- dashboard definitions match source calculations;
- experiments preserve assignment and outcomes;
- attribution assumptions are explicit;
- alerts detect material data-quality failures;
- stakeholders can distinguish observed, derived and attributed metrics.