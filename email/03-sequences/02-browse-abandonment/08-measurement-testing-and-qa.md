# Browse Abandonment — Measurement, Testing and QA

## Purpose

Define how the sequence is evaluated, experimented with and released safely without optimising for vanity metrics or creating intrusive customer experiences.

## Primary commercial outcomes

Measure the sequence against:

- qualified return sessions;
- product-detail or collection re-engagement;
- shade-match starts and completions;
- add-to-cart rate;
- checkout starts;
- purchase conversion;
- revenue per eligible contact;
- incremental conversion versus a valid holdout.

Attribution must use a documented window and should distinguish click-through conversion from broader influenced conversion.

## Customer-protection metrics

Monitor at sequence and step level:

- unsubscribe rate;
- spam-complaint rate;
- hard-bounce rate;
- soft-bounce and delivery-failure rate;
- negative-engagement or inactivity signals;
- contact-pressure conflicts;
- suppression and cancellation volume;
- customer-service feedback related to perceived tracking.

A flow that produces revenue while materially damaging trust or deliverability is not successful.

## Diagnostic metrics

Use these as supporting indicators, not primary success measures:

- delivered rate;
- click rate;
- click-to-open rate, with caution;
- destination-page engagement;
- product versus guidance CTA selection;
- handoff rate to cart, checkout or shade match;
- exit reason distribution;
- product-unavailable fallback rate;
- rendering or data-validation failure rate.

Open rate is directional only because privacy protections and automated prefetching can distort it.

## Holdout design

Maintain a persistent random holdout among eligible contacts where volume permits.

The holdout should:

- meet the same eligibility rules;
- receive no browse-abandonment messages during the test window;
- remain eligible for essential transactional communication;
- be protected from accidental re-enrolment;
- be analysed over a long enough period to include delayed purchases.

Use the holdout to estimate incrementality rather than crediting all post-email purchases to the sequence.

## Segmented analysis

Evaluate performance by meaningful, sufficiently sized segments such as:

- single-product versus collection intent;
- new versus returning customer;
- shade-match-connected versus browse-only intent;
- device category;
- product family;
- sequence step;
- first-time versus repeat sequence eligibility;
- locale or market where implementation differs.

Do not over-segment small populations or infer sensitive customer traits.

## Approved experiment areas

Test one substantial hypothesis at a time where possible.

Suitable experiments include:

- first-send timing;
- product-led versus guidance-led first email;
- direct product CTA versus shade-match CTA for uncertain intent;
- one proof story versus a compact review module;
- three-email versus four-email cadence;
- subject-line framing;
- product image scale;
- final-email inclusion or omission;
- send-time optimisation using approved first-party data.

## Experiments to avoid by default

Do not test:

- false urgency;
- misleading scarcity;
- fabricated personalisation;
- increasingly aggressive surveillance language;
- unapproved discounts;
- hidden unsubscribe paths;
- generatively altered customer, celebrity or product imagery;
- tactics that intentionally make consent or preference controls harder to use.

## Release gates

Before enabling the sequence in production, confirm:

### Strategy and lifecycle

- entry signals are meaningful and documented;
- consent is checked at entry and pre-send;
- cross-flow priority is implemented;
- cart, checkout and purchase events cancel future sends;
- cooldown and contact-pressure rules work;
- holdout assignment is stable.

### Data and rendering

- all required fields have typed contracts;
- null and missing states degrade safely;
- current product, price, stock and URL validation occurs before send;
- selected variants are shown only when reliable;
- unavailable products follow an approved fallback path;
- HTML and plain text contain the same essential message;
- tracking parameters are consistent and safe.

### Content and claims

- subject and preview text match the actual message;
- copy never says the brand watched the visitor;
- no unsupported suitability or performance claim appears;
- review wording and scores are verified;
- proof disclosures are present;
- offer terms are complete when an approved incentive is used.

### Assets

- product imagery uses approved source files;
- packaging, labels, colour and skin have not been generatively altered;
- customer and celebrity rights are confirmed for the intended context;
- alt text is accurate and concise;
- image-blocked layouts remain understandable.

### Email-client QA

Test representative rendering in:

- Gmail web and mobile;
- Apple Mail;
- Outlook desktop and web;
- major iOS and Android mail environments;
- light and dark modes where relevant;
- image-blocked state;
- narrow mobile widths;
- plain-text view.

Confirm buttons, links, spacing, live text, fallbacks and footer controls remain usable.

### Resend and operations

- verified sender and reply-to identities are used;
- idempotency prevents duplicate sends;
- message IDs are stored;
- webhook authenticity and deduplication are implemented;
- hard bounce and complaint suppression works;
- retry behaviour is bounded;
- monitoring and alerting thresholds exist;
- test and production environments cannot be confused.

## Step-specific QA

For each of the four messages, verify:

- correct template key and sequence step;
- correct target product, collection or guidance path;
- correct CTA and destination;
- no stale browse state;
- no duplicate message for the step;
- no more specific lifecycle flow has taken ownership;
- current consent and suppression status;
- copy and proof remain appropriate to the selected personalisation level.

## Ongoing monitoring

After launch, review:

- daily delivery and provider failures during the initial release;
- weekly conversion, complaint and flow-handoff trends;
- product-data and rendering failures;
- unexpected spikes in enrolment or suppression;
- repeated contacts entering near the cooldown boundary;
- holdout incrementality on an agreed reporting cycle.

Pause the sequence when safety, consent, data integrity, deliverability or customer-trust thresholds are breached.

## Definition of success

The browse-abandonment sequence is successful when it creates measurable incremental movement from genuine interest to a confident next action, while remaining restrained, explainable, technically reliable and respectful of the customer.