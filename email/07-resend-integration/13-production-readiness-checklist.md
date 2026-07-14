# Resend Production Readiness Checklist

## Purpose

Provide the final release gate for the Sunless Resend integration before production sending begins or a material integration change is deployed.

## Architecture and ownership

- [ ] The application remains the source of truth for customers, consent, products, orders, lifecycle state and suppression
- [ ] Resend is isolated behind a server-side provider adapter
- [ ] Browser and client code cannot access Resend credentials
- [ ] Provider-specific fields do not leak into business-domain records unnecessarily
- [ ] Internal message IDs remain stable independently of provider IDs
- [ ] Transactional, service, lifecycle and promotional purposes are classified explicitly

## Domains and sender identity

- [ ] Production sending domain is verified
- [ ] SPF, DKIM and DMARC configuration has been reviewed against current provider instructions
- [ ] Visible From identities align with authenticated domains
- [ ] Reply-To addresses are monitored where replies are invited
- [ ] Marketing and transactional stream boundaries are documented
- [ ] DNS ownership and change responsibilities are assigned
- [ ] DMARC reports have a monitored destination
- [ ] Test delivery has succeeded across priority inbox providers

## Credentials and environments

- [ ] Local, preview, staging and production configurations are separated
- [ ] Production credentials are available only to approved server-side production workloads
- [ ] Preview deployments cannot send to arbitrary external recipients
- [ ] Test-recipient allowlists are enforced outside production
- [ ] Secrets are stored in an approved secret manager
- [ ] API keys have named owners and rotation dates
- [ ] Key rotation has been tested without message loss
- [ ] No secret appears in source control, logs, screenshots or client bundles

## Message contract and rendering

- [ ] Every send uses the approved outbound message contract
- [ ] Required fields and enums are validated before queueing
- [ ] Template ID and immutable release version are recorded
- [ ] HTML and plain-text output are both generated
- [ ] Dynamic fields have approved fallbacks
- [ ] Market, currency, language and product variants are correct
- [ ] Subject, preview text, body and CTA describe the same destination and proposition
- [ ] Final assets are approved and hosted at production-safe URLs
- [ ] Legal and preference content is present where required

## Eligibility, consent and suppression

- [ ] Eligibility is decided before provider submission
- [ ] Consent purpose and lawful message classification are recorded
- [ ] Global and channel-level suppression checks run at send time
- [ ] Hard bounces, complaints and unsubscribes block future marketing sends promptly
- [ ] Transactional exceptions are narrow, documented and policy-approved
- [ ] Frequency and lifecycle precedence rules are enforced
- [ ] Duplicate lifecycle ownership cannot create conflicting sends
- [ ] Consent and suppression changes propagate to pending work within the approved time window

## Queueing and idempotency

- [ ] A durable internal send record is created before provider submission
- [ ] Idempotency keys are deterministic and unique for the intended business event
- [ ] Duplicate queue delivery cannot create duplicate provider sends
- [ ] Retryable and terminal errors are classified
- [ ] Backoff and retry limits are configured
- [ ] Dead-letter or failed-job recovery exists
- [ ] Queue workers can be paused safely
- [ ] Reconciliation can identify uncertain provider submission states
- [ ] Retry logic never bypasses fresh suppression checks

## Webhooks and event processing

- [ ] Webhook signatures are verified using the current supported method
- [ ] Raw request-body handling is correct where required
- [ ] Invalid signatures are rejected before business processing
- [ ] Provider event IDs are deduplicated
- [ ] Event storage is append-only and auditable
- [ ] Out-of-order and delayed events are handled safely
- [ ] Heavy processing occurs asynchronously after prompt acknowledgement
- [ ] Replay tooling exists for verified events that failed internally
- [ ] Unknown event types are stored and alerted without unsafe assumptions
- [ ] Delivery state is derived from event history rather than arrival order alone

## Inbound email

