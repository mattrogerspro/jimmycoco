# Replenishment — Measurement, Testing and QA

## Purpose

Define how the replenishment sequence is evaluated, improved and released without confusing correlation with incremental value.

The programme should optimise for useful, well-timed repeat purchase and customer convenience while protecting margin, trust, consent and deliverability.

## Primary business question

Does the sequence cause more appropriate repeat purchases than would have occurred without the reminders, at an acceptable margin and customer-experience cost?

Raw attributed revenue alone cannot answer this because many loyal customers would reorder without email.

## Core outcome metrics

Track by product, variant, customer cohort, model confidence and message step:

- eligible customers;
- enrolled customers;
- messages scheduled;
- messages sent;
- delivery rate;
- hard-bounce and complaint rate;
- click-through rate;
- product return-session rate;
- same-product repurchase rate;
- approved-successor repurchase rate;
- routine-adjustment or shade-match rate;
- median time from reminder to purchase;
- gross revenue and net revenue;
- contribution margin after discounts, fulfilment and returns;
- unsubscribe and reminder-pause rate;
- support-contact rate;
- incremental repurchase lift versus holdout.

Do not optimise from open rate alone. Privacy features and automated image loading make opens unreliable as a measure of human attention.

## Incrementality design

Maintain a persistent randomised holdout where volume permits.

Recommended approach:

- assign eligible enrolments to treatment or holdout before the first message;
- preserve assignment for the full replenishment window;
- do not expose holdout customers to another equivalent replenishment campaign;
- compare purchase behaviour over the same observation period;
- report confidence intervals and sample size;
- separate same-product purchases from unrelated orders.

Where product volume is low, aggregate carefully across products with comparable usage behaviour rather than claiming precision from a small sample.

## Model-quality metrics

The timing model should be evaluated independently from email creative.

Track:

- predicted replenishment window;
- actual next purchase date where observable;
- percentage purchasing before the first reminder;
- percentage purchasing inside the predicted window;
- percentage purchasing long after the window;
- customer “too soon,” “about right” or “too late” preference feedback where collected;
- reminder-delay and pause selections;
- model error by product type and customer cohort.

A purchase date is only a proxy for depletion. Customers may stock up early, buy gifts or switch channels. Treat it as behavioural evidence, not proof of when a product ran out.

## Margin and promotion analysis

Report results separately for:

- no-incentive reminders;
- approved incentive variants;
- full-price repurchases;
- discounted repurchases;
- repeat customers likely to reorder without assistance.

Evaluate:

- incremental orders;
- incremental contribution margin;
- discount cost;
- change in average order value;
- effect on purchase timing;
- evidence of customers delaying orders to await an offer.

Do not expand incentive use merely because it raises last-click conversion.

## Segmentation views

Review performance by:

- first-time versus repeat purchaser;
- low, medium and high model confidence;
- product family;
- face, body, tool and professional-use category;
- quantity purchased;
- customer-selected reminder preference;
- geographic market and currency;
- message step;
- mobile versus desktop click destination;
- full-price versus promotion-led purchase.

Do not create sensitive or discriminatory segments from inferred personal characteristics.

## Recommended experiments

Test one meaningful variable at a time whenever possible.

### Timing tests

- earlier versus later first reminder;
- narrow versus wider reminder window;
- model-based timing versus conservative fixed timing;
- local-time optimisation.

### Message tests

- reorder-led versus routine-led framing;
- direct product module versus editorial guidance;
- “check your supply” language versus “reorder when ready” language;
- reorder CTA versus adjust-routine CTA.

### Sequence-length tests

- one reminder versus three-message sequence;
- shorter versus wider spacing;
- suppressing the final message for low-confidence customers.

### Preference tests

- visible “remind me later” control;
- frequency preference collection;
- product-specific reminder pause.

### Offer tests

Only under an approved commercial framework:

- no offer versus approved offer;
- offer in final step only;
- free-shipping threshold versus percentage discount.

## Guardrail metrics

Every experiment must monitor:

- complaint rate;
- hard-bounce rate;
- unsubscribe rate;
- reminder-pause and opt-out rate;
- support complaints about timing or pressure;
- returns and cancellations;
- margin deterioration;
- overlap with cart, post-purchase or campaign messaging;
- duplicate-send incidents;
- stock and price errors.

A conversion improvement is not acceptable if it materially damages trust, margin or deliverability.

## Attribution policy

Use a documented attribution hierarchy.

Recommended reporting layers:

