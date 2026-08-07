# UK Reseller Lifecycle — application to open account

**Goal:** carry a UK salon from "trade application submitted" → "reviewed" → "account open and signed in", without a lead ever sitting in silence.
**Audience:** UK salons, spas, mobile professionals and multi-site groups who submitted the trade form on www.jimmycoco.pro.
**Market:** 🇬🇧 UK
**Channel:** Email. ESP: Resend. Sent by the outreach worker via `shared/campaign-registry.js`.
**Status:** Draft — not approved for send
**Owner:** Partnerships
**Entry:** the applicant submitted the form themselves. This is a service response to their own request, not cold outreach.

## Cadence (event-triggered — no scheduled steps)

| # | Trigger | Touch | Classification | File |
|---|---------|-------|----------------|------|
| 1 | `reseller_application_received` | Confirmation to the applicant | service | `emails/1-application-received.html` |
| 2 | `reseller_application_internal_notice` | Internal alert to the team | transactional | `emails/2-internal-notice.html` |
| 3 | `reseller_approved` | Welcome pack, account code, portal link | service | `emails/3-approved-welcome.html` |
| 4 | `reseller_declined` | Courteous close | service | `emails/4-declined.html` |

Emails 1 and 2 fire together the moment the form is submitted. Email 3 fires on approval in
`/admin/resellers`; email 4 fires on decline. "On hold" deliberately sends nothing.

## Where the triggers come from

- `pro-site/app/lib/application-action.server.ts` — emits 1 and 2 on form submission.
- `pro-site/app/routes/admin.resellers.tsx` — emits 3 on approve, 4 on decline.
- `pro-site/app/lib/reseller-events.server.ts` — posts to `/api/lifecycle/trigger` on the
  automation deployment (`https://jimmycoco.email`), bearer-authenticated.

Every event carries a stable `event_id` (`reseller-application-<uuid>-received` and so on), so a
retry cannot double-send.

## Files

- `sequence.md` — subjects, preview text and complete plain-text bodies
- `email-data.json` — renderer input for all four branded emails
- `studio.json` — Studio metadata and event timeline
- `emails/` — generated HTML; **do not hand-edit**

## Exclusions and stop conditions

- Suppression, bounce, complaint and unsubscribe handling is inherited from the engine.
- Email 2 goes to an internal address and must never be sent to an applicant.
- No cold or promotional follow-up belongs in this campaign. A salon that is declined receives
  email 4 and nothing further.
- No lifecycle collision: `email/03-sequences/` is the consumer DTC estate (welcome, shade match,
  cart, replenishment, win-back). This campaign is B2B trade and shares no audience with it.

## Unresolved approval tokens

| Token | Needed for | Status |
|---|---|---|
| `{{approved_trade_terms}}` | Email 3 — margin, minimum order, lead time | **Not supplied.** Rendered as a literal token; must be replaced with approved wording or the block removed before publish. |
| `{{PREFERENCES_LINK}}` | Footer opt-out on all applicant-facing emails | **No destination exists yet.** No preferences route is built on the pro site. |
| `{{BUSINESS_ADDRESS}}` | Footer, all emails | Supplied from `EMAIL_BUSINESS_ADDRESS`; the worker throws `missing_template_variables` if unset. |
| `{{SENDER_NAME}}` / `{{SENDER_TITLE}}` | Signature | Supplied from `EMAIL_SENDER_NAME` / `EMAIL_SENDER_TITLE`. |

## Compliance notes (UK)

- All four are service or transactional messages triggered by the recipient's own submission, so
  PECR direct-marketing consent does not apply. They must not carry promotional content — keep
  them to the application, the account and the next step.
- Sender identity and a monitored reply path are required. Replies to
  `partnerships@email.jimmycoco.pro` are received by Resend inbound and exit the enrollment.
- Business address must appear in the footer.
- Legal review: required before enabling, particularly the decline wording.
