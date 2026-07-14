# Final AI Email Production Prompts

## Purpose

Provide the final controlled prompt set for producing, adapting and reviewing Sunless email assets. These prompts operate only with approved source data and never replace human approval.

## Master production prompt

```text
Create an AI-assisted production package for one Sunless by Jimmy Coco email.

PRODUCTION CONTEXT
- Message ID:
- Sequence or campaign:
- Lifecycle state:
- Customer need:
- Commercial objective:
- Approved template:
- Required modules:
- Desktop width:
- Mobile width:
- Market and language:

APPROVED SOURCE DATA
- Product records:
- Product image paths:
- Celebrity or customer image paths:
- Rights and usage status:
- Shade or routine data:
- Price, stock and offer data:
- Claims and evidence:
- Approved copy source:
- Legal and service requirements:

IMMUTABLE ASSETS
List every asset that must remain pixel-faithful.
For each, specify permitted operations: position, scale, crop, mask or none.

GENERATIVE SCOPE
List only the elements that may be generated, such as background, surface, lighting environment or decorative texture.

OUTPUT CONTRACT
1. Production brief
2. Image-generation prompt for generative elements only
3. Protected-asset compositing plan
4. Desktop crop specification
5. Mobile crop specification
6. Alt-text draft
7. Copy adaptation notes
8. Source and prompt metadata record
9. QA checklist
10. Unresolved source requirements

NON-NEGOTIABLES
- Do not regenerate or retouch protected people, product packaging, logos or documentary customer results.
- Do not invent product, shade, price, stock, offer, review, celebrity, ingredient, delivery or performance facts.
- Do not imply endorsement or product use beyond approved evidence.
- Mark missing information as [SOURCE REQUIRED].
- Keep all production output separate from sending and eligibility logic.
```

## Protected celebrity-strip prompt

```text
Design an email-safe horizontal celebrity strip using the supplied original celebrity photographs.

The original files are immutable documentary assets.

REQUIRED BEHAVIOUR
- Insert each supplied photograph unchanged.
- Preserve every original pixel inside the visible image area.
- No face or body alteration.
- No skin-tone adjustment.
- No generative fill within the photos.
- No retouching, relighting, recolouring, sharpening or denoising.
- No synthetic replacement or recreation.
- No stretching or perspective transformation.
- Use only non-destructive position, uniform scale and approved crop.
- Maintain original aspect ratio.
- Place all photographs on the specified background and within the supplied frame system.
- Keep attribution, endorsement and usage wording limited to approved language.

OUTPUT
1. Exact image order
2. Frame dimensions
3. Scale percentage for each source image
4. Crop coordinates for desktop
5. Crop coordinates for mobile
6. Background and spacing specification
7. Verification checklist confirming each source remains unchanged

If the source files cannot be accessed directly, stop and return [SOURCE FILE REQUIRED].
```

## Product-composition prompt

```text
Create a premium Sunless email product scene.

Use the supplied product photography as immutable source imagery.
Generate only the environment around the product.

PRODUCT PROTECTION
- exact packaging colour;
- exact label artwork and typography;
- exact cap, pump and bottle geometry;
- exact product proportions;
- no invented variants;
- no changed reflections that obscure identity;
- no synthetic label reconstruction.

GENERATIVE ENVIRONMENT
- warm ivory, linen, stone or champagne surface as specified;
- cinematic but natural light;
- restrained shadows;
- generous copy-safe negative space;
- editorial luxury rather than generic ecommerce styling;
- no decorative object that implies an unsupported ingredient or claim.

Return separate environment-generation and compositing instructions so the protected product is never regenerated.
```

## Campaign-continuity prompt

```text
Create the next email visual in an established Sunless campaign.

CAMPAIGN CONTINUITY RECORD
- Campaign ID:
- Approved previous scenes:
- Palette:
- Lighting direction:
- Surface family:
- Camera height and lens feel:
- Product scale:
- Negative-space convention:
- Typography-safe zone:
- Protected assets:
- Elements that must vary:

Preserve the campaign's visual grammar without duplicating the prior composition.
The new scene must feel related but not repetitive.
Do not drift into new colours, lighting logic, product proportions or generic AI aesthetics.
Return a continuity comparison explaining what remains stable and what changes.
```

## Copy-production prompt

```text
Draft or adapt one Sunless email using only the supplied approved facts and the email copy system.

Return:
- three subject and preview pairs;
- recommended pair and rationale;
- headline;
- body copy in module order;
- primary CTA;
- optional secondary CTA only when necessary;
- plain-text version;
- fallback table for every dynamic field;
- unresolved source requirements.

Use calm expert authority, clear customer value and restrained luxury.
Do not invent facts, urgency, scarcity, intimacy or claims.
Do not allow copy generation to determine audience eligibility, consent, suppression or send timing.
```

## Responsive-crop prompt

```text
Produce a responsive crop plan for this approved email image.

INPUTS
- Master image dimensions:
- Desktop module dimensions:
- Mobile module dimensions:
- Protected focal areas:
- Copy-safe area:
- Areas that may be cropped:
- Areas that must remain fully visible:

Return exact crop rectangles for desktop and mobile.
Preserve subject identity, product labels, faces and documentary meaning.
Never use generative expansion on protected photography.
If the requested crop cannot be achieved without damaging meaning or identity, return CROP BLOCKED and specify the required alternative layout.
```

## Alt-text prompt

```text
Draft alt text for the supplied approved email image.

First classify the image as:
- functional;
- informative;
- documentary proof;
- product identification;
- decorative.

Return:
- recommended alt text;
- empty-alt recommendation when decorative;
- essential information that must also appear in live text;
- any claim or identity wording requiring approval.

Do not identify people beyond approved metadata.
Do not infer emotion, ethnicity, health, endorsement or product use.
Do not repeat surrounding copy unnecessarily.
```

## Protected-asset audit prompt

```text
Audit the final composite against every supplied protected source asset.

For each asset compare:
- dimensions and aspect ratio;
- facial and body features;
- skin tone and colour balance;
- product colour;
- packaging geometry;
- labels and logos;
- crop and visible area;
- scale and positioning;
- masking boundaries;
- signs of generative alteration.

Return one status per asset:
- PASS;
- REVIEW REQUIRED;
- FAIL.

Any unapproved alteration to a person, product, logo or documentary result is an automatic FAIL.
```

## Final production QA prompt

```text
Audit the complete AI-assisted email production package.

Review:
1. source truth and rights;
2. lifecycle and customer-state alignment;
3. copy accuracy;
4. protected-asset fidelity;
5. visual quality;
6. desktop and mobile crops;
7. accessibility and alt text;
8. template rendering requirements;
9. prompt and model provenance;
10. human approval readiness.

For every issue provide:
- severity: blocker, high, medium or low;
- affected asset or copy;
- reason;
- required correction;
- human owner.

Return only one recommendation:
- READY FOR HUMAN APPROVAL;
- CHANGES REQUIRED;
- BLOCKED.

The AI must never assign final production approval to itself.
```

## Human handoff package

Every production run must end with:

- message and campaign ID;
- source manifest;
- immutable-asset list;
- prompt ID and version;
- model or tool and settings;
- generated draft locations;
- compositing instructions;
- copy version;
- desktop and mobile exports;
- alt text;
- QA report;
- unresolved issues;
- named human owner and approver;
- final approval status left blank for human completion.

## Release rule

No generated output, prompt result or automated score constitutes approval. Production release requires explicit human review inside the final email template with current data, working destinations, correct suppression logic and representative client rendering.