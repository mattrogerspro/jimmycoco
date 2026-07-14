# Email Build Plan

## Purpose

Turn the completed email strategy, design, template, sequence, copy, AI, asset and Resend documentation into a staged implementation programme.

## Preconditions

Before sequence implementation begins:

- message categories and consent rules are approved;
- the canonical customer and preference model exists;
- product and variant data contracts are stable;
- the email component system is mapped to code;
- asset manifests and hosted URLs are available;
- Resend environments and sender identities are separated;
- durable message and event records are designed.

## Build order

### Stage 1 — Email foundation

Implement:

- React email or equivalent server-rendered template framework;
- shared email tokens;
- layout shell;
- header and footer;
- typography and spacing primitives;
- button and text-link components;
- image and product modules;
- legal and preference modules;
- plain-text generation;
- preview and fixture system.

Acceptance:

- core modules render in priority clients;
- dark mode and blocked-image states are reviewed;
- no template depends on browser-only code;
- every component has constrained props and fallbacks.

### Stage 2 — Transactional baseline

Build and validate first:

- order confirmation;
- dispatch or fulfilment update;
- service and account messages;
- required operational notifications.

These establish sending, webhook, data and rendering reliability before marketing volume is introduced.

### Stage 3 — Welcome and shade-match

Implement:

- welcome sequence;
- shade-match result and follow-up;
- sequence entry and exit rules;
- preference and suppression checks;
- product and shade fallbacks;
- test fixtures for every branch.

### Stage 4 — Behavioural recovery

Implement:

- browse abandonment;
- cart abandonment;
- precedence and collision rules;
- cart/product availability checks;
- frequency caps;
- purchase exit conditions.

### Stage 5 — Post-purchase and replenishment

Implement:

- post-purchase guidance;
- review or feedback requests where approved;
- replenishment timing;
- repeat-purchase exits;
- product-specific routine content.

### Stage 6 — Retention and loyalty

Implement:

- win-back;
- VIP and loyalty messages;
- tier qualification data;
- milestone and transition messages;
- controlled promotional variants.

### Stage 7 — Campaign production

Only after lifecycle foundations are stable, implement campaign tooling for:

- approved campaign briefs;
- segment selection;
- immutable template release selection;
- test variants;
- approvals;
- scheduling and emergency pause.

## Sequence implementation contract

Every message requires:

- stable message ID;
- purpose and category;
- trigger;
- delay;
- entry criteria;
- exclusion and exit criteria;
- lifecycle precedence;
- frequency rule;
- required data;
- fallback behaviour;
- template release;
- subject and preview variants;
- asset IDs;
- analytics events;
- owner and approver.

## Rendering workflow

1. Load approved message specification.
2. Validate the event and recipient state.
3. Resolve approved product, offer and asset data.
4. Validate the message data schema.
5. Render HTML and plain text from an immutable release.
6. produce review fixtures for all meaningful states.
7. Run automated structural checks.
8. Complete human copy, visual and legal review.
9. Release to staging.
10. Promote the exact approved version to production.

## Required fixtures

Each template must include:

- standard state;
- missing optional data;
- longest realistic names and product titles;
- mobile-width preview;
- unavailable product where relevant;
- no-personalisation fallback;
- market or currency variation;
- expired offer rejection;
- images-blocked state;
- plain-text output.

## Lifecycle engine requirements

The application must own:

- current sequence state;
- next eligible step;
- trigger and cancellation events;
- precedence between sequences;
- frequency caps;
- consent and suppression;
- product and order validation;
- immutable send history.

Resend must not become the source of lifecycle state.

## Measurement requirements

Store and report by message and sequence:

- eligible population;
- attempted sends;
- accepted, delivered, bounced and complained;
- clicks as directional signals;
- conversions and attributed revenue under a documented model;
- exits and suppression reasons;
- test assignment;
- template and copy version.

## Release order

Recommended production rollout:

1. internal and allow-listed tests;
2. transactional messages;
3. welcome;
4. shade-match;
5. post-purchase;
6. cart abandonment;
7. browse abandonment;
8. replenishment;
9. win-back;
10. VIP and loyalty;
11. campaigns.

## Completion criteria

The email implementation is complete when every active message has a versioned specification, validated data contract, approved responsive render, plain-text version, production asset mapping, consent and suppression path, analytics contract, test coverage and rollback procedure.