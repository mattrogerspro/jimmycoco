# Repository routing map

Read the canonical generator prompt first. Use this file only to route to current sources; repository content wins over this map if paths evolve.

## Always read for campaign production

- `README.md`
- `email/README.md`
- `email/campaigns/README.md`
- `email/campaigns/_shared/README.md`
- `email/campaigns/_shared/EMAIL-CAMPAIGN-GENERATOR-PROMPT.md`
- `email/campaigns/_shared/master-template.js`
- `email/campaigns/_shared/build-all.js`

## Read by decision area

- Audience, purpose, frequency and measurement: `email/00-strategy/`
- Email-safe layout and accessibility: `email/01-design-system/`
- Renderer and component contracts: `email/02-template-system/`
- Lifecycle collision checks: relevant folder under `email/03-sequences/`
- Voice, claims, subjects and CTAs: `email/04-copy-system/`
- AI provenance and review: `email/05-ai-production/`
- Asset approval, rights and derivatives: `email/06-assets/`
- Resend, consent, suppression and release: `email/07-resend-integration/`

Read each area's README or index before selecting its relevant documents.

## Campaign data ownership

| Concern | Canonical source |
|---|---|
| Brief, audience, offer, exclusions, handoff | campaign `README.md` |
| Human-readable sequence and plain text | campaign `sequence.md` |
| Branded renderer input | campaign `email-data.json` |
| Studio name, status, mode and timeline | campaign `studio.json` |
| Generated preview/send HTML | campaign `emails/` |
| Runtime cadence, IDs, variables and exit rules | `shared/campaign-registry.js` |
| Shared email rendering | `email/campaigns/_shared/master-template.js` |
| Resend release comparison | `scripts/sync-resend-templates.js` |
| Outreach data and webhooks | `api/`, `supabase/`, `vercel.json` |

## Comparable campaign selection

Choose the closest campaign by audience, market, commercial outcome and message mode—not by filename alone. State which campaign was selected and why. Do not copy market-specific facts, legal assumptions, prices, assets or timing without current approval.
