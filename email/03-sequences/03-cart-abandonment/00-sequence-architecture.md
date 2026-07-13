# Cart Abandonment — Sequence Architecture

## Purpose

Recover genuine purchase intent by restoring the customer’s current cart, resolving friction and reinforcing confidence in the exact products and variants they selected.

Cart abandonment is more commercially direct than browse abandonment, but it must still remain calm, accurate and service-led.

## Default cadence

- **Email 1:** approximately 1–2 hours after cart inactivity
- **Email 2:** approximately 20–24 hours later
- **Email 3:** approximately 48 hours after entry
- **Email 4:** approximately 4 days after entry

Apply local-time, quiet-hour and global contact-pressure rules. A renewed cart or checkout event should reset or update state rather than create duplicate enrolments.

## Message progression

1. **Restore:** show the current cart and return the customer directly to it.
2. **Reassure:** answer delivery, returns, suitability and application concerns.
3. **Prove:** connect cart products to credible results, reviews or routine guidance.
4. **Close:** provide one final accurate return path without fake urgency.

## Flow ownership

Use this default priority:

1. Transactional and service communications
2. Active checkout recovery
3. Cart abandonment
4. Post-purchase messaging
5. Shade-match follow-up
6. Browse abandonment
7. Welcome and general campaigns

Only one cart-recovery sequence may be active per cart and contact.

## Entry state

The system needs:

- stable cart ID;
- known contact or approved address capture;
- valid consent or other lawful basis appropriate to the implementation and jurisdiction;
- at least one recoverable line item;
- current cart URL or secure recovery token;
- no completed order linked to the cart;
- no active checkout recovery with higher ownership.

## Immediate exit conditions

Exit when:

- the linked order is completed;
- the cart becomes empty;
- checkout recovery takes ownership;
- consent is withdrawn where marketing consent is required;
- the address is suppressed, bounced or complaint-blocked;
- all cart items become unavailable and no honest recovery path remains;
- the final message is sent;
- the cart expires or its recovery token becomes invalid.

## Cart mutation rules

Before every send, rebuild the message from the live cart state. Update:

- products and quantities;
- selected variants;
- prices and currency;
- discounts already applied;
- stock status;
- subtotal;
- delivery messaging;
- destination URL.

Never preserve an earlier snapshot when it conflicts with the live cart.

## Incentive policy

Do not introduce a discount by default. First resolve friction through clarity, proof, delivery and returns reassurance.

Any incentive must be:

- permitted by an approved commercial policy;
- customer- and market-eligible;
- time-valid at render and checkout;
- excluded from misleading countdowns;
- prevented from stacking incorrectly;
- measured against a holdout group and margin impact.

## Frequency controls

- Maximum one active sequence per cart.
- New cart activity updates the existing sequence.
- A materially new cart after the prior sequence ends may qualify under the approved cooldown policy.
- Do not send more than one behavioural recovery message in a day.
- Suppress lower-priority campaign sends when the cart sequence owns the contact.