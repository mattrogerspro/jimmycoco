# Testing and QA Plan

## Purpose

Define the testing system required to verify the Sunless website, email, data, asset and Resend implementation before launch and after every material release.

## Testing layers

### Static and structural checks

Run automatically for:

- type safety;
- linting;
- formatting;
- dependency and build errors;
- schema validation;
- migration safety;
- broken internal references;
- missing asset manifests;
- invalid template or message IDs;
- prohibited secret exposure.

### Unit tests

Cover:

- business rules;
- lifecycle eligibility;
- consent and suppression precedence;
- event validation;
- price and market formatting;
- product and shade fallbacks;
- idempotency keys;
- provider error classification;
- analytics transformations.

### Component tests

For website and email components verify:

- supported variants;
- semantic output;
- keyboard and focus behaviour;
- dynamic data states;
- missing optional data;
- long content;
- responsive behaviour;
- safe fallbacks.

### Integration tests

Cover:

- customer and consent updates;
- product and cart flows;
- checkout and order events;
- lifecycle entry and cancellation;
- message rendering and queueing;
- Resend adapter submission;
- webhook verification and event processing;
- suppression consequences;
- analytics event delivery.

### End-to-end tests

Priority journeys:

1. Homepage to product to cart.
2. Product variant selection to checkout.
3. Shade-match completion to recommendation and purchase.
4. Subscriber creation to welcome email.
5. Cart abandonment followed by purchase cancellation.
6. Order placement to confirmation and fulfilment email.
7. Consent withdrawal before a scheduled marketing send.
8. Hard bounce or complaint to suppression.
9. Asset expiry or product retirement preventing incorrect content.
10. Emergency send pause.

## Visual QA

Compare implementation against approved references at defined viewport widths.

Check:

- hierarchy;
- typography;
- spacing;
- grid alignment;
- crop and focal point;
- product and person fidelity;
- component states;
- interaction and motion;
- desktop and mobile composition;
- absence of accidental template drift.

Use visual regression as a warning system, not automatic creative approval.

## Website compatibility

Test current priority combinations of:

- Safari on iOS and macOS;
- Chrome on desktop and Android;
- Firefox desktop;
- Edge desktop;
- common mobile viewport widths;
- touch and keyboard input;
- reduced-motion preference;
- high zoom and text enlargement.

## Email rendering

Test at minimum:

- Apple Mail;
- Gmail web and mobile;
- Outlook desktop and web;
- images blocked;
- dark mode;
- mobile stacking;
- long names and product titles;
- plain text;
- link and unsubscribe behaviour.

## Accessibility QA

Verify:

- semantic structure;
- keyboard operation;
- visible focus;
- reading order;
- headings;
- labels and instructions;
- error identification;
- contrast;
- alt text;
- zoom and reflow;
- motion reduction;
- screen-reader interpretation of priority journeys.

No essential information may exist only in imagery, colour, hover or animation.

## Performance QA

Website checks:

- page and route weight;
- image sizing and formats;
- font loading;
- layout stability;
- interaction responsiveness;
- third-party script cost;
- cache behaviour;
- slow-network and low-powered-device experience.

Email checks:

- total HTML size;
- image weight;
- clipping risk;
- loading order;
- fallback readability;
- hosted asset availability.

## Data and event QA

Validate:

- event uniqueness;
- schema versions;
- timestamps and timezones;
- customer, product and order joins;
- lifecycle state transitions;
- duplicate and out-of-order handling;
- reconciliation between internal and provider records;
- deletion and suppression propagation;
- attribution and refund adjustments.

## Security and privacy QA

Test:

- client-side secret absence;
- row-level and API authorisation;
- webhook signature rejection;
- inbound attachment controls;
- least-privileged credentials;
- log redaction;
- production recipient restrictions;
- consent evidence;
- deletion and retention workflows;
- administrative and MCP boundaries.

## Release evidence

Every release should retain:

- commit or release identifier;
- migrations;
- automated test results;
- visual review links;
- email rendering evidence;
- accessibility review;
- performance report;
- known exceptions;
- approver;
- rollback target.

## Defect severity

### Blocker

Data loss, security exposure, incorrect recipient, consent violation, broken purchase, false product or person representation, duplicate send or unavailable rollback.

### Critical

Major journey failure, inaccessible primary action, incorrect price or variant, transactional email failure, severe rendering defect or material deliverability risk.

### Major

Meaningful responsive, visual, content, analytics or lifecycle defect with a workaround.

### Minor

Polish or low-impact inconsistency.

## Exit criteria

A release may proceed only when:

- no blockers or critical defects remain;
- automated checks pass;
- primary journeys pass in staging;
- visual and accessibility reviews are approved;
- production configuration is validated;
- migrations and rollback are rehearsed;
- monitoring and alerts are active;
- known exceptions are documented and accepted by a named owner.