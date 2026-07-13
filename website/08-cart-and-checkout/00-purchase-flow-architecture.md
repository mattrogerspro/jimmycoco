# Purchase Flow Architecture

## Purpose

Define one coherent path from product selection to confirmed order without sacrificing the calm, premium character of Sunless.

## Commercial objective

Increase completed purchases by reducing uncertainty around product selection, delivery, payment and what happens after checkout.

## Approved journey

1. Customer selects a valid product and variant.
2. Add to Bag gives immediate visual confirmation.
3. Mini-cart confirms product, shade, quantity and price.
4. Customer may continue shopping or proceed directly to checkout.
5. Full cart is available for considered review and edits.
6. Checkout captures contact, delivery and payment details with minimal interruption.
7. Payment processing communicates progress clearly and prevents duplicate submission.
8. Confirmation reassures the customer that the order was received and explains next steps.

## Experience principles

### Preserve momentum

Never force an unnecessary page transition after Add to Bag. The mini-cart should provide confirmation and an obvious checkout route while allowing the customer to continue browsing.

### Keep costs legible

Show product subtotal, discounts, delivery status and order total using explicit labels. Do not reveal unavoidable charges only at the final payment step.

### Preserve product certainty

Every cart representation must show:

- accurate product image;
- complete product name;
- selected shade or variant;
- size or volume where relevant;
- quantity;
- unit price;
- line total;
- stock or dispatch warning when relevant.

### Reduce decision burden

Do not repeat the full product page inside the cart. Use one-line suitability reassurance only when it genuinely helps identify the chosen item.

### Protect commitment

Once checkout begins, remove broad promotional navigation. Retain only the logo, secure-checkout cue, support route and a safe path back to the cart.

## Flow states

The system must define:

- cart empty;
- item added;
- item updated;
- item removed with undo;
- invalid or unavailable variant;
- quantity limit reached;
- promotion applied;
- promotion rejected;
- delivery threshold reached;
- delivery threshold not reached;
- payment processing;
- payment declined;
- payment authentication required;
- order confirmed;
- duplicate-submission prevention;
- session expired;
- inventory changed during checkout.

## Trust placement

Trust information should appear at the moment it resolves a concern:

- delivery estimate near delivery method;
- returns summary near checkout commitment;
- secure-payment cue near payment entry;
- support route near errors;
- order reference and confirmation email message after payment.

Avoid decorative trust-badge walls.

## Checkout hierarchy

The dominant hierarchy is:

1. current step;
2. required action;
3. order summary and total;
4. reassurance and support;
5. secondary editing controls.

## Data persistence

Preserve cart contents, selected variants and entered checkout details where legally and technically appropriate. Returning to the cart must not destroy valid form progress without warning.

## Accessibility

- All actions must be keyboard operable.
- Status changes must be announced to assistive technology.
- Errors must identify the field, explain the problem and describe how to fix it.
- Do not rely on colour alone for success or failure.
- Focus must move predictably when drawers, dialogs or error summaries appear.

## Success criteria

The flow succeeds when customers always know:

- what they selected;
- what it costs;
- when it should arrive;
- what action is required;
- whether payment is processing;
- and whether the order succeeded.