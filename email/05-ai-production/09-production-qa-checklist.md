# AI Production QA Checklist

## Purpose

Provide the final release checklist for every AI-assisted email asset or message.

## Source and ownership

- [ ] Named owner and approver are recorded
- [ ] Source files and data versions are identified
- [ ] Rights and usage approval are confirmed
- [ ] Prompt ID, model and generation date are recorded
- [ ] Missing sources are resolved
- [ ] Production output can be traced to its inputs

## Customer and lifecycle

- [ ] Audience and trigger are determined by application logic
- [ ] Consent and suppression are validated
- [ ] Higher-priority lifecycle conflicts are resolved
- [ ] Message timing is correct
- [ ] Personalisation fields have safe fallbacks
- [ ] No sensitive traits are inferred

## Copy

- [ ] One clear message controls the email
- [ ] Subject and preview accurately represent the content
- [ ] Facts, prices, dates, stock and offer terms are current
- [ ] Claims are approved and traceable
- [ ] CTA label matches its destination
- [ ] Legal and service wording is approved
- [ ] Plain-text version is complete
- [ ] No AI placeholders or internal notes remain

## Protected assets

- [ ] People remain visually identical to approved originals
- [ ] Product colour, packaging, labels and proportions are unchanged
- [ ] Logos use approved source files
- [ ] Customer results remain documentary
- [ ] No synthetic endorsement is implied
- [ ] Crop, scale and masking are documented
- [ ] Final output has been compared against source assets

## Visual quality

- [ ] Composition follows the email design system
- [ ] Copy-safe area is sufficient
- [ ] Lighting and surfaces are coherent
- [ ] No distorted geometry, duplicated objects or impossible shadows remain
- [ ] The image does not look generically AI-generated
- [ ] Desktop and mobile crops are separately reviewed
- [ ] File format and compression are appropriate

## Accessibility

- [ ] Alt text matches image function
- [ ] Decorative images use empty alt where appropriate
- [ ] No essential information exists only inside imagery
- [ ] Reading order is logical
- [ ] Links are descriptive
- [ ] Contrast and dark-mode behaviour are acceptable
- [ ] Email remains understandable with images blocked

## Rendering and integration

- [ ] Final assets are tested in the approved template
- [ ] Gmail, Apple Mail and Outlook are reviewed
- [ ] Mobile stacking and crops are correct
- [ ] Dynamic data states are rendered
- [ ] Links use the correct market and variant
- [ ] Image URLs and caching behaviour are valid
- [ ] Resend payload uses the approved production version

## Governance

- [ ] Human approval is explicit
- [ ] Generated output cannot change at send time
- [ ] Rejected drafts are clearly separated
- [ ] Production filenames and versions are unambiguous
- [ ] Final export and layered master are archived
- [ ] Any exception is documented and approved

## Release decision

Use one status:

- `APPROVED`
- `APPROVED WITH RECORDED EXCEPTION`
- `CHANGES REQUIRED`
- `BLOCKED`

No AI-generated self-assessment can set the final release status.