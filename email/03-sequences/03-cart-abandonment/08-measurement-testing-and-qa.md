# Cart Abandonment — Measurement, Testing and QA

## Purpose

Measure whether the sequence creates incremental recovered orders and margin while protecting customer trust, deliverability and commercial accuracy.

## Primary outcomes

Track:

- recovered orders linked to eligible abandoned carts;
- incremental conversion versus a persistent holdout;
- recovered revenue and contribution margin;
- restored-cart sessions;
- checkout starts;
- time from sequence entry to purchase;
- average order value;
- discount cost and dependency.

Do not treat opens as a primary success metric. Provider privacy protections and client behaviour can make them unreliable.

## Guardrail metrics

Monitor:

- unsubscribe rate;
- complaint rate;
- hard and soft bounce rate;
- duplicate-send incidents;
- stale-cart or wrong-price incidents;
- unavailable-item incidents;
- invalid recovery links;
- support complaints about intrusive language;
- deliverability by domain and market;
- margin erosion from incentives.

## Attribution

Use commerce events as the source of truth. Report both:

- operational attribution, such as purchase after a sequence click or within an approved window;
- experimental incrementality using contact- or cart-level holdouts.

Avoid claiming all purchases inside an attribution window were caused by email.

## Experimentation priorities

Test one meaningful variable at a time where possible:

- first-send delay;
- three-message versus four-message cadence;
- cart-first versus reassurance-first hierarchy;
- product guidance versus delivery reassurance;
- proof type;
- CTA wording;
- incentive eligibility and timing;
- message suppression against general campaign pressure.

Do not test deceptive urgency, ambiguous consent or inaccurate stock wording.

## Holdout design

Maintain a stable no-send or reduced-send holdout large enough to estimate incremental lift. Assign at a consistent unit, preferably contact or cart, and prevent treatment switching during the same abandonment episode.

Analyse results by new versus returning customer, market, cart value, product family, item count, discount state and device where sample sizes permit.

## Content QA

For every message verify:

- subject and preview text are accurate;
- no surveillance, guilt or false urgency language appears;
- one clear primary CTA exists;
- product names and variants match the live cart;
- quantities, prices, currency, subtotal and discounts are current;
- delivery and returns wording matches the customer’s market;
- claims, reviews and proof are approved;
- product and people images are original approved assets;
- alt text and plain-text content are meaningful;
- unsubscribe and required sender details are present.

## Functional QA

Test:

- cart recovery for signed-in and recognised guest states;
- secure-token generation and expiry;
- item addition, removal, quantity and variant changes;
- price and promotion changes between enrolment and send;
- partial and complete stock loss;
- market and currency changes;
- cart-empty suppression;
- checkout handoff;
- purchase suppression before provider submission;
- consent withdrawal;
- hard bounce and complaint suppression;
- webhook duplication and out-of-order events;
- retry behaviour with stable idempotency keys;
- support-reply pause behaviour.

## Email-client QA

Test representative combinations of:

- Apple Mail;
- Gmail web and mobile;
- Outlook desktop and web;
- major iOS and Android clients;
- light and dark modes;
- images enabled and disabled;
- narrow mobile widths;
- long product and variant names;
- one-item and multi-item carts.

The email must remain understandable without images and must not depend on unsupported CSS for essential meaning.

## Accessibility QA

Confirm:

- logical reading order;
- semantic heading hierarchy where supported;
- sufficient colour contrast;
- readable text sizing;
- descriptive links and alt text;
- touch-friendly CTA dimensions;
- no essential text embedded only in images;
- plain-text parity for core cart and recovery information.

## Release gates

Do not launch until:

- consent and suppression logic is approved;
- cart and order event reconciliation is tested;
- live commercial validation passes;
- recovery links are secure and reliable;
- Resend domain and webhook configuration is verified;
- idempotency and duplicate prevention are proven;
- all four messages pass content, client and accessibility QA;
- monitoring, alerting and rollback procedures exist;
- a holdout and reporting plan is active.

## Ongoing review

Review performance and guardrails regularly. Pause the flow immediately for wrong-recipient, wrong-cart, stale-price, broken-link, duplicate-send, consent or deliverability incidents.