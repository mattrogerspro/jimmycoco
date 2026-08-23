# Template Rendering and Production Versions

## Purpose

Define how approved Sunless email templates become immutable, testable production messages before Resend submission.

## Source-of-truth rule

The repository and application own template source, component contracts, approved copy, assets and version history. Resend receives fully validated output or a controlled provider template reference where implementation later requires it.

Provider-side editing must not create an untracked second source of truth. The UK and US prospect campaigns use `deliveryMode: repository-html`: the build produces committed `.html` and `.txt` files plus `shared/campaign-content.generated.js`, and the Resend adapter submits those rendered outputs without a provider template ID.

## Rendering pipeline

1. Resolve the approved message specification.
2. Resolve the immutable template version.
3. Validate dynamic data against the sequence contract.
4. Resolve approved asset versions and hosted URLs.
5. Render HTML and plain text.
6. Run structural, accessibility and link validation.
7. Render representative customer states.
8. create a content checksum.
9. Store the complete rendered snapshot.
10. Submit only after send eligibility is reconfirmed.

## Version identity

Use semantic or similarly explicit versions for:

- template shell;
- reusable components;
- message copy;
- asset bundle;
- data contract;
- rendering adapter.

A production message record must identify every version used.

## Immutable releases

Once approved and referenced by a production send:

- do not alter the release in place;
- create a new version for every material change;
- preserve the previous rendered output and source references;
- mark superseded versions without deleting historical records;
- prevent preview or draft versions from being selected in production.

## Dynamic data

Dynamic values must be typed, validated and escaped for their output context.

Required controls include:

- safe first-name fallback;
- validated product and variant mapping;
- current price and currency at send-decision time;
- explicit stock-state handling;
- locale-aware dates and amounts;
- approved shade and routine terminology;
- maximum practical content lengths;
- fallback behavior for optional modules;
- rejection when required content is missing.

## Link generation

All links must be generated from approved route builders rather than concatenated ad hoc.

Validate:

- environment host;
- market and locale;
- product and selected variant;
- campaign attribution;
- signed or authenticated account route where needed;
- unsubscribe and preference routes;
- absence of preview or localhost URLs.

## Plain text

Plain text is a first-class production output. It must preserve:

- message purpose;
- essential service or offer details;
- primary action;
- support and preference information;
- legal content;
- understandable reading order.

## Render matrix

Before release, render at least:

- valid complete data;
- missing optional name;
- long product name;
- unavailable product fallback;
- one and multiple basket items where applicable;
- each supported market and currency;
- expired or removed offer handling;
- mobile and desktop widths;
- images blocked;
- dark mode where applicable.

## Content checksum

Store a deterministic checksum of the final subject, HTML, text and key metadata. This supports reconciliation, audit and proof that provider submission matched the approved output.

## Release blockers

Do not submit when:

- template status is not approved;
- a dynamic state has not been rendered;
- data-contract validation fails;
- an asset is expired or unapproved;
- HTML and text communicate different terms;
- links resolve to the wrong environment, market or variant;
- content cannot be reproduced from its recorded versions;
- a provider-side edit has not been synchronized back to the source of truth.
