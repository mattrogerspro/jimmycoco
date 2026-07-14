# Master Delivery Roadmap

## Purpose

Define the order in which the Sunless by Jimmy Coco website, email, data, assets, Resend integration, analytics and launch work should be implemented.

This roadmap is dependency-led. It avoids designing or coding later-stage experiences before their underlying data, assets, tokens and contracts are ready.

## Delivery principles

1. Audit before rebuilding.
2. Preserve approved brand and product truth.
3. Build shared foundations before channel-specific surfaces.
4. Separate content, data, rendering and delivery responsibilities.
5. Release in controlled increments rather than one large launch.
6. Treat accessibility, performance, consent and observability as core requirements.
7. Use explicit acceptance criteria for every phase.
8. Do not allow temporary implementation shortcuts to become hidden architecture.

## Phase 0 — Establish delivery control

### Objectives

- confirm implementation scope;
- name product, design, engineering, lifecycle and approval owners;
- establish environments and branch strategy;
- create a delivery backlog mapped to repository specifications;
- define release gates and escalation routes.

### Required outputs

- current architecture diagram;
- named owners;
- repository and environment inventory;
- delivery board;
- issue and pull-request conventions;
- risk register;
- decision log;
- dependency map.

### Exit criteria

- every workstream has an owner;
- production access is controlled;
- no unresolved ambiguity remains about the canonical repository or deployment target;
- high-risk dependencies are visible.

## Phase 1 — Current-state audit and gap analysis

### Objectives

Compare the live site, codebase, database, integrations, email tooling and available assets with the approved repository documentation.

### Audit areas

- React/Vite application structure;
- routing and page inventory;
- component and styling architecture;
- product catalogue and variant model;
- customer and consent data;
- order and checkout events;
- shade-match state;
- analytics and attribution;
- email templates and sending infrastructure;
- Resend account and domain state;
- asset inventory and rights;
- accessibility and performance;
- deployment and secrets;
- operational support workflows.

### Required outputs

- implementation gap register;
- severity and dependency rating;
- keep, refactor, replace or retire decision for each major system;
- confirmed minimum viable launch scope;
- unresolved source requirements.

### Exit criteria

- all critical unknowns have an owner and resolution path;
- no build estimate relies on an unverified assumption;
- the backlog reflects the actual codebase and operating constraints.

## Phase 2 — Shared foundations

### Objectives

Implement the cross-channel primitives needed by both website and email.

### Workstreams

- design tokens;
- typography and spacing scales;
- colour and surface tokens;
- product, shade and routine terminology;
- canonical product and variant identifiers;
- shared asset IDs and manifests;
- URL and market conventions;
- consent and suppression categories;
- event naming and versioning;
- claim and proof registry;
- environment and configuration conventions.

### Exit criteria

- website and email no longer define conflicting versions of shared truth;
- product, asset and lifecycle identifiers are stable;
- approved tokens can be consumed programmatically;
- all production-facing claims are traceable.

## Phase 3 — Asset migration and preparation

### Objectives

Prepare approved product, celebrity, customer-result, campaign and brand assets for production use.

### Workstreams

- inventory source assets;
- map files to canonical asset IDs;
- verify product and variant relationships;
- verify rights and expiry;
- preserve original celebrity and customer-result images;
- produce approved responsive crops;
- generate email and website derivatives;
- add alt text and fallback metadata;
- establish hosted URLs and cache policy;
- archive rejected and superseded versions.

### Exit criteria

- every launch asset has an approved manifest record;
- no page or email depends on placeholder imagery;
- product packaging and colour are accurate;
- protected people and documentary images remain unchanged;
- desktop and mobile crops pass review.

## Phase 4 — Website foundations and component system

### Objectives

Build the reusable implementation layer before completing individual pages.

### Workstreams

- application shell;
- navigation and utility controls;
- responsive layout primitives;
- typography components;
- buttons and CTA hierarchy;
- product cards and product media;
- editorial image modules;
- review and proof modules;
- shade and routine modules;
- forms and validation;
- loading, empty, unavailable and error states;
- analytics instrumentation hooks;
- accessibility primitives.

### Exit criteria

- core components reflect approved website documentation;
- components work across defined breakpoints;
- keyboard, screen-reader and reduced-motion behaviour is validated;
- page teams do not need to invent one-off design patterns.

## Phase 5 — Core website journeys

### Recommended order

1. Homepage
2. Collection and category pages
3. Product pages
4. Shade-match journey
5. Cart
6. Checkout
7. Account and preference surfaces
8. Service, policy and support surfaces

### Acceptance principles

- every page has one clear purpose;
- product, price, stock and variant data are live and validated;
- editorial storytelling does not hide purchase actions;
- mobile behaviour is intentionally designed;
- loading and unavailable states are complete;
- analytics events are emitted from the first production release.

## Phase 6 — Data model and lifecycle event layer

### Objectives

Create the data and event foundation required for email automation, measurement and customer-state coordination.

### Required domains

