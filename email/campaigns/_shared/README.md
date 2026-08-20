# Shared Campaign Email Master

This folder contains the single source of truth for branded campaign-email production.

## Files

- `EMAIL-CAMPAIGN-GENERATOR-PROMPT.md` — mandatory system prompt for any AI or agent creating, editing, localising or extending a campaign.
- `master-template.js` — shared email-safe HTML layout, typography, spacing, image modules, CTA, signature and footer system.
- `build-all.js` — validates campaign content and approved image usage, then regenerates every branded campaign email.

## Mandatory generator rule

Any automated campaign generator must read and follow:

- `EMAIL-CAMPAIGN-GENERATOR-PROMPT.md`;
- `../../06-assets/12-campaign-generator-image-rules.md`;
- `../../06-assets/asset-manifest.json`.

A campaign created without this preflight is non-compliant even when the resulting HTML appears visually acceptable.

## Build commands

From the repository root:

```bash
node email/campaigns/_shared/build-all.js
```

Rebuild one campaign:

```bash
node email/campaigns/_shared/build-all.js us-west-coast-salon-stockist
```

Validate all registered campaigns without rewriting HTML:

```bash
node email/campaigns/_shared/build-all.js --check
```

The build reads the registered campaign manifests and writes HTML under each campaign's `emails/` directory. It also validates every image reference against `email/06-assets/asset-manifest.json`.

## Registered campaigns

- `../au-salon-seeding/email-data.json`
- `../au-salon-account-flow/email-data.json`
- `../uk-salon-stockist/email-data.json`
- `../uae-dubai-salon-stockist/email-data.json`
- `../us-west-coast-salon-stockist/email-data.json`
- `../au-new-salon-outreach-test/email-data.json`

## What updates globally

Editing `master-template.js` updates all generated campaign templates on the next build, including:

- page background and maximum width;
- approved image logo (`assets/email/logo.webp`, hosted as `/email-assets/logo.webp`);
- typography and spacing;
- paragraph, list, offer and quote styling;
- image and product modules;
- CTA styling;
- signature and footer;
- mobile behaviour;
- hidden preview treatment.

Campaign-specific copy, subjects, links, tokens, message blocks and approved asset IDs remain in each campaign's `email-data.json`.

## Supported block types

### Content

- `paragraph`
- `subheading`
- `bullets`
- `offer`
- `quote`
- `divider`
- `cta`
- `note`
- `small`

### Images

- `image` — standard full-width or contained image;
- `heroImage` — prominent editorial campaign image;
- `productFeature` — image and product copy split;
- `imageText` — reusable image/copy split;
- `productGrid` — multiple approved product assets;
- `proofStrip` — dark-backed strip of approved proof or celebrity assets.

## Image source contract

Campaign JSON references images by `assetId`, not arbitrary URL:

```json
{
  "type": "heroImage",
  "assetId": "product-Malibu-professional-hero"
}
```

`build-all.js` resolves the approved public URL, dimensions and alt text from the asset manifest. It fails the build when an asset is unknown, not `APPROVED`, not permitted for email, not permitted for the campaign market or purpose, missing approval provenance, missing alt text, or missing a stable public HTTPS derivative.

Campaigns using images must declare top-level fields:

```json
{
  "market": "US",
  "purpose": "professional-outreach"
}
```

The asset's `allowedMarkets` and `allowedPurposes` must include those values or `global`.

## Production rule

Do not hand-edit generated HTML as the primary source. Edit either:

1. `master-template.js` for a global design or system change;
2. the relevant campaign's `email-data.json` and `sequence.md` for campaign content;
3. `email/06-assets/asset-manifest.json` for an approved asset record.

Then run `--check`, regenerate, and review the HTML in priority email clients.

## Merge tags

The master preserves merge tags exactly as supplied in campaign data. Each campaign remains responsible for syntax supported by its ESP, such as Resend application tokens or MailerLite merge tags.
