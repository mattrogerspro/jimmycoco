# Resend Integration Architecture

## Purpose

Define the production boundary between the Sunless application and Resend.

## System ownership

### Application owns
- customer profiles and consent;
- product, order and shade-match data;
- sequence state and eligibility;
- suppression decisions;
- template selection and dynamic content;
- internal send records;
- business analytics and attribution.

### Resend owns
- outbound email transport;
- provider message identifiers;
- delivery lifecycle events;
- inbound message transport where configured;
- domain and sender verification status.

## Recommended flow

1. A product or lifecycle event occurs.
2. The application evaluates consent, eligibility, frequency and suppression rules.
3. The application selects versioned repository content and prepares validated data.
4. A durable internal send record is created.
5. The message is submitted to Resend.
6. The provider message identifier is stored.
7. Verified webhook events update the internal send record.
8. Delivery, bounce, complaint and unsubscribe consequences update future eligibility.

## Architectural principles

- Keep provider-specific code behind a small email-service adapter.
- Never call Resend directly from browser code.
- Keep API keys server-side and environment-scoped.
- Separate transactional and marketing policies even when they use the same transport.
- Use stable internal identifiers so provider changes do not break business history.
- Treat webhook delivery as at-least-once and potentially out of order.
- Make send operations idempotent.

## Suggested service boundary

The email service should expose business-level operations such as:

- sendWelcomeMessage
- sendShadeMatchResult
- sendCartReminder
- sendOrderConfirmation
- sendDispatchUpdate
- sendReplenishmentReminder

Business code should not construct raw provider payloads throughout the application.

## Environment separation

Use separate configuration for local, preview and production environments. Production credentials and verified sender identities must never be available to client-side code or untrusted preview deployments.

## Future portability

Templates, data contracts, sequence rules and internal event history must remain provider-independent. For `repository-html` campaigns, generated HTML/text and a content checksum are bundled with the application and submitted directly to Resend. Resend integration details should be isolated inside this folder and the application adapter layer.
