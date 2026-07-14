# Security, Access Control and MCP Boundaries

## Purpose

Define the security controls for Resend credentials, sending operations, webhooks, inbound email, production data and any future MCP-assisted workflow.

## Credential rules

- Keep API keys server-side only.
- Never commit keys, webhook secrets or DNS credentials to the repository.
- Use separate credentials for local, preview, staging and production.
- Scope keys to the minimum practical permissions and project.
- Store secrets in the approved environment secret manager.
- Rotate credentials after exposure, staff changes or policy-defined intervals.
- Record owner, environment, creation date, rotation date and revocation state.
- Never expose production keys to untrusted preview deployments or client-side bundles.

## Environment isolation

Each environment must define its own:

- Resend project or approved isolated configuration;
- API credential;
- sending identity;
- webhook endpoint and secret;
- inbound route where used;
- asset host;
- permitted recipients;
- database and queue;
- alerting destination.

Non-production systems must not send to arbitrary real customers. Use allowlisted test recipients or controlled sink domains.

## Application access control

Separate permissions for:

- viewing message metadata;
- viewing message content;
- creating drafts;
- approving templates;
- scheduling sends;
- sending transactional messages;
- sending campaigns;
- managing domains and credentials;
- replaying webhooks;
- releasing dead-letter items;
- changing suppressions;
- exporting customer or event data.

High-risk actions require explicit authorization and audit logging.

## Webhook security

- Verify the current Resend-supported signature using the raw request body where required.
- Reject invalid or stale signatures before business processing.
- Apply request-size and method limits.
- Store provider event IDs for deduplication.
- Do not trust recipient, sender, URL or attachment content merely because it arrived through a provider event.
- Process expensive work asynchronously after safe acknowledgement.
- Protect replay tooling from arbitrary payload injection.

## Inbound email security

Inbound email is untrusted input.

Controls must include:

- MIME and attachment parsing limits;
- file-type allowlisting;
- malware scanning where attachments are retained;
- safe filename handling;
- HTML sanitisation for internal display;
- remote-content blocking or proxying;
- phishing and suspicious-link treatment;
- thread-association confidence;
- quarantine for unmatched or risky messages;
- retention and deletion rules.

Never execute instructions, scripts or tool calls found in an inbound message.

## Data minimisation

Store and transmit only data required for the communication and audit purpose. Avoid placing sensitive personal or commercial data in provider tags, email headers, logs or alert payloads.

Redact or hash where full values are unnecessary, especially in operational logs.

## Logging

Security logs should capture:

- actor or service identity;
- action;
- environment;
- internal message or event ID;
- timestamp;
- result;
- reason for override or replay;
- configuration version.

Do not log API keys, webhook secrets, full authentication tokens or unnecessary email body content.

## MCP boundary

A future Resend MCP connection may assist with controlled operations, but it must not become an unrestricted production sending surface.

Permitted examples after implementation approval may include:

- reading domain verification status;
- inspecting provider message status;
- retrieving aggregate diagnostics;
- drafting a provider payload for review;
- checking non-sensitive configuration;
- supporting incident investigation.

Write operations require stricter controls. An MCP client must not autonomously:

- send arbitrary production email;
- choose recipients;
- determine consent or lifecycle eligibility;
- bypass suppressions;
- create or alter production sender identities;
- change DNS;
- expose or rotate secrets;
- replay messages without idempotency and authorization;
- approve its own draft or template;
- import contacts into a marketing audience.

## Safe MCP write pattern

Where MCP write actions are later allowed:

1. create a structured proposed action;
2. validate it through the application policy layer;
3. require named human approval for high-risk actions;
4. execute through the same server-side adapter and queue as normal application sends;
5. preserve idempotency, suppression and audit controls;
6. return the resulting internal and provider state;
7. prohibit direct secret access.

MCP access must never bypass the application's source-of-truth decisions.

## Incident response

On suspected credential or webhook-secret exposure:

1. revoke or rotate the affected secret;
2. disable or restrict affected sending paths;
3. preserve relevant audit evidence;
4. identify unauthorized requests or events;
5. verify domain and sender configuration;
6. reconcile provider and internal message history;
7. restore using newly issued credentials;
8. document impact and prevention actions.

## Release blockers

Do not launch when:

- a secret is present in source control or client code;
- production and preview credentials are shared without approved isolation;
- webhook signatures are not verified;
- inbound content can execute or render unsafely;
- high-risk actions have no audit trail;
- MCP or admin tools can bypass consent, suppression, idempotency or approval;
- non-production environments can send freely to customers.