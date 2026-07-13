# AI Image-Generation Workflow

## Production principle

Generate one homepage chapter at a time. Do not ask an image model to create the full long-form homepage in a single pass.

Long-page generation commonly causes:

- Repetitive cream backgrounds
- Uniform card grids
- Inconsistent product packaging
- Drifting typography
- Loss of photographic detail
- Incorrect text
- Collapsed section hierarchy
- Weak visual chapter separation

## Required inputs for every scene

Attach or provide:

1. The current approved Sunless homepage screenshot
2. Approved product-packaging references
3. Approved Jimmy Coco reference photography
4. Approved model and skin-photography references where relevant
5. `../00-foundation/00-executive-summary.md`
6. `../00-foundation/01-brand-dna.md`
7. Relevant design-system documents
8. `../02-experience/00-homepage-narrative.md`
9. The individual scene specification
10. Relevant canonical brand and asset documents from `../../shared/`

## Reference hierarchy

When references conflict, follow this order:

1. Current approved Sunless visual identity
2. Product and logo accuracy
3. Individual scene specification
4. Shared brand system
5. Website design system
6. Inspirational references such as Apple, Vogue or Aesop

Inspirational brands define quality and restraint; they must not overwrite Sunless identity.

## Generation sequence

### Step 1 — Establish the scene boundary
Generate only the requested chapter at a desktop width of approximately 1700px. Include enough vertical canvas for the complete scene and a small amount of neutral transition space above and below.

### Step 2 — Lock architecture
Prioritise composition, scale, silhouette and section separation before fine copy or micro-detail.

### Step 3 — Lock brand consistency
Verify palette, typography character, button language, imagery and product appearance.

### Step 4 — Refine commercial hierarchy
Confirm the eye reaches the intended message, proof and CTA in the correct order.

### Step 5 — Refine realism
Correct hands, faces, product geometry, shadows, reflections, bottle labels and material behaviour.

### Step 6 — Add interface detail
Add concise readable labels, metadata and controls. Avoid asking the model to render long paragraphs.

### Step 7 — Assemble
Place approved scenes into a single controlled design canvas using Figma, Photoshop or an equivalent layout tool. Do not rely on the model to maintain exact continuity across one enormous image.

## Standard invocation prompt

Use this structure when generating a chapter:

> Use the attached Sunless reference homepage as the strict visual identity reference. Use the attached product and photography references for factual visual consistency. Follow the attached shared Brand System, Website Composition System, Homepage Narrative and Scene Specification. Generate only Scene [number and title] as a 1700px-wide desktop ecommerce chapter. Preserve approximately 95% of the existing Sunless visual language. Do not invent a new brand. Make this scene architecturally distinct from the scenes before and after it. Prioritise the exact composition, emotional objective, commercial hierarchy and success criteria in the scene document. Do not generate the full homepage.

## Continuity protocol

Across every generated scene, keep constant:

- Logo proportions
- Navigation character
- Serif and sans-serif pairing
- Matte black CTA styling
- Product packaging geometry
- Warm neutral colour family
- Natural-light photographic treatment
- Corner-radius family
- Fine-rule and icon language
- Maximum content width

Vary deliberately:

- Background tone
- Image scale
- Alignment
- Density
- Whitespace
- Chapter height
- Text-to-image ratio
- Emotional atmosphere

## Text handling

Image models often distort text. Use short, high-value copy in generated concepts. Rebuild all production copy as live text in the design tool after generation.

The generated image should establish:

- Typography hierarchy
- Approximate line lengths
- Button placement
- Label density
- Visual tone

It should not be treated as the final source of textual accuracy.

## Approval gate

A scene is not approved until it passes:

- Brand recognition test
- 10% zoom silhouette test
- Commercial hierarchy test
- Product accuracy test
- Photography realism test
- Accessibility risk review
- Adjacent-scene differentiation test

## Adjacent-scene test

Place the new scene between rough thumbnails of the previous and next scenes. If all three share similar width, background, density or card structure, regenerate the new scene with a more distinctive architectural silhouette.