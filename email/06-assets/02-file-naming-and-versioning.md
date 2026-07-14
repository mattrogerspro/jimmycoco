# File Naming and Versioning

## Purpose

Create unambiguous filenames and version rules for email assets so approved files can be identified, replaced and audited safely.

## Core rule

Filenames support discovery. The manifest remains the source of truth.

Never rely on names such as `final`, `final2`, `new`, `latest`, `approved-new` or `use-this`.

## Naming pattern

Use:

`[brand]-[channel]-[class]-[descriptor]-[role]-[market]-[size]-v[major.minor].[ext]`

Example:

`sunless-email-product-tan-souffle-dark-hero-global-1200x800-v1.0.webp`

## Required components

### Brand

Use `sunless`.

### Channel

Use `email`.

### Class

Examples:

- `product`
- `celebrity`
- `customer-result`
- `brand`
- `editorial`
- `campaign`
- `lifecycle`
- `template`
- `background`
- `icon`

### Descriptor

Use a concise, human-readable identifier. Match approved product or campaign terminology.

### Role

Examples:

- `hero`
- `product-card`
- `routine`
- `proof`
- `banner`
- `mobile`
- `desktop`
- `fallback`
- `dark`

### Market

Use a market code or `global` only when rights, product and copy use are truly global.

### Size

Use actual pixel dimensions, not vague labels.

## Character rules

- lowercase only;
- hyphens between tokens;
- no spaces;
- no punctuation other than hyphen and version decimal;
- no customer names or sensitive data;
- no celebrity name in a public filename unless approved;
- keep names readable and reasonably short.

## Version rules

Increment the major version when:

- the source asset changes;
- the crop materially changes;
- product packaging changes;
- rights or usage context changes;
- a person or proof image is replaced;
- composition or meaning changes;
- embedded text changes materially.

Increment the minor version when:

- compression changes;
- dimensions change without changing the crop meaning;
- metadata is corrected;
- small non-substantive export adjustments occur.

## Derivative naming

Derivatives must preserve the source descriptor and add role, market, size and version.

Example source:

`sunless-source-product-face-brush-v1.0.webp`

Email derivatives:

- `sunless-email-product-face-brush-hero-global-1200x900-v1.0.webp`
- `sunless-email-product-face-brush-product-card-global-600x600-v1.0.webp`
- `sunless-email-product-face-brush-hero-mobile-global-750x1000-v1.0.webp`

## Campaign assets

Include the stable campaign ID rather than a temporary slogan.

Example:

`sunless-email-campaign-summer-glow-2026-hero-uk-1200x800-v1.0.webp`

## Protected person assets

Use internal person IDs where public naming creates rights, privacy or workflow risk.

Example:

`sunless-email-celebrity-person-004-portrait-uk-800x1000-v1.0.webp`

## Approval and status

Do not put approval status inside the production filename. Store it in the manifest and directory state.

Approved and rejected files must not share the same delivery location.

## Hosted URL versioning

When an approved asset changes, use a new versioned path or cache-busting key. Do not overwrite a live URL when the visual or meaning changes.

## Replacement rule

A replacement asset must identify:

- replaced asset ID;
- replacement asset ID;
- effective date;
- affected templates or messages;
- whether old sends may continue to display the previous asset;
- whether CDN invalidation is required.

## Prohibited patterns

Do not use:

- `final-final.webp`
- `new-product.webp`
- `kim-edited.webp`
- `best-version.webp`
- `image1.webp`
- `approved.jpg` without asset identity;
- filenames containing customer email, order number or private data.

## Release rule

A filename, manifest version, hosted URL and approved export must all describe the same asset state before production use.