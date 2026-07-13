# Versioning and Approval Workflow

## Purpose

This document defines how Sunless website concepts, generated scenes, copy, assets and assembled pages move from draft to approval.

The objective is to prevent visual drift, duplicate files, unclear status and accidental replacement of approved work.

## Source-of-truth rule

The GitHub repository is the source of truth for documentation, naming rules, prompt specifications and approval records.

Approved visual assets should be stored in the designated asset system and referenced from the manifest. Local desktop folders, chat attachments and unnamed exports are not authoritative.

## Status model

Every scene or asset must have one status:

- `draft` — initial work, not ready for review
- `review` — complete enough for structured evaluation
- `changes-requested` — reviewed and requiring defined corrections
- `approved` — approved for assembly or implementation
- `superseded` — previously approved but replaced by a later approved version
- `rejected` — unsuitable and not to be reused

Only `approved` assets may be used in the final homepage assembly.

## Version format

Use semantic creative versions:

```text
vMAJOR.MINOR.PATCH
```

### Major version

Increase when the scene architecture or strategic purpose changes.

Examples:

- New composition
- Different scene silhouette
- Changed narrative role
- Replaced primary CTA
- Major content restructuring

### Minor version

Increase when the concept remains recognisable but receives a meaningful design revision.

Examples:

- Different image crop
- New product arrangement
- Revised typography hierarchy
- Changed background tone
- Reworked proof presentation

### Patch version

Increase for small corrections that do not alter the concept.

Examples:

- Product-label correction
- Hand or anatomy repair
- Copy typo
- Spacing adjustment
- Shadow correction
- Contrast improvement

## File naming

Use:

```text
jc-web-[scene-number]-[scene-slug]-[breakpoint]-[version]-[status].[extension]
```

Example:

```text
jc-web-01-hero-desktop-v1.2.0-review.webp
jc-web-01-hero-mobile-v1.2.1-approved.webp
jc-web-05-real-results-desktop-v2.0.0-draft.png
```

Do not use names such as:

```text
final.png
final-final.png
hero-new-2.png
latest.webp
```

## Scene record

Each scene should maintain a short approval record containing:

- Scene number and title
- Current version
- Current status
- Date updated
- Prompt version used
- Canonical references used
- Reviewer
- Decision
- Required changes
- Approved output filename
- Superseded output filename, where applicable

Recommended location:

```text
website/05-assets/scene-records/
```

Recommended filename:

```text
01-hero.md
```

## Review stages

### Stage 1 — Creative-direction review

Evaluate:

- Narrative role
- Emotional objective
- Brand recognition
- Composition
- Chapter silhouette
- Photography direction
- Relationship to adjacent scenes

Do not spend time correcting tiny copy or product-label details if the architecture is still wrong.

### Stage 2 — Commercial review

Evaluate:

- Message comprehension
- CTA visibility
- Product clarity
- Decision support
- Trust and proof
- Objection resolution
- Purchase pathway

### Stage 3 — Consistency review

Evaluate:

- Typography character
- Colour family
- Button language
- Product geometry
- Jimmy Coco likeness
- Skin treatment
- Radius and surface language
- Cross-scene continuity

### Stage 4 — Technical and accessibility review

Evaluate:

- Contrast
- Responsive feasibility
- Text-safe areas
- Image cropping
- Live-text replacement
- Touch targets
- Semantic implementation risks
- Performance implications

### Stage 5 — Assembly review

Evaluate the scene inside the complete homepage rather than in isolation.

Check:

- Transition from previous scene
- Transition to next scene
- 10% zoom silhouette
- Background cadence
- Density rhythm
- Repetition
- Overall page length
- Peak-end effect

## Approval scoring

Use the scene QA checklist as the formal assessment tool.

A scene may be approved only when:

- No critical failure exists
- No unresolved product or identity inaccuracy exists
- Accessibility risks have a clear implementation solution
- The total QA score reaches the defined approval threshold
- The scene works with both adjacent chapters

A visually attractive scene that damages the purchase journey must not be approved.

## Review comments

All requested changes must be precise and testable.

Good:

> Reduce the headline width to approximately five columns and increase the model crop so the face becomes the first fixation point.

Bad:

> Make it feel more luxury.

Good:

> Replace the three equal cards with one dominant result image and a compact metadata rail to differentiate this chapter from Best Sellers.

Bad:

> It looks too similar.

## Approval authority

Recommended roles:

- Creative Director — brand, composition and visual narrative
- UX/CRO lead — hierarchy, comprehension and conversion
- Brand owner — factual claims, product and founder accuracy
- Developer — feasibility, responsive behaviour and performance
- Accessibility reviewer — usability and compliance risks

For a small team, one person may hold multiple roles, but each approval perspective must still be considered.

## Superseding approved work

Never overwrite an approved asset without creating a new version.

When a replacement is approved:

1. Mark the previous asset `superseded`
2. Add the new approved filename to the scene record
3. State why the change was made
4. Update the asset manifest
5. Update any assembly references

## Prompt versioning

When a scene prompt materially changes, record its version separately from the image version.

Example:

```text
Prompt: hero-prompt-v1.3
Output: jc-web-01-hero-desktop-v2.1.0-review.webp
```

This makes it possible to identify whether improvement came from a prompt change or an image-level revision.

## Commit discipline

Use descriptive commit messages.

Prefer:

```text
Add responsive behaviour standards
Approve hero desktop v1.2.0
Revise real-results scene architecture
Update product reference manifest
```

Avoid:

```text
updates
changes
new files
fix stuff
```

## Change log

The website system should maintain a change log for major documentation and approved-asset changes.

Each entry should include:

- Date
- Version
- Files affected
- Summary
- Reason
- Approval owner

## Final release gate

Before a website creative release is marked complete:

- All scene records show `approved`
- Desktop and mobile variants are approved
- The asset manifest contains no missing canonical references
- The final homepage assembly passes QA
- All generated text intended only as visual placeholder has been replaced with live production copy
- Product names, prices, claims and review data are verified
- Superseded files are clearly marked
- Implementation handoff notes are complete

## Definition of done

A file is not complete because it looks polished. It is complete when its purpose, version, references, status and approval decision are all unambiguous to another person opening the repository later.
