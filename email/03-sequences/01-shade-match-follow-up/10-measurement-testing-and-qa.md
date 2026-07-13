# Measurement, Testing and QA

## Purpose

This document defines how the shade-match follow-up sequence is measured, tested and approved before release.

## Primary success measure

The principal outcome is a qualified purchase attributable to the shade-match journey without increasing complaints, unsubscribes, duplicate messaging or customer confusion.

## Core funnel metrics

Track by sequence entry cohort:

- eligible shade matches
- sequence enrolments
- successful sends
- deliveries
- unique clicks
- product-page visits
- cart additions
- checkout starts
- purchases
- revenue
- time to purchase
- sequence exits by reason

## Quality and risk metrics

Monitor:

- hard-bounce rate
- complaint rate
- unsubscribe rate
- invalid or unavailable recommendation rate
- duplicate-send incidents
- stale-price incidents
- broken-link incidents
- cross-flow collision incidents
- support replies caused by confusion
- rendering failures by major email client

## Attribution

Use a consistent first-party attribution model with:

- sequence ID
- step ID
- message ID
- template version
- shade-match ID
- recommended product and variant IDs
- destination URL
- click timestamp
- order timestamp

Do not use opens as the primary optimisation signal. Privacy features and image prefetching can make open data unreliable.

## Recommended reporting views

### Sequence overview

Show enrolment, delivery, click-through, cart, purchase, revenue and exit reasons.

### Step performance

Compare each email's incremental effect rather than crediting every prior message for the same order.

### Recommendation segment

Break down performance by:

- recommended product family
- desired depth
- format preference
- development-time preference
- certainty versus `not_sure`
- new versus returning customer

Only report segments large enough to avoid misleading conclusions or exposing individuals.

### Operational health

Show webhook latency, delayed sends, retries, duplicate prevention, bounce suppression and catalogue-validation failures.

## Test hierarchy

Prioritise tests in this order:

1. Recommendation explanation
2. CTA wording and destination
3. Message timing
4. Proof selection
5. Application guidance
6. Subject line and preview text
7. Supporting visual treatment

Do not test multiple major variables simultaneously unless using a properly designed multivariate experiment with adequate traffic.

## Experimental rules

Every test must define:

- hypothesis
- primary metric
- guardrail metrics
- eligible audience
- sample-size expectation
- test duration
- winning threshold
- stopping rule
- implementation owner
- decision record

Do not declare a winner from a small early fluctuation.

## Content QA

For each message verify:

- subject and preview text work together;
- the recommendation matches the current shade-match record;
- product name, variant, price and availability are current;
- CTA destination is correct;
- claims are approved and supportable;
- review language is authentic and permissioned;
- customer, celebrity and product imagery uses approved source assets;
- no generative process has altered protected source photography;
- fallback copy works when optional personalisation is missing;
- plain-text content is complete and useful.

## Visual QA

Test at minimum in representative versions of:

- Gmail web and mobile
- Apple Mail desktop and mobile
- Outlook desktop and web
- Yahoo Mail
- dark mode where supported

Verify:

- 600–640px desktop canvas behaviour;
- mobile stacking;
- readable font sizes;
- image scaling and alt text;
- buttons remain tappable;
- backgrounds remain legible when images are blocked;
- no clipped text or horizontal overflow;
- correct fallback fonts;
- footer, preference and unsubscribe links remain accessible.

## Accessibility QA

Confirm:

- semantic reading order;
- descriptive links;
- sufficient colour contrast;
- meaningful alt text;
- no critical message exists only inside an image;
- button text explains the destination;
- body text remains readable without zoom;
- animation is not required to understand content.

## Functional QA

Test every branch:

- default recommendation
- missing optional answers
- `not_sure` undertone
- unavailable recommended variant
- repeat shade match
- product viewed
- cart started
- purchase completed
- consent withdrawn
- hard bounce
- customer reply
- sequence expiry

## Resend QA

Before production release:

1. send to an internal allowlist;
2. confirm sender authentication;
3. validate HTML and plain text;
4. confirm tags and internal message IDs;
5. confirm webhook signature verification;
6. test webhook replay and deduplication;
7. test hard-bounce suppression;
8. test complaint handling in a safe non-production manner where possible;
9. verify idempotent retries;
10. reconcile internal and Resend delivery records.

## Release gates

The sequence cannot launch until:

- all templates are approved;
- all dynamic fields have safe fallbacks;
- catalogue validation is live;
- consent and suppression logic is tested;
- cart and purchase exits work;
- cross-flow priority is enforced;
- test messages pass client and accessibility review;
- monitoring and rollback procedures are documented.

## Post-launch review

Review after the first meaningful cohort and again after 30 days. Examine not only revenue but whether the sequence improved confidence and reduced uncertainty without causing contact pressure.

## Rollback triggers

Pause the flow immediately for:

- duplicate sends;
- incorrect product recommendations at scale;
- broken destination links;
- stale or incorrect prices;
- elevated complaint or bounce rates;
- consent or suppression failures;
- cross-flow collisions;
- unauthorised use or alteration of source imagery.

## Definition of success

The flow succeeds when customers receive a timely, accurate and understandable continuation of their shade match, more customers reach a confident purchase, and operational quality remains within approved deliverability, consent and brand standards.
