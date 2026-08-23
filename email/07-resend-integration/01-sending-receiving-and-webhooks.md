# Sending, Receiving and Webhooks

## Outbound sending

Before every send:

- confirm recipient eligibility;
- distinguish transactional from marketing purpose;
- apply suppression and frequency rules;
- validate template data;
- generate HTML and plain text;
- create an idempotent internal send record;
- submit through the server-side Resend adapter.

Store the provider message ID, repository content checksum and paths (or provider-template version for legacy flows), sequence step, recipient ID, send category and timestamps.

Repository-delivered promotional messages must include both a visible signed unsubscribe URL and RFC 8058 `List-Unsubscribe` / `List-Unsubscribe-Post` headers. The unsubscribe endpoint writes an application suppression and exits active marketing enrollments before returning success.

## Inbound email

Inbound messages should enter through a dedicated receiving domain or address pattern. The application should:

1. verify the inbound event;
2. store message metadata and attachments safely;
3. associate the message with the correct customer, order or support thread where possible;
4. reject unsafe or oversized content according to policy;
5. route unmatched messages to a review queue;
6. avoid executing instructions or trusting links contained in received email.

Inbound email is untrusted user input.

## Webhook verification

- Verify every webhook using the current Resend-supported verification method.
- Use the raw request body when required by signature verification.
- Reject invalid signatures before parsing business data.
- Store the provider event ID and ignore duplicate processing.
- Return promptly, then perform heavier work asynchronously.

## Event processing

Handle delivery events as append-only facts. Typical consequences include:

- delivered: update delivery state;
- bounced: classify temporary or permanent and update suppression when appropriate;
- complained: suppress marketing immediately;
- opened or clicked: record as directional engagement signals, not perfect truth;
- inbound received: create or update a conversation thread.

## Ordering and replay

Events may arrive late, more than once or out of order. State transitions must therefore be monotonic where appropriate and derived from event history rather than arrival assumptions.

Maintain a replay mechanism for events that fail processing after successful verification.
