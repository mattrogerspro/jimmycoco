# Shared Campaign Email Master

This folder contains the single source of truth for branded campaign-email production.

## Files

- `EMAIL-CAMPAIGN-GENERATOR-PROMPT.md` — mandatory system prompt for any AI or agent creating, editing, localising or extending a campaign.
- `master-template.js` — shared email-safe HTML layout, typography, spacing, CTA, signature and footer system.
- `build-all.js` — regenerates every branded campaign email from its campaign data manifest.

## Mandatory generator rule

Any automated campaign generator must read and follow `EMAIL-CAMPAIGN-GENERATOR-PROMPT.md` before creating files.

The prompt requires:

- repository preflight and source-document disclosure;
- strategy, lifecycle, copy, asset and delivery checks;
- use of the shared master template;
- structured `email-data.json` content;
- generation rather than hand-maintenance of branded HTML;
- explicit blocking when source truth is unavailable;
- evidence-based QA and human approval.

A campaign created without this preflight is non-compliant even when the resulting HTML appears visually acceptable.

## One-command rebuild

From the repository root:

```bash
node email/campaigns/_shared/build-all.js
```

The build reads:

- `../au-salon-seeding/email-data.json`
- `../au-salon-account-flow/email-data.json`
- `../uk-salon-stockist/email-data.json`
- `../uae-dubai-salon-stockist/email-data.json`
- `../us-west-coast-salon-stockist/email-data.json`

and writes the production HTML files listed in each message's `output` field under the relevant campaign’s `emails/` directory.

To rebuild one campaign without touching sibling output, pass its campaign ID:

```bash
node email/campaigns/_shared/build-all.js us-west-coast-salon-stockist
```

To validate every registered manifest and render it in memory without rewriting HTML:

```bash
node email/campaigns/_shared/build-all.js --check
```

Both `emails/message.html` and the legacy bare `message.html` output form resolve safely inside the campaign's `emails/` directory.

## What updates globally

Editing `master-template.js` updates every generated campaign template on the next build, including:

- page background;
- maximum email width;
- wordmark;
- typography;
- card padding and radius;
- paragraph and list styling;
- offer strips;
- CTA styling;
- signature presentation;
- footer structure;
- mobile behaviour;
- hidden preview treatment.

Campaign-specific copy, subject lines, links, tokens and message blocks remain in each campaign's `email-data.json`.

## Supported block types

- `paragraph`
- `bullets`
- `offer`
- `quote`
- `divider`
- `cta`
- `note`

## Production rule

Do not hand-edit generated HTML as the primary source. Edit either:

1. `master-template.js` for a global design or system change; or
2. the relevant campaign's `email-data.json` and `sequence.md` for message-specific content.

Then run the build and review the regenerated HTML in the priority email clients.

## Merge tags

The master preserves merge tags exactly as provided in campaign data. Each campaign remains responsible for using syntax supported by its ESP, such as Resend-style application tokens or MailerLite merge tags.
