# Campaign Generator Image Rules

These rules are mandatory for every AI or agent creating or modifying branded campaign email.

## Mandatory discovery

Before deciding an email or sequence is text-only, inspect:

- `email/06-assets/asset-manifest.json`;
- relevant source folders under `assets/images/`;
- approved email derivatives under `assets/email/`;
- the closest comparable campaign;
- the supported image blocks in `email/campaigns/_shared/master-template.js`.

Produce an asset candidate table with asset ID, source path, role in the message, approval state, market permission, channel permission, purpose permission, rights state, derivative status, public URL status and alt text.

## Manifest authority

Every image file already present under `assets/` on 22 July 2026 has standing human creative approval. Do not describe one of those source files as unapproved solely because its email manifest record or derivative is incomplete. Files added after that date follow normal approval onboarding.

Every image under `assets/images/celebs/` is pre-approved for all email campaigns, markets and purposes. No per-campaign celebrity-image approval is required. The manifest remains the production delivery contract and must record `email` channel plus `global` market and purpose eligibility.

An image is production-eligible only when its manifest record:

1. has `status: APPROVED`;
2. includes `email` in `allowedChannels`;
3. permits the campaign market or `global`;
4. permits the campaign purpose or `global`;
5. has valid rights and approval provenance;
6. has a desktop email derivative with dimensions;
7. has approved alt text;
8. has a stable public HTTPS URL.

A file outside the dated standing-approval scope is not approved merely because it exists in the repository.

## Template capability

Do not conclude that no approved asset exists merely because a template module is missing.

When a relevant approved asset exists but the shared master lacks the required module:

- report `BLOCKED BY TEMPLATE CAPABILITY`;
- identify the smallest reusable module required;
- add it only to the shared master when authorised;
- never create campaign-specific image HTML;
- never silently fall back to an entirely text-only branded campaign.

The shared master currently supports:

- `image`;
- `heroImage`;
- `productFeature`;
- `imageText`;
- `productGrid`;
- `proofStrip`.

## Deliberate image planning

For each message, state whether it should use an image and why. Images must improve comprehension, desire, proof or product recognition rather than decorate the layout.

Typical sequence roles:

- introduction: brand or professional-product hero;
- education: product, method or approved lifestyle context;
- commercial case: professional solution plus take-home retail;
- onboarding/support: method, training or partner materials;
- close-the-loop: often restrained or text-led.

Cold-deliverability strategy may justify specific plain-text messages. Record that as a deliberate decision, not as a template limitation.

## Campaign JSON contract

Campaign data references assets by `assetId`. Do not paste arbitrary URLs or override manifest alt text.

Example:

```json
{
  "type": "heroImage",
  "assetId": "product-sunset-professional-hero"
}
```

The build system resolves the approved URL, dimensions and alt text from the asset manifest. A mismatch or unapproved asset must fail the build.

For grids and proof strips:

```json
{
  "type": "productGrid",
  "items": [
    {"assetId": "product-professional-solution", "title": "Professional solution"},
    {"assetId": "product-take-home-range", "title": "Take-home range"}
  ]
}
```

## Protected assets

Celebrity files under `assets/images/celebs/` already have standing rights, market, channel and purpose approval for every email campaign. They remain blocked only by missing production delivery requirements such as a stable public derivative, dimensions or alt text, or by a proposed use that would invent an endorsement or violate the AI-generation rules. Do not alter faces, bodies, skin tone, expression, product context or tanning results.

Customer-result assets and celebrity files outside that folder still require their applicable rights and context approvals.

## Required generator behaviour

A generator must not say “no approved assets exist” until it has read the manifest and reported all relevant candidates. When candidates are present but incomplete, report exactly which manual fields or derivatives block use.
