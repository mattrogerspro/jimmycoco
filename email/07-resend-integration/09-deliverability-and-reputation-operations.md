# Deliverability and Reputation Operations

## Purpose

Define the operating controls that protect Sunless sender reputation and preserve reliable delivery across marketing, lifecycle, service and transactional streams.

## Principle

Deliverability is a product and data-quality outcome, not merely a DNS or provider setting. Authentication cannot compensate for poor consent, stale addresses, excessive frequency or misleading content.

## Stream model

Monitor separately where the implementation permits:

- account and security;
- order and fulfilment;
- customer-requested results or support;
- lifecycle programmes;
- campaigns and promotions.

The exact domain or subdomain structure must be justified by operational needs. Avoid unnecessary fragmentation while protecting critical service delivery from promotional mistakes.

## Authentication operations

Maintain documented ownership for:

- verified sending domains;
- SPF configuration;
- DKIM keys and rotation where applicable;
- DMARC policy and reporting;
- visible From alignment;
- return-path or provider-managed records;
- DNS change approval and rollback;
- domain expiry and registrar access.

Use only the current records supplied for the exact Resend project and environment. Never copy records from another provider, environment or brand.

## Sender identities

Each sender identity must define:

- display name;
- From address;
- reply-to address;
- permitted message classes;
- markets and languages;
- responsible owner;
- monitored reply behavior;
- fallback during incident.

Do not use a no-reply identity when the email invites a response.

## Volume management

For a new or materially changed sending domain:

- begin with expected and engaged recipients;
- increase volume gradually;
- preserve predictable cadence;
- separate abnormal bulk imports;
- avoid sudden large campaigns during unresolved reputation issues;
- maintain critical-service capacity.

## List quality

Never send to purchased, scraped or unverifiable lists.

Operational controls must include:

- source and consent provenance;
- syntax and domain validation;
- historical bounce and complaint checks;
- stale-contact segmentation;
- re-permission policy where appropriate;
- suppression imports during migrations;
- prevention of suppressed-address reintroduction.

## Engagement interpretation

Open and click events are imperfect and may be affected by privacy systems, security scanners and automated clients. Use them directionally and alongside:

- qualified site sessions;
- purchases;
- replies;
- preference changes;
- complaints;
- support contacts;
- long-term customer behavior.

Do not delete or suppress solely from one ambiguous engagement event without an approved policy.

## Thresholds and alerts

Define stream-specific warning and critical thresholds for:

- hard-bounce rate;
- soft-bounce rate;
- complaint rate;
- unsubscribe rate;
- rejection and deferral rate;
- delivery latency;
- provider suppression growth;
- domain-authentication failure;
- unusual click or open patterns;
- volume spikes;
- DMARC reports.

Threshold values must be reviewed against current provider guidance, market policy and the normal Sunless baseline during implementation.

## Investigation sequence

When reputation deteriorates:

1. pause or reduce non-essential traffic where necessary;
2. protect account and order-critical streams;
3. identify affected sender, domain, market, template, acquisition source and cohort;
4. review recent volume, list imports and cadence changes;
5. validate authentication and DNS;
6. inspect complaints, bounces and content classification;
7. correct the root cause;
8. resume gradually with monitoring;
9. document decisions and outcomes.

## Content and identity controls

Deliverability QA must confirm:

- truthful sender and subject identity;
- no reply imitation or deceptive urgency;
- consistent brand recognition;
- functional unsubscribe and preference links;
- balanced text and imagery;
- complete plain text;
- no broken or suspicious destinations;
- no hidden content that misrepresents the message.

## Provider portability

Retain internal message, event, consent and suppression history independently of Resend. Sender reputation is provider-influenced, but customer communication history must remain portable.

## Review rhythm

### Daily during launch or incident

Review acceptance, bounces, complaints, delays, authentication and queue health.

### Weekly

Review metrics by stream, market, sender identity, acquisition source and sequence.

### Monthly

Review list growth quality, contact pressure, domain reputation indicators, suppression synchronization and capacity.

### On every material change

Reassess when changing domains, senders, provider configuration, acquisition source, volume pattern, authentication or template architecture.

## Release blockers

Do not increase production volume when:

- authentication is incomplete or failing;
- complaint or bounce handling is unreliable;
- suppression imports are incomplete;
- reply addresses are unmonitored;
- there is no stream-level visibility;
- abnormal rejection or complaint trends are unresolved;
- marketing traffic can exhaust capacity required for critical service messages.