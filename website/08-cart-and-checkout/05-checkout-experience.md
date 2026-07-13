# Checkout Experience

## Purpose

Convert an already-intentional customer with the least possible friction while preserving trust, clarity and brand quality.

## Architecture

Use a single-page or clearly stepped checkout with three logical groups:

1. Contact
2. Delivery
3. Payment

The order summary must remain visible or easily accessible throughout.

## Header

Use a reduced checkout header containing:

- Sunless logo;
- secure-checkout reassurance;
- support route;
- safe return-to-cart action.

Remove broad category navigation, promotional banners and distracting campaign messages.

## Guest checkout

Guest checkout should be the default path. Account creation may be offered after purchase or as an optional convenience, never as a forced prerequisite unless operationally unavoidable.

## Contact details

Request only the information required to fulfil and communicate the order.

- Email field first
- Clear purpose statement for order communication
- Marketing consent separate, optional and unchecked by default where required
- Phone number only when operationally necessary, with explanation

## Address entry

Support address lookup where available, but always provide manual entry.

Field principles:

- persistent visible labels;
- logical autocomplete attributes;
- correct keyboard type on mobile;
- no placeholder-only labels;
- clear optional markers;
- preserve input after validation failure.

## Delivery methods

Present available methods only after enough destination information is known. Show price and estimated timing together.

## Billing address

Default to “Same as delivery address” with a clear option to enter a different address.

## Payment

Present supported payment methods accurately. Payment entry must feel secure without relying on decorative security badges.

Use:

- clear card-field labels;
- wallet options where supported;
- concise explanation of when payment is taken;
- visible final total close to the payment action.

Primary payment CTA should use explicit language such as:

**PAY £XX.XX**

The amount must update accurately if the order changes.

## Validation

Validation must occur at useful moments, not after every keystroke.

Each error must:

- identify the field;
- explain the issue;
- retain entered data;
- provide recovery guidance;
- appear in an error summary when submission fails;
- move focus appropriately.

Do not use vague messages such as “Something went wrong.”

## Processing state

After payment submission:

- disable duplicate submission;
- preserve the button dimensions;
- show a clear processing message;
- explain that the customer should not refresh or close the page when relevant;
- support additional authentication cleanly;
- recover from timeout without creating duplicate orders.

## Payment failure

State that the order has not been completed unless known otherwise. Preserve the cart and valid checkout data. Offer a retry, alternative method and support route.

## Order summary

Show:

- item thumbnails;
- names and selected variants;
- quantities;
- subtotal;
- discounts;
- delivery;
- tax where relevant;
- final total.

Allow safe cart editing, but warn before leaving if payment processing has begun.

## Visual direction

- Bright white or warm ivory background
- Restrained serif for the checkout title only
- Operational content in refined sans-serif
- Clear input boundaries and focus states
- Matte-black payment CTA
- Minimal decorative imagery
- No heavy cards around every field group

## Accessibility and resilience

- Meet the website accessibility standards.
- Support keyboard-only checkout.
- Do not expire sessions unexpectedly.
- Warn before timeout and preserve recoverable information.
- Ensure browser zoom and text resize do not hide totals or actions.
- Provide status announcements for recalculation, errors and payment processing.

## Success criteria

The customer can complete checkout without creating an account, deciphering hidden costs, re-entering lost information or wondering whether payment succeeded.