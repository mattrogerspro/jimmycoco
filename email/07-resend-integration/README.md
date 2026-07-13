# Resend Integration

This folder defines how the Sunless email system will integrate with Resend for outbound delivery, inbound email, delivery events and future MCP-assisted operations.

## Documents

- `00-integration-architecture.md` — ownership boundaries and system design
- `01-sending-receiving-and-webhooks.md` — outbound, inbound and event-processing workflow
- `02-domain-authentication-and-deliverability.md` — sender identity, reputation and suppression controls
- `03-observability-and-data-model.md` — message records, event history, monitoring and replay
- `04-mcp-integration-plan.md` — safe future use of the Resend MCP

## Principle

Resend is the transport and event layer. The application remains the source of truth for customers, consent, orders, products, recommendations, sequences and business rules.
