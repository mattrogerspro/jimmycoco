# UK Reseller Lifecycle — pro-site forms to account and orders

**Goal:** acknowledge every pro-site trade request, keep the admin team notified, and confirm approved-reseller portal orders.
**Audience:** UK salons, spas, mobile professionals and multi-site groups using www.jimmycoco.pro.
**Market:** UK
**Channel:** Email. ESP: Resend. Sent by the outreach worker via `shared/campaign-registry.js`.
**Status:** Draft — not approved for send
**Owner:** Partnerships
**Entry:** the recipient submitted a pro-site request, was approved by admin, or placed a portal order.

## Cadence

| # | Trigger | Touch | Classification | File |
|---|---|---|---|---|
| 1 | `reseller_trial_request_received` | Free-trial thank-you to applicant | service | `emails/1-free-trial-request-received.html` |
| 2 | `reseller_order_request_received` | Product-page order-request thank-you | service | `emails/2-order-request-received.html` |
| 3 | `reseller_application_internal_notice` | Internal notice for trial/order request | transactional | `emails/3-internal-notice.html` |
| 4 | `reseller_approved` | Approved account and signup link | service | `emails/4-approved-welcome.html` |
| 5 | `reseller_order_submitted` | Portal order thank-you | service | `emails/5-portal-order-received.html` |
| 6 | `reseller_order_internal_notice` | Internal portal-order notice | transactional | `emails/6-order-internal-notice.html` |
| 7 | `reseller_declined` | Courteous close | service | `emails/7-declined.html` |

All messages are immediate event responses. There are no scheduled follow-ups in this campaign.

## Runtime sources

- `pro-site/app/lib/application-action.server.ts` saves home/product submissions to `reseller_applications` and emits the trial/order request events.
- `pro-site/app/routes/admin.application-detail.tsx` emits approval and decline events.
- `pro-site/app/routes/portal.order.tsx` saves approved-reseller orders to `reseller_orders` and `reseller_order_items`, then emits customer and internal order events.
- `pro-site/app/lib/reseller-events.server.ts` posts to `/api/lifecycle/trigger` on the automation deployment.
- `api/_lib/resend.js` sends through Resend and BCCs audit copies to `EMAIL_AUDIT_COPY`, defaulting to `matthew@jimmycoco.pro`.

## Data recording audit

- Free trial form fields are stored in `reseller_applications`; the complete non-sensitive submitted field snapshot is also stored in `metadata.submitted_fields`.
- Product-page order requests are stored in `reseller_applications`; the generated order summary and customer notes are stored in `message` and in `metadata.submitted_fields`.
- Approved portal orders are stored in `reseller_orders` and `reseller_order_items`; totals are recalculated by the database trigger.
- Passwords are not copied into application tables. Portal signup remains owned by Supabase Auth.

## Exclusions

- No payment is taken by these flows.
- No cold outreach or promotional follow-up belongs in this lifecycle.
- Suppression, bounce, complaint and idempotency handling is inherited from the engine.
- The campaign remains disabled until Resend template publication, registry enablement, database enablement and `EMAIL_LIVE_MODE=true` are explicitly approved.

## Approval tokens

| Token | Needed for | Status |
|---|---|---|
| `{{BUSINESS_ADDRESS}}` | Footer, all emails | Supplied from `EMAIL_BUSINESS_ADDRESS`; must be configured before live send. |
| `{{PREFERENCES_LINK}}` | Removal/preferences link | Supplied from `EMAIL_PREFERENCES_LINK`, falling back to a monitored mailto removal request. |
| Resend template IDs | All seven messages | Not published yet; `templateId` values remain `null` until approved release. |

## Compliance notes

These messages are service or transactional responses to actions taken by the recipient or internal notices to staff. They must stay factual and must not carry promotional follow-up content. Legal and sender-identity review are still required before enabling the campaign.
