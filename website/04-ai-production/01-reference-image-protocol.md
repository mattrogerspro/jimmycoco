# Reference Image Protocol

## Purpose

This document defines how visual references must be selected, prioritised, attached and interpreted when generating website scenes. Its purpose is to prevent identity drift, packaging errors, inconsistent people, generic beauty imagery and accidental copying of inspirational brands.

## Governing principle

References are evidence, not decoration.

Every attached reference must have a clear role. Do not attach large, conflicting moodboards and expect the image model to infer which details matter.

## Mandatory reference groups

Every scene generation should use the smallest relevant set from the following groups.

### 1. Current approved homepage

Role:

- Primary visual identity anchor
- Existing logo and navigation character
- Colour temperature
- Typography character
- Product presentation
- Jimmy Coco brand context

Instruction:

Treat this as the strict brand reference. The new work is an evolution, not a replacement identity.

### 2. Product packaging references

Role:

- Bottle proportions
- Cap, pump and closure geometry
- Label placement
- Material finish
- Product colour
- Relative scale

Requirements:

- Front view
- Three-quarter view
- Side or rear view where useful
- High enough resolution to inspect label structure
- Neutral lighting where possible

Do not rely on a homepage screenshot as the only packaging reference.

### 3. Jimmy Coco references

Role:

- Facial consistency
- Hair, age and distinguishing features
- Professional body language
- Wardrobe and grooming
- Relationship to product application

Preferred set:

- Clear front portrait
- Three-quarter portrait
- Backstage or working image
- Full or half-body image

Jimmy must appear as a working expert, not a generic male model or passive celebrity endorser.

### 4. Model and skin references

Role:

- Skin tone
- Undertone
- Result depth
- Texture and realism
- Editorial styling

Requirements:

- Natural skin texture visible
- No aggressive colour grading
- No orange cast
- Relevant to the scene’s intended result
- Realistic lighting context

### 5. Scene-specific composition reference

Role:

- Architectural silhouette
- Image-to-copy ratio
- Spatial rhythm
- Full-bleed or contained behaviour

Use only when the scene specification needs additional spatial clarification.

Composition references must not overwrite the Sunless brand identity.

## Reference hierarchy

When references conflict, follow this order:

1. Approved Sunless logo and product accuracy
2. Current approved Sunless visual identity
3. Approved Jimmy and model likeness references
4. Individual scene specification
5. Shared website design system
6. Inspirational references

Inspirational brands such as Apple, Aesop or Vogue define quality, restraint and composition principles only. Never reproduce their identity, exact page layout, typography or campaign imagery.

## Reference labelling

Before generation, identify every image by role.

Recommended naming:

- `brand-homepage-current-v01`
- `product-malibu-front-approved-v02`
- `product-malibu-three-quarter-approved-v01`
- `jimmy-portrait-front-approved-v01`
- `jimmy-working-three-quarter-approved-v01`
- `model-fair-natural-result-approved-v01`
- `scene-05-composition-reference-a`

Do not use filenames such as `final-final-new.jpg`.

## Approved status

Each reference should have one status:

- `candidate`
- `approved`
- `superseded`
- `rejected`

Only approved references may be treated as factual anchors.

Candidate images may be used for exploratory mood only and must be labelled as such.

## Attachment limits

Use enough images to remove ambiguity, but not so many that the model averages them into a generic result.

Recommended scene set:

- 1 current homepage reference
- 2–4 relevant product views
- 2–4 Jimmy or model references if people are shown
- 0–2 scene composition references

Avoid attaching multiple unrelated luxury websites in the same request.

## Reference instruction format

Use explicit language:

> Image 1 is the strict Sunless identity reference. Preserve its logo, palette, typography character and product language.

> Images 2–4 are factual packaging references. Match the bottle geometry, label placement and material finish exactly.

> Images 5–6 are Jimmy Coco likeness references. Preserve his recognisable facial structure, age, hair and professional presence.

> Image 7 is composition inspiration only. Use its asymmetry and image scale, but do not copy its brand, colour system or exact layout.

## Product consistency rules

Reject a generation where:

- Bottle shape changes
- Cap or pump type changes
- Label hierarchy changes materially
- Brand name is missing or replaced
- Product colour is inaccurate
- Product scale is implausible
- Multiple scenes imply different packaging systems

Image-model text will often be imperfect. The visual label architecture must still be correct, and final text should be rebuilt in the design tool.

## Human likeness rules

Reject or regenerate where:

- Jimmy appears as a different person
- Age changes materially
- Hair or facial structure drifts
- Hands are malformed
- Application behaviour is implausible
- Model skin becomes orange, plastic or heavily airbrushed
- Body proportions are distorted

## Colour-reference rules

Do not colour-pick blindly from compressed screenshots.

Use screenshots to establish relative warmth and tonal hierarchy. Confirm production colour values in the colour-system document or design files.

## Photography-reference rules

Photography references should define:

- Direction of light
- Skin realism
- Lens intimacy
- Environment quality
- Styling restraint
- Emotional tone

They should not encourage exact recreation of another photographer’s image.

## Missing-reference rule

If a required factual reference is missing, do not invent the detail and call it approved.

Mark the output as exploratory and list the missing references needed before final generation.

## Scene handoff record

For every approved generated scene, record:

- Scene number and title
- Generation date
- Model or tool used
- Prompt version
- Reference filenames
- Approved output filename
- Known defects to repair in production
- Approver

## Success criteria

The protocol succeeds when:

- Product packaging remains stable across every scene
- Jimmy remains recognisable
- Skin colour remains natural
- Sunless identity dominates inspirational references
- Each reference has one clear role
- Future generations can reproduce the same visual world