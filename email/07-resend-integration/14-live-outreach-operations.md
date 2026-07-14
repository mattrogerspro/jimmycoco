# Live Outreach and Analytics Operations

## System boundary

The repository is the source of truth for campaign timing, classification, template aliases, template IDs and exit rules. The canonical machine-readable definition is `shared/campaign-registry.js`.

Repository HTML is also canonical. `npm run templates:check` validates the local template contract and, when `RESEND_API_KEY` is available, reports drift against published Resend versions. `npm run templates:publish` is the explicit release action that creates a draft from approved repository HTML and publishes it. Never publish automatically on every commit.

Supabase stores contacts, sequence state, queued lifecycle work, sends, append-only webhook events, suppressions and aggregate reporting. Resend stores published email templates and transports messages. Vercel hosts the protected APIs, webhook endpoint and recurring worker.

## Safety gates

No email can leave the system unless all of these are true:

1. The campaign has `enabled: true` in `shared/campaign-registry.js`.
2. The matching Supabase campaign row is enabled during release promotion.
3. `EMAIL_LIVE_MODE=true` is set in the production Vercel environment.
4. The recipient is eligible and not suppressed for the message classification.
5. Required template variables and commercial values are present.
6. The 16-hour non-transactional contact gap is clear.

Keep the registry campaigns disabled while installing and testing infrastructure.

## Installation order

1. Connect a development Supabase project or branch through the official OAuth MCP.
2. Apply `supabase/migrations/20260714150000_email_outreach.sql`.
3. Connect the Vercel project through the official OAuth MCP.
4. Add all variables in `.env.example` to Vercel. Keep `EMAIL_LIVE_MODE=false`.
5. Deploy and verify `GET /api/health`.
6. Create the Resend webhook pointing to `https://<production-domain>/api/webhooks/resend`.
7. Subscribe to sent, delivered, delayed, bounced, complained, opened, clicked, failed, suppressed, received and contact-updated events.
8. Save the returned signing secret as `RESEND_WEBHOOK_SECRET` in Vercel and redeploy.
9. Send provider test events and confirm they appear in the Live Emails performance strip.
10. Run a controlled internal-address campaign test before enabling any prospect campaign.

The UK pilot currently contains legacy MailerLite-hosted asset URLs. The template release command intentionally blocks until those are moved to the approved production email asset host.

## API contracts

All mutation APIs require `Authorization: Bearer <AUTOMATION_API_KEY>`.

### Enrol a qualified prospect

`POST /api/campaigns/enroll`

```json
{
  "campaign_id": "au-salon-seeding",
  "email": "owner@example.com",
  "first_name": "Sophie",
  "business_name": "Maison Glow",
  "timezone": "Australia/Sydney",
  "owner": "Matt",
  "context": {
    "salon_name": "Maison Glow"
  }
}
```

### Record an exit or conversion

`POST /api/campaigns/exit`

```json
{
  "email": "owner@example.com",
  "reason": "sample_requested",
  "event_id": "crm-reply-123",
  "data": { "owner": "Matt" }
}
```

### Trigger an account-flow message

`POST /api/lifecycle/trigger`

```json
{
  "campaign_id": "au-salon-account-flow",
  "trigger": "sample_dispatched",
  "event_id": "shipment-123-dispatched",
  "contact": {
    "email": "owner@example.com",
    "first_name": "Sophie",
    "business_name": "Maison Glow",
    "timezone": "Australia/Sydney"
  },
  "context": {
    "salon_name": "Maison Glow"
  }
}
```

Supported AU account triggers are `sample_dispatched`, `setup_call_completed` and `opening_order_placed`. Their event IDs must be stable; duplicates are ignored.

## Webhook behavior

The handler verifies the raw body against the Resend signing secret, deduplicates on the Svix ID, stores a minimal append-only event, and updates message timestamps monotonically. Permanent bounces, complaints and provider suppressions create global suppressions. Contact unsubscribe events create marketing suppressions. Inbound email exits any active acquisition sequence as a reply without storing the email body.

## Release rule

Enable one campaign at a time. Start with internal test contacts, inspect delivery and webhook history, then promote a tightly limited qualified cohort. A rollback is `EMAIL_LIVE_MODE=false`; this stops new worker sends without deleting history or queued work.
