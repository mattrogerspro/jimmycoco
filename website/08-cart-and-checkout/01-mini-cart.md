# Mini-Cart

## Role

The mini-cart is the immediate confirmation layer after Add to Bag. It must reassure the customer that the correct product was added and present checkout as the clearest next action.

## Behaviour

Open as a right-side drawer on desktop and a full-height bottom or side sheet on mobile. Do not navigate away from the current product or collection page.

The drawer must:

- receive focus when opened;
- prevent background interaction while active;
- close with a visible control, Escape key and safe backdrop action;
- return focus to the originating Add to Bag control;
- announce that the item was added;
- remain stable while product imagery loads.

## Header

Use a calm confirmation such as:

> Added to your bag

Avoid celebratory animations, confetti or aggressive urgency.

## Line-item content

Show:

- accurate thumbnail;
- product name;
- selected shade or variant;
- volume or size;
- unit price;
- quantity control;
- remove control;
- low-stock or dispatch note only when factual.

Variant selection errors must never be silently corrected.

## Commercial hierarchy

1. Confirmation message
2. Added product
3. Order subtotal
4. Primary checkout CTA
5. Continue-shopping action
6. Optional single add-on

Primary CTA:

**CHECKOUT SECURELY**

Secondary action:

**Continue Shopping**

## Delivery threshold

When a free-delivery threshold exists and is factually correct, show a restrained progress message:

> You are £X away from free delivery.

When reached:

> Your order qualifies for free delivery.

Do not use misleading progress bars or inflate the remaining amount.

## Cross-sell limit

Allow no more than one strongly relevant add-on in the mini-cart. Suitable examples include an application mitt for a tanning mousse or a preparation product missing from the routine.

The add-on must include a reason:

> Complete application with the Velvet Tanning Mitt.

It must not visually compete with checkout.

## Visual direction

- Warm ivory or clean white field
- Fine charcoal rules
- Strong typographic hierarchy
- Matte-black primary CTA
- Minimal shadow and restrained depth
- No card stack inside the drawer
- No promotional banner carousel

## Error and update states

Quantity and removal actions should update inline without closing the drawer. Show an undo opportunity after removal where technically possible.

If stock changes, explain exactly what changed and provide a recovery action.

## Success criteria

The customer can confirm the exact item, understand the current subtotal and begin checkout within a few seconds without losing their browsing context.