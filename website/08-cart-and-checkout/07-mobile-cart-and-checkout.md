# Mobile Cart and Checkout

## Purpose

Define a mobile purchase flow that remains fast, legible and reassuring under limited screen space, touch input and intermittent connectivity.

## Mobile principles

- Preserve one dominant action per screen state.
- Keep totals and next-step actions visible without obscuring content.
- Minimise typing.
- Use native mobile capabilities where appropriate.
- Never make the customer hunt for selected shade, delivery cost or final total.

## Mini-cart

Use a full-height sheet or drawer with:

- clear Added to Bag confirmation;
- compact product summary;
- visible selected shade or variant;
- subtotal;
- full-width Checkout Securely CTA;
- quieter Continue Shopping action;
- optional one-item add-on below the checkout action.

The sheet must not be so tall that the close control or CTA becomes unreachable.

## Full cart

Use one-column cart lines. Product image and essential information should remain visually connected.

Recommended order per line:

1. Image
2. Product name
3. Variant and size
4. Price
5. Quantity control
6. Remove control

Use a sticky bottom checkout region only when it does not cover item controls, error messages or browser UI.

## Order summary

On checkout, use a collapsed summary at the top with:

- item count;
- final total;
- clear expand control.

Keep the payment total visible again immediately above the final payment CTA.

## Forms

- Use single-column fields.
- Apply correct input modes and autocomplete tokens.
- Avoid splitting names or addresses unnecessarily.
- Use address lookup with manual-entry fallback.
- Keep labels visible after input.
- Ensure the viewport scrolls the active field above the keyboard.
- Do not reset fields when the customer changes delivery method.

## Payment wallets

Where supported, surface accelerated wallet payment prominently without hiding standard card payment. Wallet branding and availability must be technically accurate.

## Sticky action behaviour

A sticky payment action may be used only when:

- the final total is visible;
- all required terms are accessible;
- field errors are not hidden;
- the keyboard does not cause overlap;
- safe-area insets are respected.

## Errors

Place field errors immediately beneath the relevant field and include a page-level summary after submission. Scroll and move focus to the first invalid field without trapping the customer at the top.

## Performance and resilience

- Reserve image dimensions to prevent layout shift.
- Prioritise cart data and actions over decorative assets.
- Handle slow payment responses with persistent processing feedback.
- Preserve cart and entered details after recoverable network failure.
- Prevent duplicate order submission.

## Touch targets

All interactive controls must meet the shared minimum target size. Quantity steppers, close controls, checkboxes and payment methods must remain usable with one hand.

## Visual direction

Mobile checkout should feel simpler than the desktop website, not like a compressed editorial page. Retain the warm neutral palette, typography pairing and matte-black CTA while removing non-essential decoration.

## Success criteria

A customer can complete the full journey on a small screen without horizontal scrolling, hidden totals, keyboard obstruction, accidental removal, lost data or uncertainty about payment status.