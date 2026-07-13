# 00 — Sequence Architecture

## Purpose

Convert completed shade-match intent into a confident first purchase by reminding the customer what was recommended, explaining why it fits, showing credible proof and reducing application anxiety.

## Entry event

Canonical event:

`shade_match.completed`

Required conditions:

- a recommendation was successfully produced;
- the customer is contactable under the relevant consent basis;
- no purchase containing the recommended product or equivalent has been completed;
- the recommendation has not expired or become invalid.

## Default cadence

| Email | Timing from completion | Purpose |
|---|---:|---|
| 1 | 15–30 minutes | Return the personal match while intent is fresh |
| 2 | Day 1 | Explain why the result suits the stated preferences |
| 3 | Day 3 | Remove application and usage uncertainty |
| 4 | Day 5 | Show relevant, verified results |
| 5 | Day 7 | Introduce the supporting routine without over-selling |
| 6 | Day 9 | Provide a final calm confidence reminder |

Do not send two messages from this flow on the same calendar day.

## Narrative progression

> Recognition → explanation → capability → proof → routine → decision

The sequence should feel like a continuation of the consultation, not repeated retargeting.

## Primary conversion

Purchase the recommended product with the correct variant preselected.

## Secondary conversions

- revisit the recommendation result;
- change or retake the shade match;
- view relevant customer results;
- learn the application method;
- ask for support.

## Global stop conditions

Stop immediately when:

- an order is completed containing the recommended product, a mapped substitute or a complete routine that resolves the same need;
- marketing consent is withdrawn;
- the address hard-bounces or is suppressed;
- the recommendation becomes unavailable with no approved substitute;
- the customer completes a newer shade match that supersedes the current result.

## Pause and handoff rules

- **Checkout started:** pause this flow and defer to checkout/cart recovery policy.
- **Product added to cart:** suppress generic recommendation CTAs and hand off to cart abandonment if eligible.
- **Product viewed repeatedly:** retain the flow, but prioritise product-specific proof rather than repeating the result.
- **Recommendation changed:** terminate the old instance and create a new sequence state from the latest result.
- **Purchase of another tanning product:** evaluate whether the need has been resolved before continuing.

## Frequency governance

This sequence must participate in the global marketing contact-pressure policy. Transactional and service messages remain separate. When another high-priority behavioural flow becomes active, the orchestration layer must select one customer-relevant message rather than allowing overlapping sends.

## Data freshness

Before every send, revalidate:

- product and variant availability;
- current price and currency;
- recommendation version;
- destination URL;
- consent and suppression state;
- recent cart, checkout and purchase activity;
- approved review and result assets.

## Tone

Calm, expert, specific and reassuring. Avoid false urgency, exaggerated certainty, generic glow language and repeated discount pressure.