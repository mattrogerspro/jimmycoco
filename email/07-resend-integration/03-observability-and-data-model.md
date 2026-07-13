# Observability and Email Data Model

## Purpose

Create a durable internal record of every email decision, send attempt, provider response and delivery event.

## Core records

### Email message
Recommended fields:

- internal message ID
- recipient or customer ID
- recipient address snapshot
- category: transactional, lifecycle, campaign or support
- flow and step identifier
- template name and version
- subject and preview-text version
- sender identity
- idempotency key
- Resend message ID
- created, queued and sent timestamps
- current delivery state
- suppression or failure reason

### Email event
Recommended fields:

- internal event ID
- provider event ID
- related message ID
- event type
- provider timestamp
- received timestamp
- verified status
- processing status
- minimal provider payload or secure payload reference
- retry count and last error

### Inbound message
Recommended fields:

- inbound message ID
- provider identifier
- sender and recipient addresses
- subject
- text and HTML storage references
- attachment metadata
- related customer, order or support-thread ID
- classification and review status

## State handling

Keep the append-only event history even when a denormalised current status is maintained for fast queries. Do not overwrite evidence of earlier delivery or failure events.

## Monitoring

Alert on:

- elevated send errors;
- webhook verification failures;
- event-processing backlog;
- sudden bounce or complaint increases;
- missing transactional sends;
- repeated duplicate-send prevention;
- inbound routing failures;
- domain or sender verification issues.

## Privacy and retention

Store only the data needed for operations, customer support, compliance and analysis. Do not log API keys, complete authentication headers or unnecessary message content. Define retention periods for inbound bodies, attachments and raw webhook payloads.

## Reconciliation

Provide an operational view that can compare internal messages with Resend identifiers and delivery events. Unknown provider events and messages without expected events should be reviewable without direct database manipulation.

## Analytics boundary

Provider open and click events are useful directional signals but are not perfect measures of human attention. Revenue and conversion analysis should use first-party site and order events with clearly defined attribution rules.
