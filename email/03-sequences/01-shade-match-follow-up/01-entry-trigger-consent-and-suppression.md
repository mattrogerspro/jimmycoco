# 01 — Entry Trigger, Consent and Suppression

## Eligibility

A customer may enter when all of the following are true:

- `shade_match.completed` has a valid result ID;
- at least one deliverable email address is associated with the result;
- the application has a lawful basis and recorded permission for the intended marketing message;
- the customer has not purchased a resolving product since completion;
- the recommended variant is currently purchasable or an approved substitute exists;
- no newer shade-match result supersedes this one.

## Consent capture

Completing the shade match must not silently create marketing consent. Store separately:

- result ownership/contact email;
- marketing consent status;
- consent timestamp;
- consent source and form version;
- jurisdiction or market;
- proof of wording shown at capture.

A customer may receive a requested result-delivery email where legally permitted without being enrolled into the full marketing sequence. The application must distinguish requested service delivery from promotional follow-up.

## Trigger payload minimum

- customer ID or anonymous profile ID;
- email address;
- shade-match result ID and version;
- recommended product ID;
- recommended variant ID;
- desired depth;
- preferred format;
- development-time preference;
- answers explicitly supplied by the customer;
- completion timestamp;
- locale, currency and market;
- consent state.

Do not infer missing personal attributes from names, imagery, browsing behaviour or demographic assumptions.

## Global suppression checks

Before enqueue and again before send, check:

- unsubscribe status;
- hard bounce, complaint or provider suppression;
- internal do-not-contact status;
- purchase resolution;
- active cart/checkout flow priority;
- invalid or deleted result;
- stock and market availability;
- contact-frequency cap;
- legal-market restrictions.

## Duplicate prevention

Use the result ID as part of sequence identity. A single result may start no more than one active sequence instance per recipient.

Suggested key:

`shade-match-follow-up:{recipient_id}:{result_id}:v1`

Retries must use the same idempotency key for the same scheduled message.

## Re-entry

A customer may re-enter only when they complete a materially new shade match. The newest result terminates previous active instances.

## Uncertain answers

When the customer chose “Not sure,” the sequence must acknowledge uncertainty and offer a safe review or retake route. It must not transform an uncertain input into a confident personalised claim.

## Support route

Every message should include a low-emphasis support path for customers who believe the result is wrong, cannot choose between variants or need accessibility help.