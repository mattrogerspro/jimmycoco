# Website Asset Manifest

## Purpose

This manifest defines the canonical visual references required to design, generate, review and implement the Sunless by Jimmy Coco website.

It prevents image-generation drift by making every approved logo, product, person, model, texture and scene reference explicit.

The manifest should be updated whenever an asset is added, replaced, approved or superseded.

## Manifest rules

Every listed asset must include:

- Unique asset ID
- Human-readable name
- Category
- File or URL location
- Status
- Version
- Intended use
- Prohibited use
- Accuracy notes
- Owner or source
- Date approved

No asset should be treated as canonical merely because it appeared in a previous chat or generation.

## Status values

Use one of:

- `required-missing`
- `candidate`
- `review`
- `approved`
- `superseded`
- `rejected`

Only `approved` references may be treated as canonical in production prompts.

## Asset ID format

```text
JC-[CATEGORY]-[NUMBER]
```

Approved category codes:

- `LOGO`
- `PACK`
- `JIMMY`
- `MODEL`
- `SKIN`
- `LIFE`
- `TEXTURE`
- `ICON`
- `SCENE`
- `PRESS`
- `REVIEW`
- `UI`

Example:

```text
JC-PACK-001
JC-JIMMY-003
JC-SCENE-001
```

---

# 1. Brand identity assets

## JC-LOGO-001 — Primary Sunless by Jimmy Coco logo

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** website header, footer, packaging validation, AI identity reference
- **Required formats:** SVG, transparent PNG, monochrome variants
- **Accuracy notes:** preserve exact proportions, spacing, letterforms and registered marks where applicable
- **Prohibited use:** do not redraw, restyle, emboss, stretch or replace with AI-generated lettering
- **Approval owner:** brand owner

## JC-LOGO-002 — Reversed logo

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** dark final CTA and footer surfaces
- **Required formats:** SVG, transparent PNG
- **Prohibited use:** no glow, shadow or decorative outline unless part of approved identity

## JC-LOGO-003 — Favicon or compact mark

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** browser icon, compact mobile contexts

---

# 2. Product packaging references

Each active product requires a complete canonical reference set.

## Required views per product

- Front elevation
- Rear elevation
- Left and right side where relevant
- Three-quarter view
- Cap or pump detail
- Label artwork or high-resolution label crop
- True colour reference
- Relative dimensions
- Product-in-hand scale reference where available

## JC-PACK-001 — Hero product bottle

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** homepage hero, final CTA, product continuity anchor
- **Accuracy notes:** this should be the first packaging reference approved because it establishes the rendering standard for the complete homepage
- **Prohibited use:** no cap redesign, label simplification, invented metallic finishes or incorrect proportions

## JC-PACK-002 — Bestseller product 01

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** curated best sellers, recommendation results, routine

## JC-PACK-003 — Bestseller product 02

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** curated best sellers, recommendation results, routine

## JC-PACK-004 — Bestseller product 03

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** curated best sellers, recommendation results, routine

## JC-PACK-005 — Bestseller product 04

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** curated best sellers, recommendation results, routine

## JC-PACK-006 — Tanning mitt

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** hero, application method, routine
- **Accuracy notes:** include material, pile, seam, cuff and logo details

---

# 3. Jimmy Coco references

The goal is consistent professional identity, not generic celebrity resemblance.

## Required reference coverage

- Neutral front portrait
- Three-quarter portrait
- Left and right profile
- Smiling and focused expressions
- Standing proportions
- Hands visible
- Applying product professionally
- Wardrobe references
- Current hair and facial-hair reference

## JC-JIMMY-001 — Canonical front portrait

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** identity anchor for all scenes containing Jimmy
- **Prohibited use:** no age shifting, facial reshaping, exaggerated glamour retouching or invented wardrobe

## JC-JIMMY-002 — Professional application reference

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** hero, Hollywood Method, backstage or founder scenes
- **Accuracy notes:** hands, stance, tool position and working expression are especially important

## JC-JIMMY-003 — Editorial founder portrait

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** Jimmy Coco editorial story

## JC-JIMMY-004 — Backstage environmental reference

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** authority and professional-context scenes

---

# 4. Model and skin references

## Selection principles

The reference library should represent a credible range of:

- Skin depths
- Undertones
- Ages
- Body types
- Hair colours
- Application goals

Skin must look real, healthy and naturally lit. Avoid references dominated by heavy retouching, orange grading or artificial bronzing.

## JC-MODEL-001 — Hero model reference

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** hero composition and responsive crops
- **Required coverage:** face, shoulder, torso, full pose, hair, expression and skin result
- **Prohibited use:** no identity drift across desktop and mobile variants

## JC-SKIN-001 — Fair neutral undertone result

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** recommendation engine, real results, customer story

## JC-SKIN-002 — Fair cool undertone result

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** recommendation engine, real results, customer story

## JC-SKIN-003 — Medium warm undertone result

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** recommendation engine, real results, customer story

## JC-SKIN-004 — Deep neutral or warm result

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** recommendation engine, real results, customer story

## Real-results metadata required

Every approved result reference must record:

