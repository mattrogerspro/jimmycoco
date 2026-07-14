# Win-Back — Branching, Customer State and Handoffs

## Purpose

Define how the win-back sequence adapts to different customer histories, how it responds to new behaviour and how ownership transfers to more relevant lifecycle flows.

## Core state model

Each active win-back record should preserve:

- contact ID;
- customer ID when available;
- sequence version;
- lapse segment;
- lapse-confidence level;
- last qualifying purchase date;
- expected purchase interval;
- products or routines previously purchased;
- last meaningful engagement date;
- consent and suppression state;
- active message step;
- current contact-pressure score;
- most recent cart, checkout, purchase, support and preference events;
- optional incentive eligibility under approved policy;
- sequence entry and expiry timestamps.

Do not rebuild state from email opens alone. Opens are unreliable and should not determine lifecycle ownership.

## Primary customer branches

### First-time customer who never repeated

Likely needs renewed confidence, product guidance or a lower-friction route back.

Recommended approach:

- remind them what they previously bought;
- offer application or shade support;
- show a relevant next step rather than assuming they want an identical reorder;
- avoid presenting them as loyal or long-term customers.

### Established repeat customer who has lapsed

Likely understands the product but may have changed routine, need, budget or timing.

Recommended approach:

- acknowledge continuity without overstating familiarity;
- prioritise easy reorder, updated routine guidance or a useful product change;
- use prior purchase cadence to shape timing;
- consider a policy-approved incentive only after relevance has been tested.

### High-value or VIP customer

Do not simply increase discount depth.

Recommended approach:

- use higher-touch service;
- offer early access, expert guidance or personal assistance where operationally real;
- route unresolved issues to support before marketing;
- coordinate with the VIP and loyalty framework when active.

### Product-specific lapse

When one product family drove prior purchase behaviour:

- reference the relevant product or routine;
- validate that the product and variant still exist;
- provide a successor or adjustment path if the range changed;
- avoid implying the customer is running low unless a replenishment model supports that claim.

### Category or routine lapse

When purchase history spans several products:

- return to the customer’s broader goal;
- use shade match, routine builder or category guidance;
- do not force one product because it has the highest historical order value.

### Complaint, refund or service-risk customer

Do not enter or continue standard win-back while an unresolved issue exists.

Transfer to service ownership until the issue is resolved and a cooling-off period has passed. A resolution does not automatically restore marketing eligibility.

## Behavioural reactions during the sequence

### Product view

A meaningful product view may update the active content context. Do not create a separate browse-abandonment flow while win-back owns the contact unless the browse signal becomes clearly more specific and the orchestration rules transfer ownership.

### Shade match started

Pause generic win-back content. If the shade match is completed and a valid recommendation exists, transfer to shade-match follow-up.

### Item added to cart

Exit win-back and transfer to cart abandonment when eligible.

### Checkout started

Exit win-back and transfer to checkout recovery or transactional checkout logic.

### Purchase completed

Exit immediately and transfer to post-purchase education. Reset lapse calculations from the new qualifying purchase.

### Preference updated

Apply the change before any further send. Frequency reductions, pause requests and category preferences must be respected across all flows.

### Reply received

Route inbound replies by intent:

- product or shade question → customer support or expert guidance;
- order issue → service queue;
- unsubscribe request → immediate suppression;
- complaint → complaint handling and marketing pause;
- positive purchase intent → assist without manually forcing another automated message.

## Offer branching

Incentives are not a default state.

Eligibility may depend on:

- approved commercial policy;
- lapse duration;
- prior order and discount history;
- margin and product exclusions;
- jurisdiction;
- existing offers already available to the customer;
- holdout assignment.

Never show an incentive that is invalid, expired, unavailable in the customer’s market or inconsistent with current cart pricing.

Customers who routinely purchase only after discounts should not automatically receive ever-increasing offers.

## Product-state branches

### Product available

Use current approved image, name, variant, price and URL.

### Variant unavailable

Offer a switch only when the relationship is clear and safe. Otherwise route to the product family or shade match.

### Product discontinued

Explain the replacement plainly. Do not pretend the old product is temporarily unavailable.

### Price changed

Use current validated price. Do not compare against an old order price unless the comparison is intentionally approved and contextually fair.

### No safe recommendation

Use a guidance-led return path or suppress the product module.

## Flow ownership hierarchy

Default priority:

1. Transactional and service communication
2. Active complaint, return, refund or safety handling
3. Checkout recovery
4. Cart abandonment
5. Post-purchase education
6. Shade-match follow-up
7. Replenishment when the timing model is more specific
8. Win-back
9. Browse abandonment
10. Welcome and general campaign messaging

Only one behavioural lifecycle flow should own the contact at a time.

## Sequence completion states

Use explicit completion reasons:

- reactivated by purchase;
- transferred to cart;
- transferred to checkout;
- transferred to shade match;
- transferred to support;
- preference pause;
- unsubscribed;
- suppressed by provider;
- sequence completed without reactivation;
- data-invalidated;
- product-invalidated;
- expired.

These reasons should be available for reporting and future eligibility decisions.

## Re-entry policy

A contact should not re-enter win-back immediately after completion.

Require:

- a new qualifying lapse period;
- no unresolved service state;
- valid marketing consent;
- compliance with global contact-pressure and cooling-off policies;
- materially new eligibility rather than repeated inactivity from the same unchanged state.

Repeated non-response should progressively reduce message frequency rather than trigger endless win-back cycles.