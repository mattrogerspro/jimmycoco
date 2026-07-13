# Cart Abandonment — Entry Trigger, Consent and Suppression

## Purpose

Define when a cart qualifies for recovery, how contact identity is established and when messaging must be blocked, paused or transferred.

## Entry requirements

A cart may enter only when all required conditions are true:

- a stable cart ID exists;
- at least one line item is recoverable;
- the customer can be linked to a valid email address through an account, checkout field, consented session or another approved first-party method;
- the applicable consent or lawful-basis requirement is satisfied;
- no completed order is linked to the cart;
- no higher-priority checkout-recovery state exists;
- the cart has been inactive for the approved delay;
- a valid recovery URL or secure token can be generated;
- the contact and address are not suppressed.

## Minimum cart data

Required fields include:

- cart ID and revision;
- contact ID and email;
- market, currency and locale;
- line-item IDs;
- product and variant IDs;
- quantity;
- current unit price;
- current subtotal;
- applied discount identifiers;
- stock state;
- recovery URL or token expiry;
- created, updated and last-activity timestamps.

Do not send when essential cart identity or commercial data is missing.

## Consent and permissions

Check permission at entry and immediately before every send.

Do not assume that transactional permission automatically authorises promotional recovery content. The implementation must follow the approved consent policy for each jurisdiction and distinguish service messages from marketing messages.

Store consent source, timestamp, form or policy version and current suppression state.

## Cart inactivity

A cart becomes eligible only after meaningful inactivity. The inactivity timer should restart when the customer:

- adds or removes an item;
- changes quantity or variant;
- applies or removes a discount;
- returns to the cart;
- begins checkout;
- updates delivery or payment details.

Do not send while the customer is actively shopping or checking out.

## Immediate suppression and exit

Stop or suppress when:

- purchase completes;
- checkout recovery owns the state;
- cart becomes empty;
- consent is withdrawn where required;
- the email hard-bounces or generates a complaint;
- the cart or recovery token expires;
- all items are unavailable;
- a fraud, payment-risk or account-security state requires separate handling;
- the contact exceeds global pressure limits;
- the sequence reaches its final send.

## Temporary pause

Pause and revalidate when:

- cart inventory is changing;
- price or promotion data cannot be confirmed;
- a product feed or checkout service is unavailable;
- the contact is inside quiet hours;
- another priority communication is pending;
- the recovery URL cannot be validated;
- a recent checkout event may not yet have reconciled.

Do not release a paused message from a stale render.

## Product availability

If one line item becomes unavailable:

- update the cart state;
- show only recoverable items;
- explain removal only when the website and email can do so accurately;
- avoid substituting a different product without explicit merchandising rules.

If all items are unavailable, suppress cart recovery and consider a separately consented availability or alternative-product flow.

## Pre-send gate

Immediately before each send confirm:

- no order has completed;
- no active checkout session supersedes the cart flow;
- consent and suppression state remain valid;
- cart revision is current;
- product names, variants, quantities, prices and discounts are current;
- currency and market are correct;
- stock is recoverable;
- delivery and returns wording is valid for the market;
- recovery URL resolves and has not expired;
- the idempotency key has not been used.

Failure of any essential check must block the send.