1. direct click-through conversion;
2. broader first-party influenced conversion window;
3. experiment-based incremental conversion;
4. incremental contribution margin.

The experiment-based view should guide major budget and strategy decisions.

Avoid awarding full credit to multiple simultaneous flows. Store flow ownership and exposure history so cart abandonment, replenishment and campaigns can be reconciled.

## Data-quality checks

Before analysing results, verify:

- order IDs are unique;
- test and internal orders are excluded;
- refunds and cancellations are reflected;
- currency conversion is documented;
- product and variant mappings are stable;
- successor-product relationships are approved;
- webhook events are deduplicated;
- Resend message IDs map correctly to internal message records;
- holdout assignment is preserved;
- scheduled but suppressed messages are not counted as sends;
- purchases before enrolment are not attributed to the flow.

## Pre-release functional QA

Test all supported paths:

- first-time consumable purchase;
- repeat purchase with known interval;
- multi-quantity order;
- multi-product order;
- professional product;
- durable accessory excluded from standard replenishment;
- new purchase before first send;
- new purchase between messages;
- variant switch;
- discontinued product with approved successor;
- product temporarily out of stock;
- no safe alternative;
- cart handoff;
- shade-match handoff;
- support or safety suppression;
- reminder delay and pause;
- unsubscribe and provider suppression;
- duplicate scheduler execution;
- delayed and out-of-order webhooks.

## Content QA

For each message verify:

- subject and preview text are accurate;
- wording expresses timing as an estimate;
- product name and variant are correct;
- price and currency are current when shown;
- stock state is correct;
- CTA destination resolves to the intended state;
- reminder-preference link works;
- no expired promotion appears;
- claims and usage statements are approved;
- product imagery is the approved source asset;
- no celebrity or customer image is used without the appropriate approval and rights;
- no generative alteration changes packaging, skin, colour or identity.

## Email-client QA

Test the supported client matrix, including at minimum:

- Apple Mail on iPhone;
- Gmail mobile and web;
- Outlook desktop where relevant;
- Outlook web;
- Apple Mail desktop;
- dark-mode conditions;
- images disabled;
- narrow mobile widths.

Confirm:

- readable hierarchy;
- live text remains useful without images;
- buttons are large enough to tap;
- product modules stack correctly;
- prices do not wrap ambiguously;
- fallback fonts preserve hierarchy;
- alt text is concise and descriptive;
- plain-text version contains the core action and preference link.

## Accessibility QA

Verify:

- semantic reading order;
- descriptive links rather than repeated “click here” copy;
- sufficient contrast;
- body text remains legible when zoomed;
- information is not conveyed by colour alone;
- decorative images use empty alt text;
- meaningful images use accurate alt text;
- motion is absent or safely controlled;
- preference controls are understandable outside the visual layout.

## Operational QA

Before production launch confirm:

- sending domain authentication is healthy;
- production Resend key is stored securely;
- staging cannot send to the production audience;
- webhook verification is enabled;
- webhook retries are idempotent;
- global and product-specific suppression work;
- scheduler uses the customer’s approved local-time logic;
- live inventory and price validation fail closed;
- logs expose message and enrolment IDs without leaking sensitive data;
- alerting exists for send failures, bounce spikes, complaint spikes and duplicate attempts;
- the sequence can be paused globally without code deployment.

## Launch plan

Recommended release stages:

1. internal addresses and synthetic orders;
2. controlled staging with a recipient allowlist;
3. small production cohort for one stable consumable product;
4. validate delivery, suppression, purchase resets and preference controls;
5. expand to additional product families by confidence level;
6. introduce experimentation only after operational stability.

Do not launch every product category at once. Durable tools, professional products and irregular-use products require separate validation.

## Release criteria

The sequence is ready only when:

- all functional branches pass;
- product and consent data fail safely;
- no duplicate messages are produced under retry tests;
- purchase resets work before and between sends;
- preference changes apply before the next send;
- plain-text and accessibility checks pass;
- supported email clients render acceptably;
- holdout assignment and reporting are active;
- operational owners know how to pause, investigate and reconcile the flow.

## Ongoing review

Review performance and model quality on a fixed cadence.

Recommended operational rhythm:

- weekly delivery, error and suppression review during launch;
- monthly product-level timing and margin review;
- quarterly model and contact-policy review;
- immediate review after product size, formula, packaging, usage guidance or price changes.

Replenishment assumptions must evolve with observed behaviour and verified product information. They must never become permanent facts simply because they were once encoded in the model.