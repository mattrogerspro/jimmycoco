# Full Cart

## Purpose

The full cart gives customers a clear, editable review of their intended purchase before checkout.

## Desktop architecture

Use a restrained two-column layout:

- left: cart contents and item controls;
- right: sticky order summary and checkout action.

The page must feel calm and editorial, but not spacious to the point that products and totals become disconnected.

## Page hierarchy

1. Page title and item count
2. Cart lines
3. Delivery-threshold status
4. Order summary
5. Checkout CTA
6. Payment reassurance
7. Optional routine completion

## Cart lines

Each line must include:

- product image;
- complete product title;
- selected shade or variant;
- size or volume;
- price;
- quantity stepper or selector;
- line total where quantities exceed one;
- edit route when variant changes are supported;
- remove action.

Do not hide critical attributes behind a generic Edit link.

## Order summary

Show explicit rows for:

- subtotal;
- discount, when applied;
- delivery status or estimate;
- taxes where required;
- final total.

The final total must have the strongest numerical emphasis.

Primary CTA:

**CHECKOUT SECURELY**

Supporting reassurance may include accepted payment methods, secure-payment language and a concise returns summary, but only when accurate.

## Promotion code

Keep the promotion-code field collapsed behind a clear text control unless promotional codes are a dominant business requirement.

When expanded:

- use a visible label;
- preserve the entered code after failure;
- explain why a code is invalid or ineligible;
- show the exact saving after success;
- allow removal.

Do not visually punish customers who do not have a code.

## Empty cart

The empty state should contain:

- clear message: **Your bag is empty**;
- one short reassurance or guidance sentence;
- primary route to best sellers;
- secondary route to shade matching;
- no large field of generic recommended products.

## Removed-item behaviour

Prefer inline removal with a temporary Undo action. Do not trigger a full-page reload.

## Persistent summary

On desktop, the order summary may remain sticky while items scroll, provided it never overlaps the footer or traps keyboard focus.

## Visual direction

- White or warm ivory base
- Editorial serif used sparingly for the page title
- Refined sans-serif for all operational content
- Clear rules instead of multiple floating cards
- Accurate product imagery
- Matte-black primary CTA
- No oversized lifestyle photography

## Accessibility

- Quantity controls need accessible names.
- Remove actions must identify the product.
- Dynamic totals require polite live announcements.
- Strike-through pricing must retain a readable current price.
- Sticky content must not obscure focused controls.

## Success criteria

The customer can review, edit and understand the total without calculation, ambiguity or visual distraction.