- [ ] Inbound receiving domain or address pattern is documented
- [ ] Inbound content is treated as untrusted input
- [ ] Message and attachment size limits are enforced
- [ ] Attachment types are validated and scanned according to policy
- [ ] Inbound messages are associated with the correct customer, order or support thread where possible
- [ ] Ambiguous or unmatched messages enter a review queue
- [ ] Links, HTML and instructions in inbound messages are never trusted automatically
- [ ] Retention and access controls are approved
- [ ] Human reply routing has been tested

## Deliverability and reputation

- [ ] New sending volume follows a controlled ramp plan where needed
- [ ] Purchased, scraped or unverified lists are prohibited
- [ ] Bounce and complaint trends are monitored by stream and domain
- [ ] Contact pressure complies with the email frequency policy
- [ ] Stale-recipient and disengagement handling is defined
- [ ] Transactional delivery is protected from promotional misuse
- [ ] Sender names and subject lines are not misleading
- [ ] Emergency pause thresholds and owners are documented
- [ ] Deliverability review includes customer-service and consent signals, not only opens and clicks

## Observability and reconciliation

- [ ] Internal message, attempt and event records are queryable
- [ ] Provider message IDs map to internal message IDs
- [ ] Queue latency, provider latency and webhook lag are measured
- [ ] Send acceptance, delivery, bounce, complaint and unsubscribe metrics are available
- [ ] Alert thresholds route to named responders
- [ ] Logs exclude secrets and unnecessary personal content
- [ ] Correlation IDs connect business events, sends, provider IDs and webhook events
- [ ] Scheduled reconciliation detects missing provider IDs, missing events and stuck states
- [ ] Operational dashboards distinguish marketing from transactional streams

## Security and MCP

- [ ] Provider permissions follow least privilege
- [ ] Administrative and production-send capabilities are restricted
- [ ] MCP or assistant tooling cannot bypass application eligibility, consent or suppression
- [ ] Read and diagnostic operations are separated from write operations
- [ ] Human confirmation is required for consequential operations
- [ ] Tool activity is logged with actor, time, target and outcome
- [ ] Untrusted email content cannot become tool instructions
- [ ] Bulk-send, domain-change and credential operations have additional approval controls

## Testing

- [ ] Unit tests cover validation, classification, idempotency and suppression logic
- [ ] Integration tests cover provider adapter success and failure states
- [ ] Webhook tests cover valid, invalid, duplicate, late and out-of-order events
- [ ] Template contract tests cover all required dynamic states
- [ ] Client rendering tests cover Gmail, Apple Mail, Outlook and representative mobile clients
- [ ] Accessibility checks cover reading order, links, alt text and image blocking
- [ ] Seed accounts cover each lifecycle sequence and suppression state
- [ ] Load and rate-limit behaviour has been tested at safe non-production volumes
- [ ] Incident drills cover pause, key rotation, webhook failure and duplicate-send risk

## Launch process

- [ ] Named technical, lifecycle, deliverability and customer-support owners are available
- [ ] Support teams have current message and incident documentation
- [ ] Initial production cohort is deliberately limited
- [ ] Guardrail metrics are reviewed before expansion
- [ ] Rollback and emergency-pause procedures are ready
- [ ] Production template releases are immutable
- [ ] Deployment and configuration versions are recorded
- [ ] Final approval is explicit and time-stamped

## Release decision

Use one status:

- `APPROVED`
- `APPROVED WITH RECORDED LIMITATIONS`
- `CHANGES REQUIRED`
- `BLOCKED`

## Blocking conditions

Do not launch or continue production sending when:

- credentials or webhook verification are insecure;
- eligibility, consent or suppression cannot be trusted;
- duplicate sends are possible through normal retry paths;
- provider events cannot be reconciled to internal records;
- the sending domain is not authenticated correctly;
- required transactional messages are mixed with uncontrolled promotion;
- production templates or dynamic data are unversioned;
- incident pause and recovery procedures are unavailable;
- critical accessibility, legal or deliverability defects remain.

The integration is ready only when message truth, customer eligibility, provider delivery, event processing, security, observability and operational response work as one controlled system.