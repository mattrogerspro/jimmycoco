# Campaigns

Home for every **outreach & marketing campaign** — cold acquisition, stockist recruitment and partner journeys. One folder per campaign, each holding its full sequence: written content and sendable code, side by side.

> **Separate from `../03-sequences/`:** that folder is maintained by the automated lifecycle-sequence builder. Outreach campaigns live here so the two systems never collide.

## Campaign registry

| Campaign | Folder | Channel | Market | Status | Hook |
|---|---|---|---|---|---|
| Editorial commerce master preview (TEST) | [`test-editorial-commerce-email/`](test-editorial-commerce-email/) | Email (Resend TEST fixture) | Global test | TEST — NOT FOR SEND | One modular preview of the legacy-inspired editorial-commerce master |
| Australia-wide new salon outreach (TEST) | [`au-new-salon-outreach-test/`](au-new-salon-outreach-test/) | Email (Resend TEST fixture) | AU | TEST — NOT FOR SEND | A fictional, evidence-led salon partnership review |
| AU salon seeding (cold outreach) | [`au-salon-seeding/`](au-salon-seeding/) | Email + WhatsApp | 🇦🇺 AU | Draft | Free sample before summer |
| AU salon account flow (post-sample) | [`au-salon-account-flow/`](au-salon-account-flow/) | Email + WhatsApp | 🇦🇺 AU | Draft | Sample → terms → first order |
| UK salon stockist recruitment | [`uk-salon-stockist/`](uk-salon-stockist/) | Email (MailerLite) | 🇬🇧 UK | Email 1 live | “Your clients already know this name” |
| UK salon onboarding | [`uk-salon-onboarding/`](uk-salon-onboarding/) | Email (Resend) | 🇬🇧 UK | Ready | Professional line → sample kit |
| UAE / Dubai salon stockist recruitment | [`uae-dubai-salon-stockist/`](uae-dubai-salon-stockist/) | Email (Resend-ready) | 🇦🇪 UAE | Draft | Premium professional trial for Dubai partners |
| US West Coast salon stockist recruitment (TEST) | [`us-west-coast-salon-stockist/`](us-west-coast-salon-stockist/) | Email (Resend) | 🇺🇸 US-WC | Draft — not approved for send | Camera-ready color for West Coast daylight |
| Sydney salon stockist recruitment | [`au-sydney-salon-stockist/`](au-sydney-salon-stockist/) | Email + WhatsApp | 🇦🇺 AU (Sydney) | Draft — not approved for send | A Sydney glow, without the Sydney sun |
| Gold Coast salon stockist recruitment | [`au-gold-coast-salon-stockist/`](au-gold-coast-salon-stockist/) | Email (Resend) | 🇦🇺 AU (Gold Coast) | Draft — not approved for send | A more considered professional colour partnership |
| UK reseller lifecycle (forms → account → order) | [`uk-reseller-lifecycle/`](uk-reseller-lifecycle/) | Email (Resend) | 🇬🇧 UK | Draft — not approved for send | Free trial, order request, signup and portal-order service emails |
| UK Pro trial follow-up | [`uk-pro-trial-follow-up/`](uk-pro-trial-follow-up/) | Email (Resend) | 🇬🇧 UK | Draft — disabled | Manual post-trial result, service-maths and order conversation |
| UK Pro order follow-up | [`uk-pro-order-follow-up/`](uk-pro-order-follow-up/) | Email (Resend) | 🇬🇧 UK | Draft — disabled | Manual post-order first-service, retail and next-order conversation |

_Keep this table current — it is the single campaign register._

## Content-derived campaigns

Campaigns built from the content programme — the Salon Business Brief, lifecycle inserts, seasonal triggers and tool-triggered follow-ups — are governed by **Strategy › Content-Triggered Campaigns** (`../00-strategy/07-content-triggered-campaigns.md`). The article → campaign map is `content/06-distribution/`. They are ordinary campaign folders and follow every rule below.

## Master email template

All branded campaign emails are controlled by one shared renderer:

- `_shared/master-template.js` — global email HTML, typography, spacing, CTA, signature, footer and responsive behaviour;
- `_shared/build-all.js` — validates campaign manifests and regenerates every branded campaign email;
- `_shared/README.md` — editing and build instructions;
- each campaign’s `email-data.json` — campaign-specific copy, links, tokens and content blocks.

Run from the repository root:

```bash
node email/campaigns/_shared/build-all.js
```

A change to the master renderer followed by this build updates the generated HTML for AU salon seeding, AU account flow, UK stockist recruitment and UAE/Dubai stockist recruitment together.

Campaign copy belongs in `sequence.md` and `email-data.json`. Do not hand-edit generated branded HTML and expect the change to survive the next build.

## Every campaign folder has the same shape

```text
<campaign>/
  README.md       — brief, audience, offer, cadence, status and file index
  sequence.md     — subject lines, preview text and body copy
  email-data.json — structured branded-email content used by the master renderer
  studio.json     — UI name, status, owner, mode and send-day timeline
  whatsapp.md     — WhatsApp copy when used
  onboarding.md   — post-reply copy when used
  emails/         — generated sendable HTML, one file per branded email
  docs/           — playbooks, guides and PDFs; reference material only
```

Plain-text-only emails remain in `sequence.md` and do not require an HTML file.

## How to add a campaign

1. Copy `_TEMPLATE` to `<market>-<audience>-<action>`.
2. Complete `README.md` and `sequence.md`.
3. Add branded messages to `email-data.json`.
4. Add `studio.json`; the Live Emails UI discovers the campaign automatically.
5. Register send timing, the local message alias and exact runtime variables in `shared/campaign-registry.js` when the campaign will be sent by the outreach worker.
6. Run the shared build and `npm test`.
7. Add the campaign to the table above.

## Live-site publishing

The repository is the source of truth. Vite bundles every `email-data.json`, `studio.json` and referenced HTML file during `npm run build`; there is no hard-coded campaign import list.

When the repository is connected to Vercel, each push creates a deployment. Content becomes visible as soon as that deployment is ready. A repository-backed site cannot expose an unbuilt commit: if content must change without a deployment, it needs to move to a runtime CMS or database instead.

Before deploying repository email HTML, run:

```bash
npm run templates:check
```

The check verifies the 14 production outreach messages against the worker's application-owned variable contract. Resend receives fully rendered HTML at send time; there is no Resend Template publishing step.

## Conventions

- Folder names use `kebab-case` and normally follow `<market>-<audience>-<action>`.
- Email filenames are numbered by send order: `1-`, `2-`, and so on.
- `email-data.json` may use either `output`/`title` or `file`/`subject`; the Studio normalises both forms.
- `studio.json.days` must have one entry per message and is the timeline shown in the Studio.
- Every message must define its ESP syntax, merge tags, hosted assets and unsubscribe behaviour.
- Status values are `Draft` → `Ready` → `Live` → `Archived`.
- Commercial facts, availability, prices, fulfilment, legal claims and market permissions must come from approved current sources rather than generated assumptions.
