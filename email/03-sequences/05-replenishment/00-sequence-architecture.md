# Replenishment — Sequence Architecture

## Purpose

Help customers maintain their preferred Sunless routine by reminding them at a reasonable estimated point to reorder, adjust or replace a product.

The sequence is retention-led, but customer utility comes first. It should reduce the inconvenience of running out while avoiding false certainty, artificial urgency or repetitive messaging.

## Eligible customer states

A customer may become eligible when:

- a fulfilled order contains a product with an approved replenishment model;
- the order is not cancelled, fully refunded or replaced by a newer purchase of the same need;
- sufficient time has passed from delivery or first expected use;
- the customer has valid marketing consent;
- no service, support or higher-priority lifecycle state should suppress the send;
- the product or a safe approved alternative remains available.

## Sequence progression

1. **Estimated low-stock reminder** — make reordering easy without asserting that the product is definitely nearly empty.
2. **Routine continuity** — explain how the product fits into the customer’s next application and surface useful accessories only when relevant.
3. **Reorder or adjust** — provide a final path to reorder, change format, retake shade match or pause future reminders.

## Default cadence

Timing is relative to the product-level estimated depletion date:

- **Email 1:** near the start of the expected low-stock window;
- **Email 2:** approximately 5–10 days later if no purchase;
- **Email 3:** approximately 10–21 days after Email 2, depending on product type and confidence.

The model must define actual timing by SKU or product family. A single universal interval is not acceptable.

## Flow ownership priority

Use the following default priority:

1. Transactional and service communications
2. Active support, refund, return or replacement handling
3. Checkout recovery
4. Cart abandonment
5. Immediate post-purchase education
6. Replenishment
7. Win-back, welcome and general campaigns

A new purchase of the relevant product immediately resets or exits replenishment.

## Immediate exit conditions

Exit when:

- the customer purchases the same replenishment need;
- marketing consent is withdrawn;
- the address is suppressed or undeliverable;
- the original order is fully refunded or invalidated;
- a support case indicates dissatisfaction, reaction, damage or incorrect product;
- the customer requests that reminders stop or be delayed;
- the target item and all approved alternatives are unavailable;
- the final message is sent.

## Pause conditions

Pause when:

- the customer has an active cart or checkout containing the relevant product;
- a higher-priority behavioural message is pending;
- product data, stock, price or destination URL fails validation;
- quiet-hour or contact-pressure rules prevent the send;
- the customer has a relevant unresolved service case.

## Multi-product orders

Do not start a separate overlapping sequence for every consumable item.

Group products by replenishment need and expected window. Select one primary need using:

1. confidence in the timing model;
2. likelihood of routine interruption;
3. customer purchase history;
4. commercial availability;
5. current active flow ownership.

When two products are normally used together and share a similar window, they may appear as one routine reminder. Otherwise, stagger reminders and obey global pressure limits.

## Subscription boundary

Replenishment is not a substitute for subscription management.

Customers with an active subscription should receive subscription-specific service messaging instead of generic reorder reminders unless the product is not covered by the subscription.

## Incentive policy

Do not add a discount by default. First test whether timing, convenience, education and a direct reorder path are sufficient.

Any incentive must be:

- explicitly approved;
- margin-aware;
- consistent across eligible cohorts;
- validated at send time;
- excluded when the customer already has a better active offer;
- measured incrementally rather than credited solely by last-click revenue.