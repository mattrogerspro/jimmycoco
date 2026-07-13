# Replenishment — Branching, Product State and Handoffs

## Purpose

Define how the replenishment sequence adapts to product type, purchase history, order state, stock state, customer behaviour and competing lifecycle journeys.

The flow must never assume that a customer is definitely running out. It should use the best available evidence, communicate uncertainty honestly and hand control to a more appropriate flow whenever the customer’s state changes.

## Primary state model

Each active replenishment record should track:

- contact ID;
- order ID and line-item ID that created the replenishment clock;
- product and variant ID;
- quantity purchased;
- purchase date and fulfilment date;
- estimated usage window;
- estimated reminder window;
- confidence level;
- sequence status;
- latest qualifying customer action;
- next scheduled message;
- suppression reason when applicable.

## Confidence tiers

### High confidence

Use when:

- the same product has been repurchased at least twice;
- previous repurchase intervals are reasonably consistent;
- no newer purchase has reset the clock;
- the product is a clearly consumable item;
- the customer has not indicated reduced use.

High confidence permits a more direct reminder, but wording must still remain probabilistic.

### Medium confidence

Use when:

- the product is consumable;
- one prior purchase or one observable repurchase interval exists;
- the estimated usage model is supported by product quantity and normal use;
- no contradictory behaviour is present.

Use language such as “You may be getting close” or “It could be time to check your supply.”

### Low confidence

Use when:

- this is the first purchase;
- usage frequency is unknown;
- quantity or intended use varies widely;
- the customer purchased multiple overlapping products;
- the item may be professional, occasional or seasonal.

Low-confidence contacts should receive either a later, softer reminder or no sequence at all.

## Product-type branches

### Core consumable self-tan

Examples include mousse, soufflé, face products and professional solution.

Branch logic should consider:

- pack size;
- likely number of applications;
- face-only versus body use;
- professional versus at-home use;
- purchased quantity;
- previous reorder interval.

### Tools and durable accessories

Brushes, mitts and similar tools should not use a standard consumable replenishment clock.

Possible routes:

- care and replacement guidance;
- condition-based replacement education;
- routine-completion messages;
- no replenishment sequence.

Do not imply that a durable tool needs replacing on a fixed schedule unless verified product guidance supports that claim.

### Multi-product orders

Choose one primary replenishment need using:

1. strongest model confidence;
2. shortest credible depletion window;
3. highest routine dependency;
4. highest likelihood that the item is genuinely consumable.

Do not send parallel replenishment flows for every line item in one order.

### Professional products

Professional-use replenishment must use a separate model from consumer use.

Where business usage data is unavailable, use conservative timing and avoid statements about exact remaining volume.

## Behavioural branches

### Customer reorders

On a confirmed new purchase of the same or successor item:

- terminate the current sequence immediately;
- record conversion attribution without relying only on last-click;
- reset the replenishment clock from the new eligible order;
- prevent duplicate enrolment from the old order.

### Customer changes variant

If the customer buys a different shade or format:

- exit the old product path;
- determine whether the new item starts a new replenishment model;
- do not continue recommending the obsolete variant.

### Customer browses but does not purchase

Relevant browsing may increase message usefulness but should not create pressure.

The active replenishment sequence may update its destination product or supporting content when:

- the browsing signal is recent and meaningful;
- the browsed product is a valid successor or alternative;
- no cart-abandonment flow takes ownership.

### Customer adds to cart

When the relevant product is added to cart:

- pause replenishment;
- transfer ownership to cart abandonment when eligible;
- do not send both flows on the same day;
- terminate replenishment after purchase.

If the cart later expires without purchase, do not automatically resume the old message schedule. Re-evaluate timing, contact pressure and product relevance.

### Customer retakes shade match

A new shade-match result supersedes any old shade assumption.

If the recommendation changes:

- stop recommending the old variant;
- transfer to shade-match follow-up when eligible;
- only begin a new replenishment clock after a later purchase.

### Customer delays reminders

Provide an approved preference action such as:

- remind me later;
- pause this product reminder;
- I use this less often;
- stop replenishment reminders.

The application should store this preference separately from global marketing consent.

## Product-state branches

### In stock

Use the exact current product and variant with live price, currency and URL validation.

### Low stock

Do not use scarcity language unless inventory data is reliable and the approved commercial policy permits it.

A low-stock state alone must not convert an estimated reminder into false urgency.

### Temporarily out of stock

Options in order:

1. pause until stock returns if the delay remains useful;
2. offer a verified equivalent or approved successor;
3. route to back-in-stock registration;
4. suppress when no responsible option exists.

### Discontinued product

Use only an approved successor relationship.

Explain the replacement clearly. Do not silently substitute a different product or imply that it is identical unless verified.

### Price or promotion change

Always use live validated price data.

Do not preserve an expired offer from an earlier scheduled render. Incentives must be governed by the approved promotion policy and must not be invented by the sequence.

## Customer-service and safety handoffs

Immediately pause promotional replenishment when the customer reports:

- adverse reaction;
- damaged or defective product;
- unresolved delivery issue;
- refund or return request;
- incorrect product or variant;
- application problem requiring support.

Create or update the relevant support state. Marketing must not continue as though the customer is simply due to reorder.

## Flow ownership priority

Use this default hierarchy:

1. Service, safety and transactional communication
2. Active checkout recovery
3. Active cart abandonment
4. Post-purchase support or education
5. Active shade-match follow-up
6. Replenishment
7. Browse abandonment
8. Welcome, win-back and general campaigns

Only one commercial behavioural flow should own the customer at a time.

## Sequence completion

Mark the sequence complete when:

- the customer repurchases;
- all approved messages are sent;
- the customer pauses or disables replenishment reminders;
- the product becomes permanently unavailable without a successor;
- consent is withdrawn;
- a support or safety state requires permanent suppression;
- the model confidence falls below the approved threshold.

## Re-entry rules

A customer may re-enter only from a new eligible purchase or an explicitly updated reminder preference.

Never restart from repeated page views alone, and never use the same order line to create multiple overlapping replenishment enrolments.