- Customer or model identifier
- Starting skin depth
- Undertone
- Product used
- Number of coats
- Development time
- Lighting conditions
- Whether the image is customer supplied or commissioned
- Retouching status
- Permission status

---

# 5. Lifestyle and environment references

## JC-LIFE-001 — Luxury backstage environment

- **Status:** candidate
- **Version:** pending
- **Location:** to be added
- **Intended use:** hero and professional-authority scenes
- **Visual qualities:** warm stone, soft daylight, champagne textiles, controlled depth, no generic spa clichés

## JC-LIFE-002 — Quiet at-home application environment

- **Status:** candidate
- **Version:** pending
- **Location:** to be added
- **Intended use:** routine and customer stories
- **Visual qualities:** premium but believable home, flattering natural light, uncluttered surfaces

## JC-LIFE-003 — Editorial founder environment

- **Status:** candidate
- **Version:** pending
- **Location:** to be added
- **Intended use:** Jimmy Coco story
- **Visual qualities:** tactile studio, dressing room or private suite; authentic rather than staged

---

# 6. Surface, colour and material references

## JC-TEXTURE-001 — Warm ivory paper or plaster

- **Status:** candidate
- **Version:** pending
- **Location:** to be added
- **Intended use:** background tone and material reference
- **Prohibited use:** no visible grunge or rustic distressing

## JC-TEXTURE-002 — Champagne textile

- **Status:** candidate
- **Version:** pending
- **Location:** to be added
- **Intended use:** hero and lifestyle styling

## JC-TEXTURE-003 — Soft mineral stone

- **Status:** candidate
- **Version:** pending
- **Location:** to be added
- **Intended use:** recommendation-engine and editorial surfaces

## JC-TEXTURE-004 — Deep charcoal finish

- **Status:** candidate
- **Version:** pending
- **Location:** to be added
- **Intended use:** final conversion scene and dark footer references

---

# 7. Press, review and trust assets

## JC-PRESS-001 — Approved press-logo set

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** authority strip and selected trust contexts
- **Accuracy notes:** only publications with verified permission or factual coverage may be included
- **Prohibited use:** do not invent endorsements or use logos as decoration

## JC-REVIEW-001 — Verified review-data source

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** rating, review count and customer-story validation
- **Accuracy notes:** rating and count must be dated and updated before launch

## JC-REVIEW-002 — Approved customer portrait set

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** customer stories and concern-led reviews
- **Required documentation:** usage permission, quote, concern, product used and result context

---

# 8. UI and website references

## JC-UI-001 — Current approved homepage screenshot

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** strict visual-identity baseline for all scene generation
- **Accuracy notes:** include full-page desktop capture and key mobile captures where available

## JC-UI-002 — Approved header and navigation

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** navigation consistency across generated scenes

## JC-UI-003 — Approved button language

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** CTA shape, padding, typography, border and state reference

## JC-UI-004 — Approved product-card language

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added
- **Intended use:** best sellers, recommendations and routine

---

# 9. Generated scene anchors

Once approved, selected scenes become continuity references for later generations.

## JC-SCENE-001 — Approved hero desktop

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added after approval
- **Intended use:** primary visual anchor for typography, colour, lighting, buttons, product rendering and overall quality

## JC-SCENE-002 — Approved shade recommendation desktop

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added after approval
- **Intended use:** decision-interface anchor

## JC-SCENE-003 — Approved real-results desktop

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added after approval
- **Intended use:** proof and metadata anchor

## JC-SCENE-004 — Approved final CTA desktop

- **Status:** required-missing
- **Version:** pending
- **Location:** to be added after approval
- **Intended use:** dark-surface and closing-scene anchor

---

# 10. Storage structure

Recommended asset structure:

```text
website/05-assets/
├── 00-asset-manifest.md
├── references/
│   ├── logos/
│   ├── products/
│   ├── jimmy/
│   ├── models/
│   ├── skin-results/
│   ├── lifestyle/
│   ├── textures/
│   ├── press/
│   ├── reviews/
│   └── ui/
├── generated/
│   ├── draft/
│   ├── review/
│   ├── approved/
│   ├── superseded/
│   └── rejected/
└── scene-records/
```

Large binary assets may be stored externally when appropriate, but the manifest must contain a stable canonical link and ownership information.

# 11. Minimum asset gate before generation

Do not begin production scene generation until the following are approved:

- JC-LOGO-001
- JC-PACK-001
- JC-JIMMY-001
- JC-JIMMY-002
- JC-MODEL-001
- JC-UI-001
- At least three representative skin-result references

The hero should be generated first. Once approved, JC-SCENE-001 becomes the main visual continuity anchor for the remaining homepage.

# 12. Manifest update procedure

Whenever an asset changes:

1. Add or update its version
2. Change its status
3. Record the new location
4. Record the approval date and owner
5. Mark the previous asset as superseded where relevant
6. Update all scene records that reference it
7. Regenerate affected scenes only when the visual change is material

## Success criteria

The asset system succeeds when another designer can open this manifest and immediately know:

- Which references are authoritative
- Which files are still missing
- Which assets may be used in prompts
- Which assets have been replaced
- Which factual and visual constraints apply
- Which approved scenes define continuity for the rest of the website
