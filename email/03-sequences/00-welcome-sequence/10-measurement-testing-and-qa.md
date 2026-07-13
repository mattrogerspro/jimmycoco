# Measurement, Testing and QA

## Purpose

Measure whether the welcome sequence creates confident, qualified customers without damaging deliverability, trust or long-term engagement.

## Primary success metrics

- first-purchase conversion rate within the approved attribution window;
- revenue per enrolled contact;
- shade-match completion rate;
- recommendation-view rate;
- product-page progression from sequence clicks;
- time to first purchase;
- unsubscribe, complaint and hard-bounce rates;
- post-purchase return, cancellation or shade-dissatisfaction signals where available.

## Supporting metrics

- delivery rate;
- unique click rate;
- click-to-purchase rate;
- sequence completion rate;
- email-step conversion contribution;
- saved-recommendation recovery;
- routine-builder engagement;
- reply and support-contact themes;
- mobile versus desktop performance.

Open rate may be monitored directionally but must not be treated as a reliable primary outcome because mailbox privacy features can distort it.

## Attribution

Use a defined, documented attribution model. Report both:

- direct click-through conversion;
- broader enrolled-cohort conversion compared with an eligible holdout or historical baseline.

Do not claim that the last email alone caused a purchase when several sequence touches contributed.

## Required event taxonomy

- `welcome_enrolled`
- `welcome_email_scheduled`
- `welcome_email_skipped`
- `welcome_email_sent`
- `welcome_email_delivered`
- `welcome_email_clicked`
- `welcome_sequence_paused`
- `welcome_sequence_exited`
- `shade_match_started`
- `shade_match_completed`
- `recommendation_viewed`
- `product_viewed`
- `add_to_cart`
- `checkout_started`
- `order_completed`
- `marketing_unsubscribed`
- `email_complaint`
- `email_bounced`

Include sequence version, step, branch and experiment identifiers.

## Testing priorities

Test one meaningful hypothesis at a time. Recommended early tests:

1. Shade-match-first versus brand-story-first CTA in Email 01.
2. Three-principle educational layout versus one focused principle in Email 02.
3. Saved recommendation panel placement in Email 03.
4. Two versus three verified result stories in Email 04.
5. Recommendation explanation depth in Email 05.
6. Routine education versus restrained bundle presentation in Email 06.
7. Cadence spacing, subject-line framing and sender-name clarity.

Do not test misleading urgency, hidden terms, inaccessible design or weak consent patterns.

## Holdout strategy

Maintain a small eligible control group where commercially appropriate to estimate incremental impact. Holdouts must still receive required transactional and service communications.

## Pre-send content QA

For every message verify:

- approved subject and preview text;
- one primary CTA;
- correct destination URLs;
- current product, price, currency and stock;
- accurate recommendation and variant;
- approved claims and proof;
- source-image integrity;
- alt text;
- useful plain-text alternative;
- unsubscribe and preference links;
- sender identity and reply handling;
- no unresolved placeholders;
- no duplicated or contradictory modules.

## Rendering QA

Review at minimum:

- Gmail web and mobile;
- Apple Mail desktop and mobile;
- Outlook desktop and web;
- common Android mail rendering;
- dark mode where supported;
- images disabled;
- 200% text zoom or equivalent accessibility review;
- narrow mobile widths.

## Behavioural QA scenarios

Test full paths for:

- new subscriber with no profile data;
- completed shade match;
- incomplete shade match;
- product viewed but not matched;
- cart created during sequence;
- purchase immediately before a scheduled send;
- product going out of stock;
- missing product image or price;
- unsubscribe before send;
- hard bounce and complaint;
- duplicate enrolment event;
- Resend timeout followed by retry;
- inbound reply.

## Deliverability guardrails

Define alert thresholds before launch for:

- provider rejection;
- hard bounce;
- complaint;
- unsubscribe spikes;
- domain-authentication failure;
- unexpected send-volume changes;
- webhook-processing lag.

Pause the affected flow when safety thresholds are exceeded.

## Approval roles

Production release requires sign-off from:

- lifecycle/CRM owner;
- brand or creative owner;
- ecommerce/product-data owner;
- privacy or compliance owner where required;
- engineering owner;
- deliverability owner.

## Versioning

Record:

- sequence version;
- template version per email;
- copy version;
- experiment version;
- logic-rules version;
- release date;
- approvers;
- rollback target.

## Post-launch review

Review after the first meaningful sample and again at a stable interval. Analyse not only conversion but also complaints, support questions, product-fit problems and downstream retention.

## Definition of launch-ready

The welcome sequence is launch-ready only when every branch is deterministic, every send is consented and idempotent, every asset and claim is approved, every message has passed rendering checks, and purchase events reliably remove recipients from the prospect path.