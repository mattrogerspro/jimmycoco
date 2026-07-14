# Idempotency, Retries, Rate Limits and Queues

## Purpose

Ensure that transient failures, duplicate events, worker restarts and provider limits cannot create duplicate messages or uncontrolled send pressure.

## Queue-first architecture

Eligible messages should enter a durable application-controlled queue before provider submission.

The queue item must reference:

- internal message ID;
- idempotency key;
- recipient;
- classification and stream;
- template version;
- scheduled or not-before time;
- priority;
- attempt count;
- current state;
- correlation ID.

## Idempotency key

Every logical message requires a stable idempotency key derived from business identity, not a random value created on each retry.

Examples:

- `welcome:{customer_id}:{programme_version}`;
- `order-confirmation:{order_id}:{event_version}`;
- `cart:{cart_id}:step:{step}:v{sequence_version}`;
- `vip:{customer_id}:{tier_transition_id}`.

The application must enforce uniqueness before and after the provider call.

## State model

Recommended send states:

- `PLANNED`;
- `QUEUED`;
- `VALIDATING`;
- `BLOCKED`;
- `SUBMITTING`;
- `ACCEPTED`;
- `FAILED_RETRYABLE`;
- `FAILED_FINAL`;
- `CANCELED`.

Provider delivery events are recorded separately from submission state.

## Last-moment validation

Immediately before submission, reconfirm:

- consent and suppression;
- lifecycle ownership;
- current recipient address;
- send window and frequency cap;
- template and asset approval;
- offer and product validity where applicable;
- no prior successful send for the idempotency key.

A queue record does not guarantee that the message remains eligible later.

## Retry policy

Retry only errors classified as transient, such as bounded network failures, provider availability failures or explicit rate limiting.

Do not retry automatically when:

- recipient eligibility fails;
- data or template validation fails;
- sender identity is invalid;
- request is rejected as malformed;
- a hard bounce or complaint already applies;
- the message has expired;
- a duplicate accepted submission may already exist and cannot be reconciled safely.

## Backoff

Use bounded exponential backoff with jitter. Define:

- maximum attempts;
- maximum elapsed retry window;
- stream-specific expiry;
- dead-letter behavior;
- operator alert threshold.

Order-critical service messages may justify different retry and escalation rules from promotional messages.

## Uncertain submission outcome

A timeout after request transmission may leave uncertainty about whether Resend accepted the message.

In this state:

1. do not create a new logical idempotency key;
2. check stored response and provider records where possible;
3. reconcile by correlation metadata;
4. retry only when duplicate protection is assured;
5. move unresolved cases to review rather than sending blindly.

## Rate limiting

Rate control must operate at multiple levels:

- provider account;
- sender domain or stream;
- environment;
- recipient;
- lifecycle sequence;
- campaign batch.

Provider limits are ceilings, not recommended sending rates.

## Priority

Suggested priority order:

1. security and account-critical;
2. order and fulfilment service;
3. customer-initiated shade or support response;
4. time-sensitive lifecycle;
5. routine lifecycle;
6. campaigns and bulk promotion.

Lower-priority sends must not delay critical service messages.

## Cancellation

Queued messages must remain cancelable when:

- the customer purchases;
- a cart or browse state changes;
- the recommendation becomes invalid;
- an offer expires;
- consent or preferences change;
- a complaint or bounce is received;
- a higher-priority lifecycle owner takes control.

## Dead-letter queue

Failed-final or repeatedly failing items must enter a reviewable dead-letter queue containing safe diagnostics, source event, attempts and ownership. Replaying an item must preserve its original logical identity.

## Metrics

Track:

- queue depth and oldest age;
- submission latency;
- accepted and failed requests;
- retries by reason;
- uncertain outcomes;
- duplicate prevention;
- cancellations before send;
- rate-limit responses;
- dead-letter volume;
- latency by message priority.

## Release blockers

Do not launch when:

- retries can create a second logical send;
- queues do not recheck eligibility;
- critical and bulk traffic cannot be separated;
- provider throttling causes uncontrolled failure;
- uncertain submission outcomes have no reconciliation path;
- dead-letter messages cannot be inspected and safely replayed.