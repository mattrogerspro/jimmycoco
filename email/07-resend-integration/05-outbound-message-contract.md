# Outbound Message Contract

## Purpose

Define the validated application-level contract that must exist before any email is submitted to Resend.

## Ownership rule

The application decides whether a message should be sent and constructs an immutable send request. The provider adapter translates that request into the current Resend API shape.

Business code must not construct raw provider payloads directly.

## Required message fields

Every send request must include:

- `internal_message_id`;
- `idempotency_key`;
- `recipient_customer_id` where available;
- recipient email address;
- message classification: `transactional`, `service`, `lifecycle` or `promotional`;
- lifecycle sequence and step where applicable;
- template ID and immutable template version;
- locale, market and currency;
- approved sender identity;
- monitored reply-to identity where applicable;
- subject;
- rendered HTML;
- rendered plain text;
- validated dynamic-data snapshot;
- asset-version references;
- consent and suppression decision references;
- scheduling or not-before time where used;
- correlation and trace identifiers;
- creation timestamp.

## Validation before submission

Reject the request before calling Resend when:

- the recipient address is invalid;
- the message classification is missing;
- consent or lawful message basis is unresolved;
- a suppression applies;
- a higher-priority lifecycle owner blocks the send;
- required source data is missing or stale;
- template or asset version is not approved;
- sender identity is not valid for the environment and message stream;
- HTML and plain text are not both present;
- links, market, currency or variant routing are unresolved;
- the same idempotency key has already completed successfully.

## Provider adapter output

The adapter may map the internal request to provider fields such as:

- from;
- to;
- reply-to;
- subject;
- HTML;
- text;
- headers;
- tags or metadata;
- scheduled time;
- attachments where explicitly approved.

Provider-specific metadata must not replace internal business identifiers.

## Response handling

A successful API response means accepted by Resend for processing. It does not mean delivered.

Store:

- provider message ID;
- provider acceptance timestamp;
- request attempt number;
- adapter version;
- response classification;
- any provider error code or safe diagnostic message.

## Data minimisation

Do not send unnecessary customer profile, order, behavioural or internal data to the provider. Tags and metadata should contain stable operational identifiers, not sensitive personal information.

## Attachments

Attachments require explicit business need, file-type allowlisting, size limits, malware controls and retention policy. Prefer secure authenticated links where appropriate.

## Immutability

The complete rendered content and source-data snapshot used for a send must be recoverable after submission. Later catalogue, price, template or customer-profile changes must not silently rewrite historical send records.

## Example internal contract

```json
{
  "internal_message_id": "msg_01...",
  "idempotency_key": "cart:customer_123:step_2:cart_456:v3",
  "classification": "lifecycle",
  "sequence": "cart-abandonment",
  "step": "02",
  "template": { "id": "cart-reminder", "version": "3.1.0" },
  "recipient": { "customer_id": "customer_123", "email": "validated@example.com" },
  "locale": "en-GB",
  "market": "GB",
  "currency": "GBP",
  "sender_identity": "lifecycle-gb",
  "subject": "Your routine is still here",
  "html": "<rendered and approved HTML>",
  "text": "Rendered and approved plain text",
  "consent_decision_id": "decision_...",
  "suppression_check_id": "check_...",
  "correlation_id": "corr_..."
}
```

The exact implementation language may differ, but these responsibilities must remain explicit.