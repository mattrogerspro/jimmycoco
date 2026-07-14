# Sunless Resend Integration System

This folder defines how Sunless by Jimmy Coco uses Resend for outbound delivery, inbound email and provider event handling while the application remains the source of truth for customers, consent, products, orders, shade-match results, lifecycle state and suppression.

## Core architecture rule

Resend is the transport and delivery-event layer.

It must not decide:

- who is eligible to receive a message;
- whether consent is valid;
- whether a customer is suppressed;
- which lifecycle sequence owns the customer;
- which product, shade, price or offer is correct;
- whether a message is transactional, service, lifecycle or promotional.

Those decisions belong to the application and its approved business rules.

## Scope

- provider adapter architecture;
- outbound message contracts;
- template rendering and immutable releases;
- consent and suppression enforcement;
- queueing, retries and idempotency;
- outbound and inbound workflows;
- webhook verification and event processing;
- sending-domain authentication;
- deliverability and reputation operations;
- observability and reconciliation;
- environments, credentials and configuration;
- MCP and administrative safety;
- testing, incidents and production readiness.

## Documents

- `00-integration-architecture.md` — system ownership, adapter boundary and provider portability
- `01-sending-receiving-and-webhooks.md` — outbound, inbound and webhook-processing workflow
- `02-domain-authentication-and-deliverability.md` — sender identity, authentication and foundational reputation controls
- `03-observability-and-data-model.md` — message records, provider events, monitoring and replay
- `04-mcp-integration-plan.md` — safe future use of Resend MCP capabilities
- `05-outbound-message-contract.md` — validated application-level send request and provider response contract
- `06-template-rendering-and-release-control.md` — immutable template releases, dynamic-data validation and rendering rules
- `07-consent-suppression-and-preference-enforcement.md` — purpose-based eligibility and suppression precedence
- `08-queueing-retries-and-idempotency.md` — durable send records, duplicate prevention and failure recovery
- `09-deliverability-and-reputation-operations.md` — ongoing domain, stream and reputation management
- `10-security-secrets-and-mcp-boundaries.md` — least privilege, key handling and assistant-tool controls
- `11-testing-release-and-incident-runbook.md` — test strategy, staged rollout, pause and recovery procedures
- `12-environments-credentials-and-configuration.md` — local, preview, staging and production isolation
- `13-production-readiness-checklist.md` — final end-to-end release gate

## System relationship

Use this section with:

- `../00-strategy/` for lifecycle, consent, frequency and measurement rules;
- `../01-design-system/` for email-safe visual standards;
- `../02-template-system/` for approved rendering components and contracts;
- `../03-sequences/` for trigger, branching and message data requirements;
- `../04-copy-system/` for approved copy, CTA and legal-language rules;
- `../05-ai-production/` for controlled AI-assisted production;
- `../06-assets/` for approved images, crops, rights and hosted derivatives.

## Production rule

No message may be submitted to Resend unless:

- eligibility and message purpose are resolved;
- consent and suppression checks pass;
- the outbound contract validates;
- an immutable template release is selected;
- HTML and plain text are generated;
- a durable internal send record and idempotency key exist;
- the provider adapter is using the correct environment and sender identity;
- the resulting provider message ID and webhook events can be reconciled internally.

The repository remains the source of truth for approved architecture, contracts, templates, safeguards and operational procedures.