- customer identity;
- consent and preference history;
- products and variants;
- shade-match results;
- carts and cart lines;
- orders and fulfilment;
- lifecycle state;
- sequence enrolment and step history;
- send records and provider events;
- suppression and complaint state;
- VIP and loyalty state;
- asset and template versions;
- experiment assignment.

### Exit criteria

- all lifecycle triggers are generated from durable application events;
- events are versioned and replayable;
- consent and suppression are queryable at send time;
- customer state can be reconstructed from history;
- duplicate sequence entry is prevented.

## Phase 7 — Email template and sequence implementation

### Recommended order

1. Master template and shared components
2. Transactional and service messages
3. Welcome
4. Shade match
5. Cart abandonment
6. Browse abandonment
7. Post-purchase
8. Replenishment
9. Win-back
10. VIP and loyalty

### Required work

- implement approved template components;
- produce HTML and plain text;
- create immutable template releases;
- bind validated data contracts;
- implement sequence branching and suppressions;
- render test states;
- test accessibility and client compatibility;
- establish approval and rollback records.

### Exit criteria

- every message renders from structured data;
- all dynamic fields have fallbacks or suppression rules;
- lifecycle ownership and contact pressure are enforced;
- templates are immutable once released;
- test and production versions cannot be confused.

## Phase 8 — Resend integration

### Objectives

Connect the application to Resend through the approved provider boundary.

### Workstreams

- environment-specific API keys;
- sending domains and sender identities;
- server-side provider adapter;
- durable send records;
- queueing and retries;
- idempotency;
- webhook verification;
- provider event reconciliation;
- bounce, complaint and unsubscribe consequences;
- inbound reply routing;
- monitoring and emergency pause controls.

### Exit criteria

- no browser code can access sending credentials;
- duplicate sends are prevented;
- webhooks are verified and replayable;
- provider IDs reconcile to internal records;
- production sending can be paused safely;
- hard bounces, complaints and unsubscribes affect future eligibility promptly.

## Phase 9 — Analytics, experimentation and reporting

### Objectives

Measure customer and commercial outcomes across website and email without relying on provider attribution alone.

### Workstreams

- event taxonomy;
- funnel and lifecycle reporting;
- consent-aware analytics;
- source and campaign attribution;
- experiment assignments;
- holdouts and incrementality;
- deliverability monitoring;
- customer-service and support outcomes;
- contribution-margin reporting;
- dashboard ownership and data-quality checks.

### Exit criteria

- key journeys can be reconstructed end to end;
- website and email events use consistent identifiers;
- experiments have guardrails and decision rules;
- reporting distinguishes attributed from incremental outcomes;
- data-quality failures are visible.

## Phase 10 — Integrated QA and release rehearsal

### Test areas

- functional journeys;
- responsive rendering;
- accessibility;
- product and asset accuracy;
- data validation;
- lifecycle branching;
- consent and suppression;
- email clients;
- deliverability;
- performance;
- analytics;
- security;
- incident and rollback procedures.

### Release rehearsal

Run a complete rehearsal from customer event through:

1. eligibility decision;
2. durable event creation;
3. template selection;
4. rendering;
5. queue processing;
6. Resend submission;
7. webhook receipt;
8. internal reconciliation;
9. reporting;
10. support visibility.

### Exit criteria

- all blockers are closed;
- rollback and pause procedures have been exercised;
- support teams can diagnose common customer issues;
- launch dashboards and alerts are active.

## Phase 11 — Controlled launch

### Recommended rollout

1. Internal users and seeded accounts
2. Staff and approved test customers
3. Small production cohort
4. One market or customer segment
5. Expanded cohort with monitoring
6. Full release

### Launch controls

- daily launch review;
- explicit go/no-go owner;
- send and deployment pause mechanisms;
- live defect triage;
- deliverability guardrails;
- support escalation;
- rollback criteria;
- documented exceptions.

## Phase 12 — Post-launch optimisation

### First 30 days

- resolve defects and data mismatches;
- review support contacts and customer confusion;
- monitor deliverability and unsubscribe patterns;
- validate analytics completeness;
- compare actual performance with launch assumptions;
- remove temporary launch controls only after review.

### Ongoing

- quarterly architecture review;
- monthly lifecycle performance review;
- asset and rights expiry review;
- template and component deprecation;
- accessibility regression testing;
- dependency and security maintenance;
- experiment and roadmap prioritisation.

## Critical dependency chain

The default dependency order is:

`audit → shared truth → assets → components → website journeys → data/events → email templates → Resend → analytics → integrated QA → launch`

A later phase may begin early only when its required inputs are already stable and the exception is recorded.

## Definition of implementation complete

Implementation is complete only when:

- approved experiences are running in production;
- real assets and live data are used;
- website and email share canonical identifiers;
- lifecycle messages are correctly orchestrated;
- consent and suppression are enforced;
- Resend events reconcile internally;
- analytics are trustworthy;
- accessibility and performance meet release standards;
- incident and rollback procedures are operational;
- ownership transfers from project delivery to ongoing operations.