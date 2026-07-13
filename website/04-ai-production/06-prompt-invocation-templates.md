# Prompt Invocation Templates

## Purpose

This document defines the approved way to invoke AI image-generation systems for Sunless website work.

The templates below do not replace the individual scene documents. They provide the control layer that tells the model which documents and references to follow, what to generate and what not to invent.

## Required prompt stack

Every generation should use this hierarchy:

1. Current approved homepage reference
2. Approved product and people references
3. Shared brand documentation
4. Website design-system documentation
5. Homepage narrative
6. Individual scene specification
7. The invocation template
8. Scene-specific revision instructions, when applicable

Do not paste unrelated inspiration into the generation context. Every reference must have a defined role.

## Template A — First-pass scene generation

```text
Create only Scene [NUMBER — TITLE] for the Sunless by Jimmy Coco website.

Use the attached current Sunless homepage as the strict visual identity reference. This is an evolution, not a redesign. Preserve the recognisable Sunless brand language, including its warm neutral palette, editorial serif and refined sans-serif pairing, natural skin photography, premium product presentation, matte-black CTA language and Jimmy Coco’s professional authority.

Use the attached approved product, Jimmy Coco, model and skin references for factual visual consistency. Do not redesign packaging, alter faces, invent products or change the brand identity.

Follow these source documents in this order:
1. Shared brand system
2. Website design system
3. Homepage narrative
4. Scene [NUMBER — TITLE] specification

Generate one complete [DESKTOP / TABLET / MOBILE] website scene at [WIDTH]px wide. Do not generate the full homepage. Include a small amount of neutral transition space above and below the scene so it can be assembled with adjacent chapters.

The scene must fulfil this purpose:
[PASTE SCENE PURPOSE]

The intended eye path is:
[PASTE EYE PATH]

The primary CTA is:
[CTA]

The scene before it is:
[PREVIOUS SCENE]

The scene after it is:
[NEXT SCENE]

Make this chapter architecturally distinct from both adjacent scenes through its silhouette, image scale, density, background tone and text-to-image ratio, while keeping the overall brand system consistent.

Prioritise composition, hierarchy, photography and commercial clarity. Use short interface copy only. All production text will be rebuilt as live HTML later.

Strictly avoid:
- Generic Shopify layouts
- Repetitive card grids
- Glassmorphism
- Orange or over-retouched skin
- Distorted packaging
- Invented logos or claims
- Tiny typography
- Unclear CTA hierarchy
- Decorative gradients
- Floating UI without purpose
- Copy placed over visually complex areas

The output must feel like one premium editorial ecommerce chapter, not a moodboard, wireframe or collage.
```

## Template B — Composition-only generation

Use this when the first objective is to establish architecture before fine visual detail.

```text
Create a composition study for Scene [NUMBER — TITLE] only.

Ignore microcopy accuracy and fine product-label text. Concentrate on:
- Overall silhouette
- Grid behaviour
- Image-to-copy ratio
- Subject scale
- Negative space
- CTA location
- Chapter transition
- Difference from adjacent scenes

Use approved Sunless colours, typography character and photographic tone, but treat this pass as an architectural art-direction study.

Do not add extra content, cards, badges or interface modules beyond those named in the scene specification.

Return one polished desktop scene, not multiple variations in one image.
```

## Template C — Photography refinement

```text
Refine the attached approved composition for Scene [NUMBER — TITLE] without changing the layout.

Preserve exactly:
- Element positions
- Subject scale
- Crop
- Copy zones
- CTA position
- Scene height
- Background structure

Improve only:
- Skin realism
- Lighting direction
- Product geometry
- Material response
- Hands and anatomy
- Jimmy Coco likeness
- Hair detail
- Fabric texture
- Grounding shadows
- Colour neutrality

The final image must use soft natural light, realistic skin texture, restrained retouching and premium editorial beauty photography. Avoid orange skin, artificial gloss, HDR, airbrushed plastic skin and generic spa styling.
```

## Template D — Product accuracy repair

