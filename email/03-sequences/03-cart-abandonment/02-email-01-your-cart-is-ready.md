# Email 01 — Your Cart Is Ready

## Role

Restore the customer’s live cart quickly and accurately while purchase intent is still recent.

## Default timing

Send approximately 1–2 hours after qualifying inactivity, subject to local time, consent, suppression and checkout-state checks.

## Primary objective

Return the customer directly to the current cart or secure checkout recovery state.

## Message hierarchy

1. Calm reminder headline
2. Current cart contents
3. Current subtotal and applied discount, when verified
4. One primary recovery CTA
5. Concise delivery, returns or support reassurance

## Subject-line territories

- Your Sunless cart is ready
- Continue with your Sunless routine
- Your selected products are still here
- Ready when you are

Avoid false reservation language such as “We saved these for you” unless inventory is genuinely reserved.

## Cart module

For every recoverable line item show:

- approved product image;
- product name;
- selected variant or shade;
- quantity;
- current unit or line price;
- any valid applied discount.

Do not add unrelated recommendations in the first message. The customer’s chosen cart is the focus.

## CTA

Use one dominant action:

- `Return to my cart`
- `Continue checkout`

The URL must restore the correct current cart securely. Do not route to a generic shop page.

## Supporting reassurance

Use no more than one or two concise, market-valid points, such as:

- delivery timing or threshold;
- returns policy;
- secure checkout;
- customer-support route.

Do not display policy statements that have not been validated for the customer’s location.

## Copy tone

Direct, composed and helpful. No guilt, countdown, false scarcity or unapproved incentive.

## Visual structure

1. Header
2. Short headline and introduction
3. Live cart module
4. Primary CTA
5. Compact reassurance strip
6. Footer

Make the CTA and essential cart details visible early on mobile.

## Required fallbacks

If one item is unavailable, rebuild from the live cart and show the remaining recoverable items. If no items remain, suppress the email.

If a price, currency, variant or recovery URL cannot be validated, block the send rather than displaying a stale snapshot.

## Success and handoff

Primary success is restored cart or checkout activity. Purchase exits immediately to order confirmation and post-purchase logic. Checkout activity may transfer ownership to checkout recovery if that system is implemented separately.