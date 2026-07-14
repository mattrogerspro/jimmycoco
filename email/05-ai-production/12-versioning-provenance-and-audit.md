# Versioning, Provenance and Audit

## Purpose

Define how every AI-assisted email output is identified, reproduced, reviewed and investigated throughout its lifecycle.

## Core rule

No AI-assisted asset may enter production without a complete provenance record linking the final output to its source data, source assets, prompt, tool, reviewer and approval state.

## Production record

Store for every item:

- production item ID;
- message, campaign or sequence ID;
- asset type;
- owner;
- creation date;
- source file paths and hashes where available;
- source-data version or retrieval timestamp;
- prompt ID and version;
- complete prompt text;
- model, tool and version;
- relevant generation settings;
- seed where supported;
- generated draft identifiers;
- transformations performed after generation;
- final export path;
- template version;
- reviewer and approver;
- approval date and status;
- superseded item;
- exception record where applicable.

## Version identifiers

Use:

`EMAIL-[CHANNEL]-[TYPE]-[PURPOSE]-v[MAJOR.MINOR.PATCH]`

Examples:

- `EMAIL-AI-IMAGE-SHADE-HERO-v1.2.0`
- `EMAIL-AI-COPY-VIP-WELCOME-v2.0.1`
- `EMAIL-AI-QA-PRODUCT-COMPOSITE-v1.0.0`

Increment:

- major when the concept, output contract, protected-asset method or compliance basis changes;
- minor when a meaningful approved creative or copy change is introduced;
- patch for corrections that do not change intent or structure.

## File naming

Approved exports should include:

- item ID;
- intended module or breakpoint;
- locale or market where relevant;
- version;
- approval state only when not stored in a dedicated approved directory.

Example:

`shade-result-hero-mobile-en-gb-v1.2.0.webp`

Avoid names such as:

- `final-final.webp`;
- `new-version.png`;
- `approved2.jpg`;
- `use-this-one.webp`.

## Source hashing

Where tooling permits, record a cryptographic hash for protected images, logos and final exports.

A changed hash must trigger review when the asset is expected to remain unchanged.

Hash comparison does not replace visual review. It confirms file identity, not correct presentation.

## Transformation log

Record every post-generation action, including:

- crop;
- resize;
- mask;
- background removal;
- colour conversion;
- compression;
- compositing;
- typography overlay;
- metadata removal;
- format conversion.

For protected assets, record the exact operation and confirm that no generative transformation occurred.

## Approval history

Do not overwrite prior approval records.

Store:

- submitted version;
- reviewer comments;
- changes requested;
- revised version;
- final decision;
- date and decision owner;
- any later withdrawal or supersession.

## Audit questions

A complete record must answer:

- why was this item created?
- who was eligible to receive it?
- which source facts were used?
- which images were protected?
- what was generated?
- what was not allowed to change?
- which model and prompt produced the draft?
- what did a human modify?
- who approved the production version?
- which exact file and template were sent?
- can the output be reproduced or explained?

## Storage separation

Maintain distinct locations for:

- source inputs;
- working drafts;
- rejected drafts;
- approved masters;
- production exports;
- superseded versions;
- audit records.

Production systems must reference only approved production exports.

## Data minimisation

Do not store unnecessary customer data inside prompts, filenames, image metadata or general asset archives.

Use stable internal identifiers rather than personal information wherever possible.

Redact or isolate sensitive production records according to approved access and retention policy.

## Retention

Retention periods must reflect:

- legal and rights requirements;
- campaign and claim substantiation needs;
- operational investigation needs;
- customer-data minimisation;
- model and prompt evaluation;
- contractual obligations.

Do not keep personal data merely because it was included in an old prompt.

## Incident investigation

When an AI-assisted output causes or may cause harm, preserve:

- production payload;
- final rendered email;
- source data snapshot;
- source assets;
- prompt and model details;
- approval history;
- delivery and event records;
- customer-impact scope;
- remediation decisions.

Do not silently replace files before preserving the incident state.

## Release blockers

Block production when:

- the prompt or model cannot be identified;
- source assets are missing;
- the approved export cannot be distinguished from drafts;
- protected-asset transformations are undocumented;
- approval history is incomplete;
- the final production file differs from the reviewed version;
- personal data is stored in an uncontrolled prompt or archive;
- a superseded item remains addressable by production tooling.

Traceability is part of quality. An attractive output with no reliable provenance is not a production asset.