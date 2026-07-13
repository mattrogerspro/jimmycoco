# Sunless Email Creative Director System

This folder contains the channel-specific creative, UX, copy, lifecycle, template and production system for Sunless email.

Sunless will use **Resend** for outbound delivery, inbound email and delivery-event handling. The repository remains the source of truth for strategy, approved templates, copy, data contracts and operational safeguards.

## Structure

- `00-strategy/` — email role, audience states, lifecycle architecture, segmentation, frequency and measurement
- `01-design-system/` — email-safe layout, modules, typography, spacing, colour, responsive behaviour and accessibility
- `02-template-system/` — reusable template architecture, component contracts and rendering workflow
- `03-sequences/` — welcome, shade-match, browse abandonment, cart abandonment, post-purchase, replenishment, win-back and VIP flows
- `04-copy-system/` — subject lines, preview text, CTA hierarchy, message patterns and tone by lifecycle stage
- `05-ai-production/` — email-image prompt workflow, consistency rules, failure modes and QA
- `06-assets/` — email crops, product imagery, campaign references and approved exports
- `07-resend-integration/` — sending, receiving, webhooks, domains, deliverability, observability and future MCP integration

## Architecture rule

All universal brand rules must be referenced from [`../shared/`](../shared/). This folder contains email-specific decisions only.

The application remains the source of truth for customers, consent, products, orders, shade-match results, sequence eligibility and suppression. Resend is the transport and delivery-event layer.

## Production rule

No message may be sent from an improvised one-off layout when an approved template or module exists. Production sends require validated data, a plain-text version, approved sender identity, suppression checks, legal review where applicable and verified event handling.
