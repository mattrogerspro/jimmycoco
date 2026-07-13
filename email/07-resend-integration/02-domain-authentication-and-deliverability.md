# Domain Authentication and Deliverability

## Purpose

Protect sender reputation and ensure Sunless messages are recognisable, authenticated and appropriately separated by purpose.

## Sender structure

Use clearly owned sender identities for:

- marketing and lifecycle communication;
- transactional order and account communication;
- inbound replies and support routing.

The exact domain and subdomain plan must be confirmed during implementation. Avoid unnecessary fragmentation, but keep operational boundaries clear enough to protect transactional delivery from promotional mistakes.

## Authentication

Before production sending:

- verify the sending domain in Resend;
- publish the DNS records required by the current Resend setup;
- configure SPF, DKIM and DMARC deliberately;
- confirm alignment between visible From addresses and authenticated domains;
- document ownership and renewal responsibilities.

Never copy DNS values from an old environment or unrelated project.

## Reputation controls

- Send only to consented and expected recipients.
- Suppress hard bounces, complaints and unsubscribes quickly.
- Avoid purchased or scraped lists.
- Increase volume gradually when warming a new domain or subdomain.
- Keep campaign frequency within the contact policy.
- Monitor bounce, complaint and engagement trends by stream.
- Do not use misleading sender names or subject lines.

## Transactional versus marketing

Transactional messages should contain only the commercial content necessary to complete or support the requested transaction. Promotional modules must not compromise the clarity, legal basis or deliverability of order-critical messages.

## Reply handling

Use a monitored reply address wherever a human response is implied. Do not present a no-reply identity when the copy invites conversation.

## Pre-launch checklist

- domain status verified;
- sender identities approved;
- DNS records documented;
- DMARC reporting destination monitored;
- unsubscribe and preference routes tested;
- suppression imports completed;
- test messages received successfully by priority inbox providers;
- transactional and marketing streams correctly categorised.
