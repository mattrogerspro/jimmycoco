# Win-Back — Measurement, Testing and QA

## Purpose

Define how the win-back sequence is evaluated, experimented on and approved for production without optimising only for opens, clicks or gross revenue.

The sequence should prove that it creates incremental, profitable reactivation while protecting customer trust, list quality and brand value.

## Primary business outcome

The primary outcome is incremental reactivation among genuinely lapsed customers.

A reactivated customer should meet an approved value event, normally:

- a completed qualifying purchase;
- a paid subscription or replenishment action when such a programme exists;
- another explicitly defined commercial reactivation event.

Email opens alone are not reactivation.

## Core reporting metrics

Track by sequence version, lapse segment, confidence level, customer history, market and message step.

### Eligibility and reach

- number evaluated for eligibility;
- number eligible;
- number enrolled;
- number held out;
- number suppressed before entry;
- number suppressed before each send;
- reasons for exclusion and suppression.

### Delivery quality

- send requests;
- provider acceptances;
- delivery rate;
- hard-bounce rate;
- soft-bounce or delayed rate;
- complaint rate;
- unsubscribe rate;
- preference-change and pause rate;
- inbound-reply rate and intent.

### Engagement quality

- unique clicks;
- qualified site sessions;
- product, collection, shade-match and preference-centre visits;
- add-to-cart rate;
- checkout-start rate;
- support contacts generated;
- repeated inactive or low-quality clicks.

Treat opens as directional diagnostics only.

### Commercial outcomes

- reactivated customers;
- incremental reactivation rate versus holdout;
- orders;
- net revenue;
- contribution margin;
- average order value;
- discount cost;
- return, refund and cancellation rate;
- time to reactivation;
- second purchase after reactivation;
- 30-, 60- and 90-day retained value where data permits.

### List-health outcomes

- unsubscribe and complaint lift versus comparable campaigns;
- long-term engagement after sequence completion;
- repeated non-response;
- provider suppression growth;
- preference-centre usage;
- reduction in future contact frequency.

## Holdout design

Maintain a persistent randomised holdout for eligible customers whenever volume permits.

The holdout should receive no win-back sequence during the measurement window, while still receiving required service and transactional communication.

Compare:

- purchase and reactivation rates;
- net revenue and margin;
- organic return rate;
- complaint and unsubscribe outcomes;
- later customer value.

Do not credit every purchase following an email to the sequence. Customers may have returned without intervention.

## Attribution

Use a hierarchy of evidence:

1. incremental lift against a valid holdout;
2. click-through purchase as a supporting behavioural signal;
3. view-through or open-based attribution only as a limited diagnostic, never the primary proof of value.

Document attribution windows and keep them consistent across variants.

## Segmentation analysis

Evaluate performance separately for:

- first-time customers who never repeated;
- established repeat customers;
- high-value or VIP customers;
- product-specific lapse;
- category or routine lapse;
- short, medium and long lapse duration;
- low, medium and high lapse confidence;
- customers with prior discount use;
- customers entering from different acquisition sources;
- market, locale and currency.

Do not pool materially different segments into one headline result.

## Experiment priorities

Test one major hypothesis at a time where possible.

Recommended order:

1. lapse threshold and eligibility model;
2. sequence versus no-sequence incrementality;
3. message count and cadence;
4. product-led versus guidance-led re-entry;
5. shade-match or routine-builder route;
6. preference-reset framing;
7. service-led treatment for higher-value customers;
8. incentive versus no incentive;
9. incentive structure and depth within margin rules;
10. subject line, preview text and creative execution.

Do not optimise cosmetic details before validating who should receive the sequence and whether the sequence creates incremental value.

## Incentive testing

Any offer test must include:

- a no-offer control;
- defined eligibility and exclusions;
- contribution-margin analysis;
- redemption and leakage monitoring;
- impact on subsequent full-price purchase behaviour;
- customer-history analysis;
- complaint and unsubscribe comparison.

A variant with higher gross revenue can still be worse if it reduces margin or trains customers to wait for discounts.

## Cadence testing

Compare cadence using customer outcomes, not only email engagement.

Monitor:

- reactivation timing;
- cumulative unsubscribe and complaint rate;
- contact-pressure conflicts;
- order cancellation and return quality;
- sequence completion without action;
- repeated sequence eligibility.

Long-lapsed customers may need fewer messages, not more.

## Content-quality review

