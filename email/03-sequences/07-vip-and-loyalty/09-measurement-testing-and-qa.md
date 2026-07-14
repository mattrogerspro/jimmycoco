# VIP and Loyalty — Measurement, Testing and QA

## Purpose

Define how the VIP and loyalty programme is evaluated, tested and released without reducing success to opens, clicks or short-term revenue.

## Measurement principles

1. Measure incremental behaviour, not only attributed behaviour.
2. Evaluate service quality and trust alongside revenue.
3. Separate programme performance from normal customer-value differences.
4. Do not treat high-spend customers as proof that the programme caused high spend.
5. Track benefit cost, fulfilment burden and contribution margin.
6. Review tier fairness, correction rates and customer complaints.
7. Use delivery and engagement metrics as diagnostics, not the sole definition of success.

## Primary outcome groups

### Customer outcomes

- repeat-purchase rate;
- retained-customer rate;
- purchase frequency change;
- time to next qualifying purchase;
- shade or routine support usage;
- benefit redemption;
- customer-service satisfaction;
- preference retention;
- complaint and unsubscribe rates;
- tier-transition retention.

### Commercial outcomes

- incremental revenue;
- incremental contribution margin;
- average order value change;
- full-price purchase rate;
- benefit and reward cost;
- fulfilment and service cost;
- discount dependency;
- product mix;
- long-term customer value change.

### Programme-quality outcomes

- qualification accuracy;
- duplicate welcome rate;
- incorrect tier communication rate;
- benefit failure rate;
- benefit redemption error rate;
- status-dispute rate;
- manual correction rate;
- unresolved support handoff rate;
- stale or invalid product data rate;
- send suppression accuracy.

### Deliverability outcomes

- accepted and delivered messages;
- hard and soft bounces;
- complaint rate;
- unsubscribe rate;
- domain and sender reputation signals;
- provider suppression changes;
- delivery latency;
- webhook completeness and lag.

## Incrementality design

Use persistent or event-level holdouts where operationally appropriate.

Possible designs:

- qualified VIP customers with access to benefits but no additional promotional email;
- staged release of specific benefits;
- message-level holdouts for milestones or access events;
- controlled comparison of guidance-led versus reward-led treatment;
- tier-renewal communication tests where all legally or operationally required information remains present.

Never withhold essential service, status, expiry or programme-change information merely to create a test.

## Segmentation for analysis

Analyse separately by:

- newly qualified versus established VIP;
- tier;
- first-time versus repeat customer;
- purchase-frequency pattern;
- consumer versus professional channel;
- market and currency;
- product family;
- benefit type;
- incentive history;
- service-risk history;
- qualification and lapse confidence.

Avoid tiny segments that create unstable conclusions or expose individual behaviour.

## Test hierarchy

Prioritise tests in this order:

1. Qualification and orchestration accuracy
2. Benefit usefulness
3. Message relevance
4. Service accessibility
5. CTA clarity
6. Cadence and contact pressure
7. Subject line and preview text
8. Visual treatment
9. Policy-approved incentive structure

Do not begin by optimising decorative status language while programme logic remains unreliable.

## Suitable test hypotheses

Examples:

- expert access creates stronger retained value than a generic discount;
- one clear benefit produces better use than a crowded benefit list;
- milestone recognition without a purchase requirement improves trust;
- a service-led VIP welcome reduces support uncertainty;
- restrained tier-transition language reduces complaints;
- benefit reminders are more effective when based on expiry relevance rather than arbitrary cadence.

Every test must define:

- hypothesis;
- eligible population;
- primary outcome;
- guardrail metrics;
- sample and duration assumptions;
- stopping rule;
- implementation owner;
- post-test decision.

## Guardrails

Stop or investigate a treatment when there is a meaningful increase in:

- complaints;
- unsubscribes;
- hard bounces;
- status disputes;
- benefit failures;
- support backlog;
- refund or cancellation behaviour;
- margin erosion;
- inaccurate exclusivity or availability;
- accessibility defects.

## Pre-launch programme QA

Confirm:

- qualification rules are versioned and auditable;
- tier thresholds and review periods are approved;
- benefits are funded and operational;
- customer support has programme documentation;
- benefit terms match checkout and account experiences;
- grace, transition and expiry rules are defined;
- disputes have a human escalation route;
- consent and service-message classifications are reviewed;
- data retention and access controls are approved;
- programme events can be replayed safely;
- idempotency prevents duplicate qualification and redemption.

## Pre-send data QA

For every message, validate:

- contact identity;
- consent and suppression;
- current tier;
- event and programme version;
- benefit state;
- market and currency;
- product, price, stock and variant when shown;
- dates, terms and expiry;
- destination URLs;
- no unresolved complaint or safety state;
- no higher-priority lifecycle owner;
- idempotency key.

## Content QA

Review:

- subject and preview relationship;
- correct tier language;
- accurate recognition and milestone wording;
- no false exclusivity;
- no invented scarcity;
- no spend-shaming or coercive downgrade language;
- benefit terms in plain language;
- one clear primary CTA;
- natural fallbacks for missing names or fields;
- correct legal, preference and unsubscribe content;
- useful plain-text alternative.

## Asset QA

Confirm:

- all product, customer and celebrity assets are approved for this use;
- original source imagery has not been generatively altered;
- product packaging and colour remain accurate;
- review or result claims are traceable;
- image crops remain respectful and legible;
- alt text communicates function and context;
- the email remains understandable with images blocked.

## Client and accessibility QA

Test representative current versions of:

- Gmail web and mobile;
- Apple Mail desktop and mobile;
- Outlook desktop and web;
- common Android mail clients;
- dark mode where relevant.

Verify:

- responsive stacking;
- readable fallback fonts;
- sufficient contrast;
- keyboard-accessible links;
- descriptive link text;
- minimum practical tap targets;
- no critical information embedded only in images;
- logical reading order;
- graceful Outlook rendering;
- plain-text parity.

## Resend and integration QA

Before production release, verify:

- correct sending domain and sender identity;
- production and test environments are separated;
- event and webhook verification works;
- repeated webhooks are deduplicated;
- provider message IDs map to internal records;
- bounces and complaints suppress pending sends;
- replies route to the correct support queue;
- retry logic cannot duplicate messages;
- benefit clicks do not falsely mark redemption;
- MCP access cannot bypass application safeguards;
- reconciliation can identify missing or conflicting message states.

## Release stages

Recommended rollout:

1. Internal seeded tests
2. Test accounts covering every tier and transition state
3. Small controlled production cohort
4. Review of delivery, service load and benefit fulfilment
5. Expanded cohort with holdout
6. Full release after guardrails remain healthy

## Ongoing review rhythm

### Weekly during launch

Review send failures, incorrect states, support volume, benefit redemption and customer feedback.

### Monthly

Review incremental outcomes, margin, list health, tier corrections and contact pressure.

### Quarterly

Review qualification fairness, tier thresholds, benefit usefulness, programme costs and lifecycle overlap.

### On every programme change

Re-run full qualification, transition, content, integration and customer-support QA before communicating the change.

## Release blocker examples

Do not launch or continue sending when:

- tier decisions cannot be reproduced;
- benefits cannot be honoured;
- checkout terms conflict with email terms;
- a downgrade is communicated before the state is final;
- consent or suppression checks are unreliable;
- duplicate redemption is possible;
- support cannot resolve status disputes;
- product or price data is stale;
- webhook authentication is not working;
- critical accessibility or client defects remain.

The programme is ready only when the customer experience, benefit operation, service support and technical delivery work as one system.