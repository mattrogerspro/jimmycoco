# Post-Purchase Education — Sequence Architecture

## Purpose

Turn a completed order into a confident first use and a stronger long-term relationship.

The sequence should reduce preventable application errors, clarify timing and expectations, direct customers to support when needed and create the conditions for a genuinely earned repeat purchase.

## Default journey

1. **Order confidence and next steps** — immediate reassurance after purchase.
2. **Preparation** — sent before likely use.
3. **Application** — product-specific instructions near delivery.
4. **Development and first result** — what to expect during and after development.
5. **Aftercare** — prolong colour and support an even fade.
6. **Review, support and next step** — ask for feedback only when the customer has had enough time to use the product.

## Default timing

Timing must follow fulfilment and delivery events where available.

- **Email 1:** immediately after order confirmation, separate from the transactional receipt
- **Email 2:** after dispatch or 1–2 days before expected delivery
- **Email 3:** on confirmed delivery or estimated delivery day
- **Email 4:** based on product development time, usually 1–3 days after delivery
- **Email 5:** approximately 5–7 days after delivery or use
- **Email 6:** approximately 10–14 days after delivery, only when no service issue is active

If reliable fulfilment events are unavailable, use conservative estimated timing and clearly avoid implying confirmed delivery.

## Product-state model

The sequence must branch by actual purchased use case, including:

- face product;
- body product;
- contour product;
- mousse, soufflé, gradual or other format;
- professional solution;
- application tool only;
- multi-product routine;
- first order versus repeat order.

A generic application message must not override product-specific instructions.

## Order-state model

Supported states:

- `order_confirmed`
- `processing`
- `dispatched`
- `in_transit`
- `delivered`
- `delivery_delayed`
- `delivery_failed`
- `cancelled`
- `refunded`
- `partially_refunded`
- `returned`
- `support_open`

Education timing must respond to these states rather than run on a blind fixed schedule.

## Flow priority

Default ownership order:

1. transactional order and service messages;
2. active support, delivery-failure, cancellation or refund communication;
3. post-purchase education;
4. replenishment;
5. win-back and general campaigns.

Post-purchase education suppresses browse, shade-match and cart-abandonment messages for the purchased items.

## Immediate pause or exit conditions

Pause or exit when:

- the order is cancelled before fulfilment;
- all relevant products are refunded or returned;
- delivery fails or is materially delayed;
- a support case is opened;
- the contact withdraws marketing consent where the education is classified as marketing;
- the address becomes suppressed;
- required product instructions are missing or unapproved;
- the sequence reaches completion.

A support case may pause the sequence without deleting state. Resume only after resolution and only when the remaining guidance is still timely.

## Commercial restraint

Cross-sell is not the purpose of the early sequence. Accessories or routine additions may appear only when they directly improve use of the purchased item and the customer has not already bought them.

Discounts are not part of the default flow.

## Success definition

The sequence succeeds when it improves:

- successful first use;
- educational content engagement;
- reduced avoidable support contacts;
- lower preventable returns or dissatisfaction;
- stronger product confidence;
- verified review quality;
- healthy repeat purchase over an appropriate time window.

Revenue alone is not sufficient evidence of a good post-purchase experience.