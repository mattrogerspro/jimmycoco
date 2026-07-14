# Asset Migration and Preparation Plan

## Purpose

Prepare every website and email asset for controlled production use without losing source fidelity, rights information, variant accuracy or responsive quality.

## Asset migration sequence

### 1. Inventory

Collect and identify:

- logos and brand marks;
- typography licences and approved web usage;
- product photography;
- packaging and variant imagery;
- celebrity photography;
- customer-result and testimonial assets;
- campaign photography;
- decorative imagery;
- icons and illustrations;
- video and animation;
- existing website and email derivatives.

### 2. Classify

Assign each source:

- canonical asset ID;
- asset type;
- product, variant, person or campaign relationship;
- source location;
- owner;
- rights and consent state;
- permitted channels and markets;
- expiry date;
- protected or generative classification;
- current approval state.

### 3. Resolve duplicates

For duplicate or near-duplicate files:

- identify the true canonical source;
- compare resolution, crop, colour and packaging version;
- preserve historical versions where needed;
- deprecate ambiguous copies;
- create redirects or replacement mappings for referenced derivatives.

### 4. Validate protected assets

Product, celebrity and customer-result assets require explicit comparison against approved originals.

Reject assets with:

- altered packaging;
- incorrect product colour;
- stretched proportions;
- retouched or regenerated celebrity details;
- undocumented customer-result edits;
- missing rights or usage evidence;
- expired approval.

### 5. Produce channel derivatives

Create approved derivatives for:

- website desktop;
- website mobile;
- high-density displays;
- email desktop;
- email mobile;
- social preview where required;
- structured data or commerce feeds where applicable.

Do not rely on one universal crop for all contexts.

### 6. Optimise

For each derivative:

- select the correct format;
- remove unnecessary metadata;
- preserve appropriate colour profile;
- set intrinsic dimensions;
- compress against a visual-quality threshold;
- validate transparency;
- create fallbacks where required;
- record file size and dimensions.

### 7. Add accessibility metadata

Record:

- functional alt text;
- empty-alt instruction where decorative;
- long-description requirement where relevant;
- focal point;
- mobile crop note;
- whether text is embedded in the image;
- blocked-image fallback.

### 8. Publish and map

Host only approved production derivatives.

Record:

- stable URL;
- cache policy;
- content hash or version;
- source asset ID;
- derivative purpose;
- release state;
- replacement asset where applicable.

## Folder and storage requirements

Keep distinct locations for:

- canonical sources;
- working files;
- generated concepts;
- review exports;
- approved production derivatives;
- deprecated assets;
- rights and approval records.

A generated or review file must never be selectable through the same path convention as an approved production asset.

## Product migration checklist

For every product and variant:

- current packaging confirmed;
- canonical product ID mapped;
- variant and shade mapped;
- primary image selected;
- secondary views selected;
- transparent product cut-out available where required;
- website crops approved;
- email crops approved;
- alt text approved;
- market availability recorded;
- retired versions deprecated.

## Celebrity and customer-result checklist

- person or result record identified;
- source file preserved unchanged;
- rights owner recorded;
- channel and market scope recorded;
- permitted crop and treatment recorded;
- expiry and withdrawal process defined;
- no AI regeneration or retouching;
- production derivatives visually compared with the original.

## Migration manifest

Recommended fields:

```yaml
asset_id: AST-...
source_path: ""
source_sha: ""
asset_type: product | celebrity | customer_result | campaign | brand | decorative
protected: true
approval_status: APPROVED
rights_status: VALID
rights_expiry: null
product_id: null
variant_id: null
person_id: null
market_scope: [GB]
channel_scope: [website, email]
derivatives:
  - purpose: website-hero-desktop
    path: ""
    width: 0
    height: 0
    format: webp
    bytes: 0
    alt_text: ""
reviewer: ""
approved_at: ""
```

## Acceptance criteria

Asset migration is complete when:

- every production reference resolves to an approved manifest record;
- no protected asset has been generatively altered;
- product and variant mappings are accurate;
- rights are valid for intended use;
- website and email responsive derivatives exist;
- accessibility metadata is present;
- deprecated or expired assets cannot be selected accidentally;
- all production URLs are stable, versioned and testable.