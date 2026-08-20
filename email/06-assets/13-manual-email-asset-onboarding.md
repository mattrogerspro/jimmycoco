# Manual Email Asset Onboarding

Use this checklist to move an existing repository image into governed production email use.

## 1. Select the source

Choose the exact original under `assets/images/`. Do not rename, overwrite, regenerate or retouch the source as part of email preparation.

Record:

- exact repository path;
- asset category;
- owner or rights holder;
- rights/consent reference;
- expiry, if applicable;
- markets permitted;
- channels permitted;
- campaign purposes permitted;
- crop or identity restrictions.

## 2. Create derivatives

Create email-ready exports under `assets/email/<category>/`.

Recommended starting points:

- editorial or product hero: 600 px wide;
- contained product image: 220–300 px wide at rendered size;
- mobile alternate crop: approximately 480 px wide when a materially different crop is required.

Use the export guidance in this folder. Preserve product labels, packaging, skin tone, faces and results. Optimise file weight without visible degradation.

## 3. Host derivatives

Upload the exact approved derivative files to a stable public HTTPS asset host. A private GitHub path, local path or expiring signed URL is not suitable for production email.

Record the final permanent URL for desktop and mobile derivatives.

## 4. Add the manifest record

Copy `asset-record-template.json` into the `assets` array in `asset-manifest.json` and complete every field.

Keep `status` as `REVIEW_REQUIRED` while any field is incomplete.

Required before approval:

- verified source path;
- rights owner and reference;
- allowed channels including `email`;
- allowed markets;
- allowed purposes;
- desktop derivative path, URL, width and height;
- mobile derivative where required;
- approved alt text;
- crop/identity restrictions;
- approver and approval timestamp.

Change to `APPROVED` only after review.

## 5. Declare campaign scope

A campaign using images must declare top-level metadata in `email-data.json`:

```json
{
  "market": "US",
  "purpose": "professional-outreach"
}
```

These values must match the asset record's allowed markets and purposes.

## 6. Reference the asset

Use only the asset ID in campaign content:

```json
{
  "type": "heroImage",
  "assetId": "product-Malibu-professional-hero"
}
```

Do not paste a different URL, dimensions or alt text into campaign JSON. The build resolves those fields from the manifest.

## 7. Validate

From the repository root:

```bash
node email/campaigns/_shared/build-all.js --check
```

For one campaign:

```bash
node email/campaigns/_shared/build-all.js us-west-coast-salon-stockist --check
```

The build must fail if image governance is incomplete. Fix the manifest or campaign scope; do not weaken validation to make an unapproved asset pass.

## 8. Generate and review

Generate the campaign:

```bash
node email/campaigns/_shared/build-all.js us-west-coast-salon-stockist
```

Review:

- desktop and mobile rendering;
- Outlook/Gmail/Apple Mail where available;
- image-blocked state;
- alt text;
- link destination;
- image scaling and file weight;
- correct person/product identity;
- rights and market wording;
- plain-text equivalent.

## 9. Commit together

Commit the following together where practical:

- derivative files;
- manifest update;
- campaign `email-data.json` change;
- regenerated HTML;
- updated sequence or asset plan;
- approval evidence reference.

## 10. Replacement and expiry

When rights expire or an asset is replaced:

- change the old manifest status to `EXPIRED` or `DEPRECATED`;
- remove its market/channel/purpose permissions;
- identify the replacement asset ID;
- rebuild affected campaigns;
- verify no generated production HTML still references the retired URL.
