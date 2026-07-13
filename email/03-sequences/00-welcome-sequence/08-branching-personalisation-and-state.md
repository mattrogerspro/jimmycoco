# Branching, Personalisation and State

## Purpose

Ensure the welcome sequence responds to what the customer has already done rather than repeatedly asking for actions they have completed.

## Core principle

Personalisation must be explicit, explainable and based on consented first-party data. When data is missing or uncertain, use a neutral fallback rather than fabricated precision.

## Primary branch states

### A — New subscriber, no shade-match activity
Send the default six-email sequence.

### B — Shade match started but incomplete
- Email 01 CTA: **CONTINUE MY MATCH**
- Email 03 becomes the strongest completion prompt.
- Resume at the saved step.
- Do not restart the questionnaire.

### C — Shade match completed, no purchase
- Email 01 shows **VIEW MY MATCH**.
- Email 03 reassures product fit rather than asking the same questions again.
- Email 04 prioritises relevant proof.
- Email 05 displays the saved recommendation.
- Email 06 builds the routine around it.

### D — Product viewed repeatedly, no shade match
Do not call the viewed item a recommendation. The email may acknowledge interest with wording such as:

> Still considering this format? Check whether it matches the result and routine you want.

### E — Cart created
Pause lower-priority welcome messages while the cart-abandonment decision is evaluated. Do not send welcome and cart messages within the same pressure window.

### F — Purchase completed
Exit immediately and enter post-purchase. Preserve the welcome-series source for attribution.

### G — Existing purchaser or returning customer
Do not enrol in the prospect sequence. Use retention, replenishment, education or win-back logic.

## Personalisation fields

Approved fields include:

- first name with a neutral fallback;
- shade-match status;
- saved recommendation ID;
- selected product variant;
- stated desired depth;
- stated application-format preference;
- stated development-time preference;
- product or category interest;
- customer lifecycle state;
- country, currency and shipping region;
- consent and preference state.

## Prohibited or high-risk personalisation

Do not infer or expose:

- ethnicity;
- health or medical conditions;
- pregnancy status;
- sensitive body-image judgements;
- financial status;
- exact skin classification not directly and appropriately provided;
- private customer-support content in marketing copy.

## Fallback hierarchy

1. Exact validated saved recommendation.
2. Approved contextual guidance based on declared preferences.
3. Category-level education.
4. Neutral shade-match CTA.

Never skip from missing data to a fake personalised product.

## State transitions

Every event should be evaluated before each scheduled send:

- `quiz_started`
- `quiz_completed`
- `recommendation_updated`
- `product_viewed`
- `cart_created`
- `checkout_started`
- `order_completed`
- `support_case_opened`
- `marketing_unsubscribed`
- `email_bounced`
- `spam_complaint_received`

## Priority order

1. Consent and suppression.
2. Transactional/service communications.
3. Active customer-support sensitivity.
4. Post-purchase.
5. Cart or checkout recovery.
6. Welcome sequence.
7. General campaign mail.

## Frequency coordination

The welcome sequence must use the central contact-pressure ledger. A scheduled message may be delayed or skipped when another higher-priority marketing message was recently sent.

## Content validation before send

Revalidate:

- customer state;
- recommendation status;
- product availability;
- price and currency;
- destination URL;
- consent;
- suppression status;
- recent send pressure.

## Success criteria

- No recipient is asked to repeat a completed action.
- Purchasers leave the prospect flow promptly.
- Personalisation is transparent and accurate.
- Missing data produces graceful neutral content.
- Every branch can be traced to stored events and rules.