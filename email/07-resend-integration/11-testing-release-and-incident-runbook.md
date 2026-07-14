# Testing, Release and Incident Runbook

## Purpose

Define how the Resend integration is tested, released and operated safely across normal use and incidents.

## Test layers

### Unit tests

Cover:

- message-contract validation;
- sender selection;
- consent and suppression precedence;
- idempotency-key construction;
- retry classification;
- state transitions;
- webhook signature failure handling;
- duplicate and out-of-order event processing;
- link and environment routing;
- template and data-contract validation.

### Integration tests

Using non-production credentials and recipients, verify:

- provider acceptance;
- provider message ID storage;
- delivery-event ingestion;
- duplicate webhook handling;
- failed webhook replay;
- bounce and complaint consequences;
- unsubscribe synchronization;
- inbound reply routing;
- queue retries and cancellation;
- template and asset version recording.

### Render tests

Render approved templates for:

- required markets and currencies;
- missing optional fields;
- long content;
- product unavailability;
- mobile and desktop;
- images blocked;
- dark mode where relevant;
- HTML and plain-text parity.

### End-to-end tests

For representative sequence states:

1. create the source business event;
2. evaluate eligibility;
3. create a queue record;
4. submit through the adapter;
5. receive provider events;
6. update message history;
7. apply suppression or lifecycle consequences;
8. confirm analytics and support visibility.

## Test accounts and seeds

Maintain controlled test identities for:

- each market and locale;
- marketing consented and unsubscribed states;
- hard-bounce and complaint simulations where supported safely;
- VIP tiers and transitions;
- shade-match results;
- single and multi-item carts;
- order and fulfilment states;
- inbound support association;
- missing and malformed optional data.

Test identities must be clearly non-customer records.

## Release stages

1. Static configuration and secret review
2. Unit and contract test pass
3. Local or isolated adapter tests
4. Staging integration with allowlisted recipients
5. Seeded template and sequence tests
6. Webhook and reconciliation test
7. Small controlled production cohort
8. Review of delivery, complaints, support and queue health
9. Gradual expansion
10. Formal production sign-off

## Change classification

### Low risk

- internal observability improvements;
- non-breaking documentation;
- additional test coverage.

### Medium risk

- template or asset version changes;
- sender display-name changes;
- queue tuning;
- new lifecycle step using established contracts.

### High risk

- new domain or sender stream;
- authentication or DNS changes;
- webhook verification changes;
- consent or suppression logic changes;
- idempotency or retry changes;
- campaign-volume increase;
- provider project or credential migration;
- inbound attachment handling;
- MCP write access.

High-risk changes require explicit rollback and production approval.

## Rollback plan

Every release must define:

- previous adapter and template version;
- feature flag or traffic-disable mechanism;
- queue pause behavior;
- webhook compatibility during rollback;
- treatment of already accepted sends;
- migration and reconciliation steps;
- responsible owner and decision authority.

Never roll back by deleting historical message or event records.

## Incident categories

- provider API outage;
- queue backlog or processing failure;
- duplicate-send risk;
- incorrect audience or lifecycle send;
- domain-authentication failure;
- complaint or bounce spike;
- webhook failure or event loss;
- credential exposure;
- inbound-email abuse;
- broken links, pricing, terms or personalisation;
- asset-rights or celebrity-use withdrawal.

## Immediate response priorities

1. Protect customers from further incorrect sends.
2. Preserve account and order-critical communication where safe.
3. Pause affected queues, campaigns, templates or sender streams.
4. Preserve logs, payload references and configuration versions.
5. Identify scope and customer impact.
6. Correct the root cause.
7. Reconcile provider and internal state.
8. Communicate with support, legal or affected customers where required.
9. Resume gradually after verification.
10. Complete a post-incident review.

## Duplicate-send incident

- stop affected workers or queue partition;
- identify the logical idempotency key range;
- compare internal acceptance records with provider message IDs;
- cancel messages not yet submitted where possible;
- avoid blind replay;
- determine whether customer communication is needed;
- fix uniqueness or uncertain-outcome handling before resumption.

## Incorrect-recipient or consent incident

- stop the affected message class immediately;
- preserve the eligibility decision and ruleset version;
- identify recipients and content sent;
- apply missing suppression corrections;
- involve legal and privacy owners as required;
- do not conceal the incident by deleting records.

## Webhook incident

- keep accepting only verifiable events;
- preserve raw verified payload references according to retention policy;
- queue failed processing;
- reconcile provider history against internal records;
- replay idempotently after the processor is corrected;
- verify that bounces and complaints were not missed.

## Post-incident review

Record:

- timeline;
- detection source;
- affected systems and customers;
- root cause;
- contributing controls that failed;
- immediate remediation;
- long-term prevention;
- owner and due dates;
- evidence that reconciliation completed.

## Release blockers

Do not release when:

- webhook verification and replay are untested;
- duplicate prevention has not been exercised;
- rollback cannot protect queued sends;
- production recipients are reachable from unrestricted test environments;
- complaints and hard bounces do not alter future eligibility;
- incident ownership and pause controls are undefined;
- end-to-end message history cannot be reconciled.