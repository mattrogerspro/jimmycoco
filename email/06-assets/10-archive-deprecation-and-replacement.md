# Archive, Deprecation and Replacement

## Purpose

Define how email assets leave active production without losing historical traceability or allowing outdated files to re-enter future sends.

## Lifecycle states

Use:

- `DRAFT`
- `IN_REVIEW`
- `APPROVED`
- `APPROVED_WITH_LIMITS`
- `EXPIRED`
- `DEPRECATED`
- `REJECTED`
- `ARCHIVED`

## Deprecation triggers

Deprecate an asset when:

- product packaging changes;
- a product or variant is discontinued;
- rights or consent expire;
- a campaign ends;
- brand treatment changes;
- a higher-quality replacement is approved;
- embedded copy becomes outdated;
- the asset no longer meets accessibility or performance standards;
- a person withdraws permission;
- a technical format is no longer supported.

## Replacement record

Every replacement should record:

- previous asset ID;
- replacement asset ID;
- reason;
- effective date;
- owner;
- affected products, variants, campaigns, sequences and templates;
- hosted URL action;
- cache action;
- historical-display policy;
- completion status.

## Active-reference audit

Before deprecating, identify references in:

- lifecycle templates;
- campaign templates;
- scheduled broadcasts;
- reusable modules;
- product mappings;
- shade-match outputs;
- cart and browse payloads;
- VIP benefits;
- transactional messages;
- test fixtures and screenshots;
- documentation and prompt examples.

## Archive structure

Recommended:

```text
archive/
├── sources/
├── derivatives/
├── manifests/
├── approvals/
├── rights/
├── campaign-records/
└── rejected/
```

Approved historical files and rejected drafts must remain clearly separated.

## Historical sends

Preserve enough information to reconstruct what was sent:

- asset ID and version;
- hosted URL or storage key;
- message or template version;
- market;
- send date;
- approval state at send time;
- source and rights record.

Do not rewrite historical records when a replacement is introduced.

## Hosted-asset replacement

Avoid overwriting a live URL when meaning, product appearance, person, proof or offer changes.

Use a new versioned URL unless legal, rights or emergency withdrawal requirements demand replacement at the existing location.

Consider that email clients may proxy or cache old images, so URL replacement may not update every previously delivered message.

## Emergency removal

For urgent rights, safety or accuracy issues:

1. block the asset immediately;
2. stop scheduled sends;
3. locate recurring-template references;
4. replace with an approved neutral fallback where possible;
5. escalate hosted-URL action;
6. document impact and residual cache risk;
7. complete a post-incident review.

## Rejected assets

Rejected generations and drafts should record:

- reason for rejection;
- source assets;
- prompt or workflow version;
- reviewer;
- date;
- whether the failure informs future prompt or QA changes.

Rejected assets must never share production paths or ambiguous filenames with approved exports.

## Retention

Retention periods should be approved according to:

- legal and contractual obligations;
- consent records;
- campaign audit needs;
- product and packaging history;
- customer privacy requirements;
- operational troubleshooting;
- storage policy.

Do not retain personal or customer-supplied data longer than approved simply because it is embedded in an asset workflow.

## Restoration

An archived or deprecated asset may return to production only after:

- current rights review;
- product and packaging review;
- market review;
- accessibility review;
- responsive export review;
- new approval;
- new active version and manifest state.

Prior approval does not automatically reactivate an asset.

## Completion criteria

Deprecation is complete only when:

- status is updated;
- production selectors no longer return the old asset;
- scheduled sends are resolved;
- replacements are approved and mapped;
- active template references are updated;
- archive records are complete;
- stakeholders are notified where required.