```text
Correct the product representation in the attached scene while preserving every other element.

Use the attached approved packaging reference as canonical. Match:
- Bottle proportions
- Cap or pump geometry
- Label placement
- Material finish
- Brand mark position
- Relative scale
- Colour
- Shadow behaviour

Do not redesign the package, add fictional wording or change the surrounding composition. Where exact label text cannot be rendered accurately, preserve the visual hierarchy and leave a clean area for production artwork replacement.
```

## Template E — People and likeness repair

```text
Correct the human subjects in the attached scene while preserving the approved scene architecture.

Use the attached approved Jimmy Coco and model references as identity and appearance references.

Correct:
- Facial structure
- Hands and fingers
- Eye direction
- Body proportions
- Professional application gesture
- Skin texture
- Natural expression
- Hair detail

Jimmy must appear actively engaged in professional tanning work, not posed as a generic celebrity endorsement. Do not change the product, layout, copy zones or CTA positions.
```

## Template F — Adjacent-scene differentiation

```text
The attached scene is too visually similar to the scenes before and after it.

Preserve the scene’s purpose, content and Sunless brand identity, but redesign its architectural silhouette.

Current neighbouring scenes:
- Before: [DESCRIPTION]
- After: [DESCRIPTION]

Create stronger differentiation through a controlled change in:
- Background tone
- Image scale
- Alignment
- Density
- Whitespace
- Chapter height
- Edge treatment
- Text-to-image ratio

Do not solve this by adding decorative shapes, extra cards, random colours or visual noise. The result must remain restrained, editorial and coherent with the complete homepage.
```

## Template G — Mobile adaptation

```text
Adapt the approved desktop Scene [NUMBER — TITLE] into a 390px-wide mobile website scene.

Preserve:
- Narrative role
- Primary message
- Primary CTA
- Product recognition
- Proof and authority
- Sunless visual identity

Do not simply stack every desktop element. Recompose the scene for mobile according to the responsive-behaviour document.

Prioritise one clear image, concise copy, large touch targets, readable metadata and deliberate scroll rhythm. Remove or defer secondary decorative detail where necessary.

The mobile scene must feel intentionally art-directed, not like a compressed desktop layout.
```

## Template H — Revision without redesign

```text
Update the attached Scene [NUMBER — TITLE] using the instructions below.

This is a targeted revision, not a redesign.

Preserve all approved elements not explicitly named for change, including:
- Overall composition
- Brand palette
- Typography character
- Product position
- Scene height
- CTA hierarchy
- Photography treatment

Change only:
[INSERT PRECISE CHANGES]

Do not reinterpret the full scene. Do not add new modules, copy, icons, products or decorative elements.
```

## Template I — Full-page assembly review

This template is for critique, not for generating the entire homepage from scratch.

```text
Review the attached assembled Sunless homepage using the approved website documentation.

Do not redesign individual scenes yet. Diagnose the complete page for:
- 10% zoom chapter separation
- Background cadence
- Density rhythm
- Repeated silhouettes
- CTA hierarchy
- Product consistency
- Jimmy Coco consistency
- Typography drift
- Photography drift
- Excessive cream or beige continuity
- Weak transitions
- Commercial pacing
- Mobile risks

Return a scene-by-scene issue list with severity levels:
- Critical
- Major
- Moderate
- Minor

For every issue, identify the exact scene and the smallest effective correction.
```

## Prompt hygiene

Always include:

- One explicit scene title
- One output size
- One primary purpose
- One primary CTA
- Named canonical references
- Adjacent-scene context
- Explicit preservation rules
- A concise rejection list

Do not include:

- Multiple competing creative directions
- Unrelated reference brands
- Long strategic essays already contained in the documents
- Contradictory layout instructions
- Unverified marketing claims
- Requests for the model to render an entire long homepage

## Revision syntax

Use precise language:

Prefer:

> Increase the product bottle by approximately 18% while keeping its baseline and shadow position unchanged.

Avoid:

> Make the product stand out more.

Prefer:

> Replace the three detached trust cards with one integrated full-width editorial proof band.

Avoid:

> Make it more premium.

## Approval rule

A scene prompt is ready for production when another designer can identify, without further explanation:

- What is being generated
- Which references are canonical
- Which elements must remain fixed
- What the visitor should notice first
- What action the visitor should take
- What would cause the output to be rejected
