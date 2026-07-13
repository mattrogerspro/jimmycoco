# Cart Abandonment — Branching, Cart State and Handoffs

## Purpose

Define how the sequence responds to cart changes, checkout activity, purchases, availability shifts and overlapping lifecycle flows.

## Cart as source of truth

The active cart record, not the original enrolment snapshot, determines every message.

Before each send, compare the current cart revision with the last processed revision. If the cart changed, rebuild the message and re-evaluate eligibility.

## Core state model

Recommended states:

- `eligible`
- `waiting`
- `active`
- `paused`
- `checkout_handoff`
- `purchased`
- `suppressed`
- `expired`
- `completed`

Store the state reason and timestamp for every transition.

## Cart mutation branches

### Item added

Update the current sequence. Do not create a second enrolment. Restart the inactivity timer when appropriate.

### Item removed

Remove it from future emails. If the cart becomes empty, exit as `expired` or `suppressed_empty_cart`.

### Quantity or variant changed

Refresh all commercial data and restart inactivity timing if the customer is actively engaging.

### Discount applied or removed

Display only the live discount state. Never preserve an expired or removed offer from an earlier render.

### Currency or market changed

Revalidate product availability, price, shipping, tax display, returns language and URLs for the new market.

## Checkout handoff

When checkout begins:

- pause cart-abandonment sends immediately;
- transfer ownership to checkout recovery if implemented;
- preserve the cart and checkout identifiers;
- prevent both flows from sending for the same inactivity period;
- return ownership only if the checkout state expires and the approved policy permits it.

## Purchase handoff

A completed order linked to the cart or contact must:

- cancel all queued cart emails;
- mark the sequence `purchased`;
- record the order ID and completion time;
- enter transactional order-confirmation logic;
- begin post-purchase education only under its own rules.

Use order events rather than email-link attribution alone to determine purchase state.

## Shade-match branch

When the cart contains a product and variant selected from a valid shade-match result, the sequence may use that explanation as supporting context.

If the customer retakes the shade match and receives a different recommendation:

- do not silently replace the cart;
- preserve the live cart;
- offer a clear route to review the updated recommendation;
- avoid calling the old cart selection the customer’s current match.

## Stock branches

- **All items available:** continue normally.
- **Some items unavailable:** rebuild around available items and clearly avoid claiming the removed products remain in the cart.
- **All items unavailable:** suppress recovery.
- **Low stock:** use stock language only when based on reliable current inventory and approved wording.

## Support branch

When a customer replies or opens a support case:

- pause automated recovery when the issue may affect purchase confidence;
- surface cart context to the support team without exposing sensitive payment data;
- resume only after resolution and fresh eligibility validation.

## Contact-pressure handoff

Transactional and service messages always retain priority. Campaigns, welcome emails, browse abandonment and shade-match reminders should be suppressed or delayed while cart recovery owns the contact.

## Race-condition controls

- Use event timestamps and monotonic cart revisions.
- Recheck purchase and checkout state immediately before provider submission.
- Cancel scheduled sends when a newer state event arrives.
- Deduplicate repeated platform and Resend webhooks.
- Never assume webhook arrival order equals event order.

## Audit requirements

For each send or suppression, record:

- contact ID;
- cart ID and revision;
- sequence and message ID;
- state before and after;
- eligibility result;
- suppression or handoff reason;
- rendered commercial snapshot;
- Resend message ID when sent;
- idempotency key;
- timestamp.