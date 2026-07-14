# Consent, Suppression, Bounces and Complaints

## Purpose

Define how recipient eligibility and negative delivery signals are enforced across the Sunless application and Resend integration.

## Source-of-truth rule

The application owns consent, preference, suppression and message-classification decisions. Provider suppression data is an important input that must be synchronized, but it is not the only eligibility source.

## Pre-send eligibility

Before every outbound request, evaluate:

- recipient identity and email validity;
- message classification;
- current consent or applicable service basis;
- global and channel preferences;
- market and policy requirements;
- hard-bounce status;
- complaint status;
- unsubscribe status;
- internal manual suppression;
- temporary contact pause;
- lifecycle precedence and contact-pressure rules;
- any active legal, fraud, safety or support restriction.

Store the decision and the ruleset version used.

## Suppression precedence

A higher-severity suppression must not be overridden by a lower-level preference or campaign setting.

Recommended order:

1. legal or security block;
2. complaint suppression;
3. hard-bounce suppression;
4. global unsubscribe;
5. channel or topic preference;
6. temporary pause;
7. lifecycle conflict;
8. frequency cap;
9. campaign exclusion.

## Transactional and service messages

A marketing opt-out does not automatically prevent every genuine order, account or safety message. However, classification must be accurate and promotional modules must not be inserted into a service message merely to bypass consent.

## Unsubscribe handling

Unsubscribe and preference actions must:

- resolve through a production route;
- be authenticated or tokenized appropriately;
- apply promptly;
- be idempotent;
- record timestamp, source and scope;
- update pending sends where operationally possible;
- provide a clear confirmation state;
- never require login when law or policy requires a simple opt-out.

## Bounce handling

Classify provider bounce events into at least:

- permanent or hard bounce;
- temporary or soft bounce;
- policy or reputation rejection;
- mailbox full or transient capacity issue;
- unknown requiring review.

Hard bounces should suppress future non-essential sends promptly. Soft bounces require bounded retry and escalation rules rather than indefinite sending.

## Complaint handling

A valid complaint signal must:

- suppress future marketing immediately;
- cancel eligible queued promotional sends;
- create an auditable complaint record;
- retain enough evidence to prevent accidental re-entry;
- notify operations when thresholds or unusual patterns are reached.

Do not automatically resubscribe a complained address through a later import or profile update.

## Provider synchronization

Reconcile application suppression records with current provider state. Differences must enter an exception queue.

Examples:

- provider has a complaint not present internally;
- internal global unsubscribe is absent from provider suppression;
- recipient address changed after a hard bounce;
- a suppression was imported without a traceable source;
- a previously suppressed address appears in a new customer record.

## Address changes

A new email address must be treated as a new contact endpoint, not as automatic proof of marketing consent. Preserve the relationship between customer identity, consent record and address version.

## Re-entry rules

A suppressed recipient may re-enter only through an approved path appropriate to the suppression reason. Complaint and hard-bounce re-entry require stricter review than a temporary pause or topic preference.

## Monitoring

Track by stream, market and sender identity:

- attempted sends;
- blocked sends by reason;
- unsubscribes;
- complaints;
- hard and soft bounces;
- suppression synchronization lag;
- pending sends canceled after a negative signal;
- manual overrides and corrections.

## Release blockers

Do not launch when:

- consent and suppression checks can be bypassed;
- pending queues cannot react to complaints or global unsubscribes;
- message classification is ambiguous;
- imported suppression history is incomplete;
- complaint and hard-bounce events are not processed reliably;
- service messages contain avoidable promotional content;
- no reconciliation process exists.