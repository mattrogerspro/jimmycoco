# Jimmy Coco Pro V2 — Repository Handoff

## Runtime ownership

The repository owns the seven-message UK and seven-message U.S. West Coast sequences. The Vercel worker renders the subject and HTML from `email-data.json` plus the shared master template and sends that completed content through Resend's Send Email API.

Resend Templates and Resend Automations are not used by the application worker. The old IDs in each campaign's `resend.json` are retained only as an audit record of retired delivery copies.

| Area | Repository location | Runtime role |
|---|---|---|
| UK recruitment | `email/campaigns/uk-salon-stockist/` | Seven repository-rendered messages on days 0/3/6/10/15/21/28. |
| U.S. West Coast recruitment | `email/campaigns/us-west-coast-salon-stockist/` | Seven repository-rendered messages on days 0/3/6/10/15/21/28. |
| Campaign registry | `shared/campaign-registry.js` | Disabled release gates, cadence, exact variable contract and stop conditions. |
| Runtime renderer | `email/runtime-templates.js` | Loads canonical campaign source for server-side rendering. |
| Send worker | `api/_lib/resend.js` | Resolves values, rejects unresolved tokens and sends complete HTML. |
| Preferences endpoint | `api/preferences/unsubscribe.js` | Verifies signed one-click opt-out tokens and records suppression. |

## Required checks

```text
node email/campaigns/_shared/build-all.js --check uk-salon-stockist us-west-coast-salon-stockist
npm run templates:check
npm test
npm run build
git diff --check
```

## Release gates still outstanding

1. Add `EMAIL_PREFERENCES_SIGNING_SECRET` and `EMAIL_PREFERENCES_BASE_URL` to the production Vercel environment while keeping `EMAIL_LIVE_MODE=false`.
2. Apply the prepared production database migration only after explicit approval.
3. Deploy only after explicit approval.
4. Run one controlled internal-address send through the deployed worker and verify the rendered greeting, links, open/click webhooks and signed one-click opt-out.
5. Import only the approved contact cohort, then enable the UK or U.S. campaign separately after explicit launch approval.