Every email must be reviewed for:

- relevance to the assigned lapse segment;
- truthful description of past relationship;
- absence of guilt, pressure or fake familiarity;
- one dominant message and CTA;
- approved product, customer and celebrity imagery;
- current claims, reviews and product facts;
- useful plain-text alternative;
- clear preference, pause and unsubscribe routes.

## Data QA before launch

Verify that the implementation can correctly:

- calculate lapse relative to product and customer history;
- distinguish recent purchase from true inactivity;
- exclude unresolved complaints, returns, refunds and support risk;
- snapshot valid consent;
- enforce cooling-off and global contact-pressure rules;
- select the correct product or guidance context;
- validate stock, price, currency, variant and URL;
- prevent duplicate enrolments;
- apply holdout assignment persistently;
- reset eligibility after reactivation;
- preserve an auditable completion reason.

Use synthetic and anonymised fixtures covering every branch.

## State-transition QA

Test the following events at each message step:

- purchase completed;
- item added to cart;
- checkout started;
- shade match started and completed;
- new meaningful browse activity;
- support case opened;
- complaint received;
- return or refund initiated;
- unsubscribe or preference change;
- hard bounce or provider complaint;
- product or variant becomes unavailable;
- offer expires;
- price or currency changes;
- sequence expires.

No event should allow a stale scheduled message to escape pre-send validation.

## Resend integration QA

Confirm:

- approved sending domain and `from` identity;
- monitored `reply_to` address;
- correct HTML and plain-text bodies;
- required tags without personal data;
- stable application correlation IDs;
- one idempotency key per intended send;
- safe retry behaviour;
- webhook signature verification;
- duplicate webhook suppression;
- bounce and complaint propagation to global suppression;
- inbound-reply ingestion and routing;
- operational logging without exposed secrets or unnecessary personal data.

## Email-client QA

Test the approved client matrix, including current priority versions of:

- Apple Mail and iOS Mail;
- Gmail web and mobile;
- Outlook desktop and web;
- major Android mail clients;
- dark mode where supported.

Check:

- 600–640px desktop shell;
- responsive mobile stacking;
- live-text hierarchy;
- image blocking;
- button resilience in Outlook;
- correct alt text;
- visible links and focus states;
- no clipped prices, offer terms or preference controls;
- functional unsubscribe and preference links.

## Accessibility QA

Every email must pass review for:

- logical reading order;
- semantic headings where practical;
- sufficient contrast;
- text size and line length;
- descriptive alt text;
- meaningful linked text;
- touch-target size;
- no information conveyed by image or colour alone;
- reduced ambiguity in offer terms;
- useful plain-text content.

## Product and asset QA

Immediately before send verify:

- exact product and variant identity;
- current purchasability;
- current price and currency;
- working destination URL;
- correct approved product image;
- no AI-redrawn packaging or altered labels;
- customer and celebrity image rights and context;
- no generative alteration of faces, bodies, skin tone or before-and-after evidence.

## Offer QA

Where an incentive is present, verify:

- policy and approval ID;
- customer eligibility;
- market and product exclusions;
- valid code or secure claim link;
- start and expiry time;
- current terms;
- checkout compatibility;
- margin guardrail;
- no conflict with another active promotion.

If the offer cannot be validated, suppress the offer module or the message according to policy.

## Monitoring after launch

Review daily during initial release:

- send and delivery anomalies;
- webhook failures;
- bounce and complaint spikes;
- unexpected support volume;
- broken links or unavailable products;
- duplicate sends;
- invalid offer reports;
- contact-pressure conflicts;
- segment-size anomalies;
- reactivation and margin signals.

Maintain an immediate kill switch for the sequence and each individual message.

## Release gates

Do not launch until:

- lifecycle, legal/privacy, brand, merchandising and support owners approve their relevant areas;
- all suppression and handoff scenarios pass;
- holdout assignment is working;
- consent and preference handling is verified;
- product and offer validation is live;
- Resend sending, webhooks and inbound replies are tested;
- client and accessibility QA pass;
- dashboards and alerts are available;
- operational ownership and rollback are documented.

## Success standard

A successful win-back programme produces measurable incremental customer value with acceptable margin and list-health impact. It must also become quieter when customers repeatedly decline to engage.

The programme has failed when it generates attributed revenue by over-mailing, discount dependency, stale personalisation, unresolved-service targeting or misleading claims.