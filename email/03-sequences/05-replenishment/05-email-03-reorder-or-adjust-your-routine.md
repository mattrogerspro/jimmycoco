# Email 03 — Reorder or Adjust Your Routine

## Role

Close the replenishment sequence by giving the customer control: reorder the same product, adjust the product or variant, retake shade match, or delay future reminders.

The final email must not create false urgency. Its purpose is to make the next decision easy.

## Default timing

Send near the end of the estimated replenishment window, after Email 02, only when the customer remains eligible and no newer order has reset the sequence.

## Primary objective

Convert an appropriate repeat purchase while protecting trust when the original product or routine no longer fits.

## Message hierarchy

1. Flexible decision headline
2. Current product or routine context
3. Three clear paths: reorder, adjust, or wait
4. One visually dominant CTA based on the strongest reliable state
5. Reminder-preference control

## Reorder route

Use when:

- the original product and variant remain available;
- prior repeat behaviour supports the same-product path;
- no evidence suggests dissatisfaction or a support issue.

Show the verified current product, variant, price, currency and availability. CTA: `Reorder the same product`.

## Adjust route

Use when:

- the customer viewed alternatives;
- the previous product was discontinued or unavailable;
- the customer’s shade-match result has changed;
- a season, finish or format preference was explicitly updated;
- support or returns data indicates the same product should not be pushed.

Provide an approved comparison or route to shade match. Never silently switch variants.

## Wait route

Every customer should have a low-friction way to delay or reduce reminders.

Suitable controls:

- remind me later;
- pause this product reminder;
- change reminder frequency;
- stop replenishment reminders while remaining subscribed to other marketing.

Preference changes must be persisted immediately and reflected before any future send.

## Subject-line territories

- Ready to replenish—or change things up?
- Your routine, your timing
- Reorder the same or find a better fit
- Keep, switch or wait

Avoid final-warning, expiration or scarcity language unless a real, approved commercial condition exists.

## Product and routine recommendations

Recommendations must be based on explicit product relationships, shade-match data or verified customer behaviour. Do not use generic cross-sell products simply to increase order value.

At most one alternative path should be visually prominent. Additional options should remain secondary.

## Incentive policy

No incentive is required by default. Where an approved retention incentive exists:

- validate eligibility immediately before send;
- state terms clearly;
- protect margin;
- do not imply the offer is universal;
- suppress the incentive when the customer already repurchased;
- ensure the discount is applied safely at checkout.

## Asset rules

Product, customer and celebrity imagery must use approved source assets without generative alteration. Product labels, packaging and colour must remain accurate.

## Pre-send validation

Confirm:

- current consent and suppression state;
- current product and variant;
- stock, price and currency;
- replacement or comparison relationship;
- shade-match recommendation validity;
- no newer order or substitute purchase;
- active preference state;
- URL and discount validity;
- idempotency key uniqueness.

## Sequence completion

After this message:

- mark the replenishment attempt complete;
- record the result and selected preference;
- do not restart until a new qualifying purchase or approved customer action creates a new cycle;
- preserve learning signals without treating non-purchase as proof of disinterest.

## Success criteria

Measure repurchase, product-switch conversion, shade-match completion, reminder-delay selection, preference management, margin and long-term repeat rate. The sequence succeeds when it creates appropriate repeat behaviour without increasing fatigue.