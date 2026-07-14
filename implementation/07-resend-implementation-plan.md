# Resend Implementation Plan

## Purpose

Turn the Resend integration architecture into a safe, testable production implementation.

## Preconditions

Before production integration:

- sending domains and identities are approved;
- consent and suppression models exist;
- template releases are immutable;
- message categories are defined;
- webhook endpoints can receive raw request bodies;
- durable message and event tables exist;
- environment and secret boundaries are established.

## Stage 1 — Provider adapter

Create a server-side email adapter that accepts the canonical outbound contract and hides provider-specific payloads.

Required operations:

- submit message;
- submit batch only where safe and supported;
- map provider response;
- classify provider errors;
- retrieve or reconcile message status where available;
- expose health and configuration validation without leaking secrets.

The browser must never call Resend directly.

## Stage 2 — Environment configuration

Implement separate local, preview/staging and production configuration.

Validate:

- API key scope;
- sending domain;
- sender identities;
- reply-to addresses;
- webhook secret;
- inbound domain where used;
- permitted recipient policy;
- provider adapter mode;
- emergency send-disable flag.

Non-production must not be able to send to arbitrary real customers.

## Stage 3 — Domain and sender setup

For each stream:

- verify required DNS records using current provider values;
- confirm SPF, DKIM and DMARC alignment;
- document sender names and addresses;
- define marketing, transactional and inbound boundaries;
- test reply handling;
- record ownership and recovery access.

## Stage 4 — Durable send workflow

Recommended flow:

1. Receive a validated internal send request.
2. Recheck consent, suppression and lifecycle eligibility.
3. Select the immutable template release.
4. Resolve approved assets and final dynamic data.
5. Render HTML and plain text.
6. Create the internal message record and idempotency key.
7. Queue submission.
8. Submit through the adapter.
9. Store provider message ID and response.
10. Reconcile webhook events.

No provider call should occur before the internal durable record exists.

## Stage 5 — Queue and retries

Implement:

- durable queue jobs;
- bounded retries;
- exponential backoff with jitter;
- retry classification;
- dead-letter or failed-job review;
- idempotency enforcement;
- scheduled-send cancellation;
- emergency pause by stream and globally.

Do not retry permanent recipient, consent, suppression, validation or configuration failures.

## Stage 6 — Webhooks

Webhook processing must:

- verify signatures using the current supported method;
- use the raw body where required;
- reject invalid requests before business processing;
- persist the provider event ID;
- acknowledge quickly;
- process asynchronously;
- tolerate duplicate and out-of-order delivery;
- preserve append-only event history;
- expose replay for failed processing.

## Stage 7 — Suppression consequences

Implement deterministic consequences for:

- hard bounce;
- complaint;
- unsubscribe;
- manual suppression;
- temporary bounce policy;
- invalid recipient;
- account deletion.

Provider state must be reconciled into the application suppression model rather than becoming a separate authority.

## Stage 8 — Inbound email

Where inbound is enabled:

- use dedicated addresses or routing patterns;
- treat content and attachments as untrusted;
- verify event authenticity;
- limit size and type;
- scan or quarantine attachments according to policy;
- associate with customer, order or support thread only when confidence is sufficient;
- route unmatched messages to human review;
- never execute instructions contained inside inbound email.

## Stage 9 — Observability

Monitor:

- queue depth and latency;
- submission success;
- provider response errors;
- accepted-to-delivered time;
- bounce and complaint rates;
- webhook verification failures;
- webhook processing lag;
- duplicate prevention events;
- suppression updates;
- message reconciliation gaps;
- stream and domain health.

## Stage 10 — Test progression

1. Adapter unit tests with provider mocks.
2. Template and contract tests.
3. Local allow-list tests.
4. Staging domain and webhook tests.
5. Failure and replay tests.
6. Internal inbox-provider tests.
7. Transactional canary.
8. Welcome sequence canary.
9. Gradual lifecycle rollout.
10. Campaign enablement after stable observation.

## Security requirements

- API and webhook secrets remain server-side.
- Secrets are environment-scoped and rotated.
- Logs redact recipient content and secrets.
- Administrative or MCP access is least-privileged.
- Production sends require explicit application approval paths.
- No assistant or automation may bypass consent, suppression or human release controls.

## Acceptance criteria

The Resend integration is production-ready when:

- domains authenticate correctly;
- the provider adapter is isolated and tested;
- message creation and submission are idempotent;
- webhook signatures and replay work;
- consent and suppression are enforced before submission;
- delivery consequences update internal state;
- non-production recipients are restricted;
- monitoring and alerts are operational;
- emergency pause and rollback are tested;
- message and event histories reconcile without unexplained gaps.