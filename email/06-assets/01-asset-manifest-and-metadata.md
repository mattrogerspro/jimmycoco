# Asset Manifest and Metadata

## Purpose

Define the minimum metadata required to make every email asset searchable, traceable, legally usable and safe for production.

## Canonical manifest record

Each source asset and derivative should have one structured record.

```yaml
asset_id: EMAIL-ASSET-[CLASS]-[NAME]-[NNNN]
source_asset_id: null
asset_class: PRODUCT
protection_class: P1
status: APPROVED
version: 1.0
filename: example.webp
storage_location: assets/email/product/example.webp
source_location: assets/images/product-images/example.webp
checksum: null
owner: null
approver: null
created_at: null
approved_at: null
review_due_at: null
rights_start_at: null
rights_end_at: null
markets: []
channels: [EMAIL]
lifecycle_tags: []
module_roles: []
product_ids: []
variant_ids: []
people_ids: []
campaign_ids: []
width_px: null
height_px: null
aspect_ratio: null
file_format: WEBP
file_size_bytes: null
alt_text: null
empty_alt_allowed: false
mobile_asset_id: null
dark_mode_asset_id: null
fallback_asset_id: null
transformation_record: null
usage_limits: null
source_evidence: []
notes: null
```

## Required identity fields

### `asset_id`

Stable identifier that does not change when a filename or storage URL changes.

Recommended pattern:

`EMAIL-ASSET-[CLASS]-[DESCRIPTOR]-[SEQUENCE]`

Example:

`EMAIL-ASSET-PRODUCT-TAN-SOUFFLE-DARK-0001`

### `source_asset_id`

Required for every derivative. It identifies the immutable or authoritative source.

### `version`

Tracks meaningful changes to crop, composition, rights, wording, product presentation or export specification.

## Classification fields

Required:

- asset class;
- protection class;
- approval status;
- lifecycle tags;
- module roles;
- market limitations;
- channel eligibility.

## Product metadata

Product imagery should include:

- product ID;
- variant ID;
- approved product name;
- packaging version;
- shade or colour identifier;
- catalogue status;
- current replacement asset, if any;
- whether the image shows one product or a routine grouping.

Do not infer a variant from filename or appearance alone.

## Person and proof metadata

Celebrity, founder, professional and customer-result assets should include:

- internal person or permission ID;
- usage type;
- approved context;
- territory;
- start and end dates;
- credit requirement;
- copy restrictions;
- crop limitations;
- whether association or endorsement language is permitted;
- evidence and approval references.

The manifest must never convert image possession into endorsement permission.

## Rights metadata

At minimum record:

- rights owner;
- licence or consent reference;
- permitted channels;
- permitted markets;
- permitted purposes;
- alteration permissions;
- start date;
- end date;
- renewal owner;
- required credit;
- restrictions.

Unknown rights means the asset is blocked.

## Transformation record

Every derivative should document:

- source asset ID;
- crop coordinates or crop description;
- resize dimensions;
- background removal;
- colour conversion;
- compression settings;
- masking;
- compositing;
- generative elements, if any;
- tool and version;
- operator;
- date;
- reviewer.

Protected assets require a record even when only resized.

## Accessibility metadata

Include:

- functional purpose;
- approved alt text;
- whether empty alt is permitted;
- whether adjacent copy provides equivalent meaning;
- text embedded in image;
- long-description requirement;
- mobile alt-text difference, if function changes.

## Technical metadata

Record:

- pixel dimensions;
- aspect ratio;
- file type;
- colour profile;
- transparency;
- file size;
- density/export scale;
- animation state;
- fallback format;
- hosted URL or key;
- cache version;
- integrity checksum where used.

## Approval metadata

Production records require:

- owner;
- reviewer;
- approver;
- approval date;
- review due date;
- known exceptions;
- replacement or deprecation reference.

## Validation rules

Block production when:

- status is not approved;
- source asset is missing;
- rights are absent or expired;
- product or variant mapping is ambiguous;
- protected-asset transformation is undocumented;
- required mobile crop is missing;
- alt-text decision is unresolved;
- file dimensions or format do not match the target module;
- an approved asset has been superseded.

## Manifest ownership

The manifest is operational data and must be maintained as carefully as product or lifecycle configuration. A folder of images without metadata is not a production asset library.