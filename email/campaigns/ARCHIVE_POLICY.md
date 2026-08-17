# Jimmy Coco Pro — Current Campaigns and Archive Policy

## Current sequences

Only the following recruitment sequences are **current** in the marketing/playbook system and eligible for future release review.

| Market | Campaign | Resend templates | Cadence | State |
|---|---|---:|---|---|
| UK | UK Jimmy Coco Pro Recruitment — V2 | 5 | Days 0, 3, 7, 12 and 18 | Draft; not sent or automated |
| US West Coast | US West Coast Jimmy Coco Pro Recruitment — V2 | 5 | Days 0, 4, 8, 13 and 19 | Draft; not sent or automated |

The two recently created transactional trade drafts are preserved separately as implementation assets. They are not shown as a recruitment sequence and are not wired to the website/backend.

## Archived research

All other local campaign folders are kept as **archived research**, including earlier UK, US, AU, UAE, IE and test campaigns. The Overview and Sequences screens hide them by default. Select **View archived** in the Sequences screen to inspect them; each campaign and message is labelled `Archived`.

All 57 older Resend templates were renamed with an `ARCHIVED` prefix. Their content was not deleted. Resend does not expose a native archive/unpublish status through the available management interface, so the label is the retained-history mechanism. The corresponding legacy automation remains disabled.

## Release safeguard

The repository publishing script now accepts only the two V2 recruitment campaign IDs. It validates ten local templates. It rejects an archived alias, so historical files cannot be republished accidentally through the standard repository command.

| Command | Expected result |
|---|---|
| `npm run templates:check` | Validates only 10 current V2 recruitment templates. |
| `node scripts/sync-resend-templates.js --only jc-uk-prospect-01-trial-v2` | Validates the requested current V2 template. |
| `node scripts/sync-resend-templates.js --only au-seeding-1-opener` | Refuses the archived alias. |

> No template was deleted, published or sent during archive cleanup. No automation was enabled.

## Before releasing either V2 sequence

Review the eligible contact segment, sender identity, live trial link, footer, unsubscribe rendering and one seed email per market. Publish/enable only after explicit release approval.
