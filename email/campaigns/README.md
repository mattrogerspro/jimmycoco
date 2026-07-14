# Campaigns

Home for every **outreach & marketing campaign** — cold acquisition, stockist recruitment and partner journeys. One folder per campaign, each holding its full sequence: written content and sendable code, side by side.

> **Separate from `../03-sequences/`:** that folder is maintained by the automated lifecycle-sequence builder. Outreach campaigns live here so the two systems never collide.

## Campaign registry

| Campaign | Folder | Channel | Market | Status | Hook |
|---|---|---|---|---|---|
| AU salon seeding (cold outreach) | [`au-salon-seeding/`](au-salon-seeding/) | Email + WhatsApp | 🇦🇺 AU | Draft | Free sample before summer |
| AU salon account flow (post-sample) | [`au-salon-account-flow/`](au-salon-account-flow/) | Email + WhatsApp | 🇦🇺 AU | Draft | Sample → terms → first order |
| UK salon stockist recruitment | [`uk-salon-stockist/`](uk-salon-stockist/) | Email (MailerLite) | 🇬🇧 UK | Email 1 live | “Your clients already know this name” |
| UAE / Dubai salon stockist recruitment | [`uae-dubai-salon-stockist/`](uae-dubai-salon-stockist/) | Email (Resend-ready) | 🇦🇪 UAE | Draft | Premium professional trial for Dubai partners |

_Keep this table current — it is the single campaign register._

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
4. Register the manifest path in `_shared/build-all.js`.
5. Run the shared build.
6. Add the campaign to the registry above.

## Conventions

- Folder names use `kebab-case` and normally follow `<market>-<audience>-<action>`.
- Email filenames are numbered by send order: `1-`, `2-`, and so on.
- Every message must define its ESP syntax, merge tags, hosted assets and unsubscribe behaviour.
- Status values are `Draft` → `Ready` → `Live` → `Archived`.
- Commercial facts, availability, prices, fulfilment, legal claims and market permissions must come from approved current sources rather than generated assumptions.
