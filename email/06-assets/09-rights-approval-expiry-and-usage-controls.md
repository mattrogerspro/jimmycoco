# Rights, Approval, Expiry and Usage Controls

## Purpose

Define how Sunless confirms that an email asset may legally and operationally be used in a specific message, market and time period.

## Core rule

An asset is not production-eligible merely because it exists, looks approved or has been used before.

Production eligibility requires current rights, correct context, valid approval and an active manifest status.

## Standing repository approval

Every image file already present under `assets/` on 22 July 2026 has standing human creative approval as email source material. Every file under `assets/images/celebs/` is additionally approved for all email markets, purposes and campaign contexts, with no expiry, unless that approval is later explicitly withdrawn.

For those celebrity-folder files, do not require another celebrity, market, campaign or email-channel approval. Continue to enforce immutable-person handling, accurate accompanying copy, manifest traceability, accessibility and production-delivery requirements. The standing approval permits inclusion of the supplied likeness; it does not substantiate endorsement, product use, a quote or any other factual claim.

## Required rights record

For every rights-controlled asset, record:

- asset ID;
- rights owner;
- licence, consent or contract reference;
- approved channels;
- approved markets and territories;
- approved purposes;
- approved products or campaigns;
- permitted transformations;
- start date;
- end date;
- renewal or review date;
- required credit;
- copy restrictions;
- endorsement limitations;
- withdrawal process;
- internal owner;
- legal or rights approver.

## Rights classes

### Owned

Sunless owns the asset and relevant usage rights, subject to any person, location, music, trademark or model restrictions.

### Licensed

Usage is governed by an external licence with defined channel, market, duration and transformation limits.

### Consented

A customer, professional, founder or other person has granted documented permission for specific use.

### Supplied with restrictions

A partner, retailer, publication or agency has supplied the asset for a limited context.

### Unknown

The asset is blocked until rights are verified.

## Approval layers

Depending on the asset, approval may require:

- creative approval;
- product accuracy approval;
- brand approval;
- rights or legal approval;
- customer-consent verification;
- celebrity or talent approval;
- market approval;
- campaign approval;
- accessibility approval;
- final production approval.

One approval does not imply all others.

## Usage-context validation

Before each use, confirm:

- the intended email type is permitted;
- the market is permitted;
- the send date falls within the rights window;
- the accompanying copy is permitted;
- the crop and transformation are permitted;
- the linked product or offer is permitted;
- the asset has not been withdrawn or replaced;
- the person is not being made to imply an unapproved endorsement.

## Celebrity and talent controls

Require explicit approval for:

- use of name;
- use of likeness;
- product association;
- quote or testimonial;
- campaign context;
- promotional versus editorial use;
- paid-media or email use;
- geographic market;
- crop and retouching;
- duration.

Do not infer permission from social media, press coverage or previous publication.

## Customer and testimonial controls

Confirm:

- consent covers email;
- wording and attribution are approved;
- product and result context are accurate;
- withdrawal can be actioned;
- personal data exposure is minimised;
- the asset is not reused beyond the agreed purpose.

## Expiry handling

At or before expiry:

1. set the asset status to `EXPIRED`;
2. prevent new production selection;
3. identify scheduled and recurring sends;
4. replace the asset where required;
5. review hosted URLs and template references;
6. record the expiry action;
7. preserve historical audit records.

## Scheduled-send controls

Campaigns scheduled near an asset-expiry boundary must validate rights at both scheduling and send time.

A message must not send solely because it passed approval earlier when its assets are no longer valid.

## Approval with limits

Use `APPROVED_WITH_LIMITS` only when the manifest clearly records restrictions such as:

- UK only;
- VIP sequence only;
- editorial use only;
- no product endorsement copy;
- no cropping below a specified boundary;
- use before a stated date;
- named campaign only.

The production selector must enforce these limitations.

## Emergency withdrawal

When an asset must be removed urgently:

- block it in the manifest;
- stop scheduled sends using it;
- identify reusable templates and active automations;
- substitute an approved fallback;
- replace hosted content only when legally and operationally appropriate;
- notify owners;
- document the reason and effective time.

## Audit requirements

Retain:

- approval records;
- contracts or consent references;
- versions used;
- messages and campaigns that used the asset;
- dates and markets of use;
- transformations;
- expiry and withdrawal actions;
- replacement records.

## Release blockers

Do not use when:

- rights are unknown;
- licence or consent has expired;
- market or channel is not covered;
- transformation exceeds permission;
- accompanying copy changes the approved meaning;
- endorsement is implied without approval;
- required credit is absent;
- the asset has been withdrawn;
- approval cannot be traced.
