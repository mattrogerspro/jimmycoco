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

The runtime validator accepts only the two production recruitment campaign IDs and validates their 14 repository-rendered messages. It performs no network writes, so historical files cannot be republished accidentally through the standard repository command.

| Command | Expected result |
|---|---|
| `npm run templates:check` | Validates all 14 current UK/U.S. repository-rendered messages. |
| `node scripts/validate-runtime-email-templates.js --only jc-uk-prospect-01-trial-v2` | Validates the requested current runtime message. |
| `node scripts/validate-runtime-email-templates.js --only au-seeding-1-opener` | Refuses the non-launch alias. |

> No remote template was deleted or published and no email was sent during archive cleanup. No automation was enabled.

## Before releasing either V2 sequence

Review the eligible contact segment, sender identity, live trial link, footer, unsubscribe rendering and one seed email per market. Publish/enable only after explicit release approval.
