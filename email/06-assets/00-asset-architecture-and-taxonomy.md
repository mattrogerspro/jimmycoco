# Asset Architecture and Taxonomy

## Purpose

Define a stable, scalable structure for email assets so production teams can find the correct file quickly and avoid using unapproved or outdated material.

## Architecture principles

1. Separate source assets from email derivatives.
2. Organise by function before campaign.
3. Keep protected assets distinct from generative or decorative assets.
4. Never mix approved and draft files in the same production location.
5. Store responsive crops as explicit derivatives, not silent overwrites.
6. Preserve one canonical asset ID across all exports.

## Recommended structure

```text
email/06-assets/
├── manifests/
├── source-references/
├── product/
├── celebrity/
├── customer-results/
├── brand/
├── editorial/
├── campaign/
├── lifecycle/
├── template/
├── icons/
├── backgrounds/
├── responsive/
├── approved/
├── deprecated/
└── archive/
```

The documentation in this folder defines the rules. Binary assets may live in the repository asset tree, object storage or a digital asset manager, but must use the same taxonomy and manifest model.

## Primary asset classes

### Product

Approved packshots, lifestyle photography, texture imagery, applicators, routine groupings and variant-specific product imagery.

### Celebrity

Approved documentary photographs with explicit usage rights. These are immutable protected assets and must never be generatively altered.

### Customer results

Approved before-and-after, review, user-generated and testimonial imagery. These remain documentary evidence and must not be regenerated or cosmetically altered.

### Brand

Logos, wordmarks, signatures, approved typography exports, badges and fixed visual identifiers.

### Editorial

Brand storytelling, behind-the-scenes, professional application and founder imagery.

### Campaign

Assets created for a specific campaign, launch, promotion or seasonal message.

### Lifecycle

Reusable imagery mapped to welcome, shade match, browse, cart, post-purchase, replenishment, win-back and VIP states.

### Template

Structural images used by approved modules, including dividers, background textures, utility graphics and fallback assets.

### Decorative

Non-documentary textures, surfaces, shadows and abstract backgrounds that may be generated or adapted when approved.

## Protection classes

Every asset must receive one protection class.

### P0 — Immutable documentary

Celebrity, customer-result, testimonial or legally sensitive imagery. Allowed operations are limited to approved crop, scale, compression and placement.

### P1 — Immutable product

Product packaging, colour, labels, proportions and physical form must remain exact. Background removal or placement is allowed only when it does not alter the product.

### P2 — Controlled brand

Logos, marks and fixed brand graphics. Use only approved source files and transformations.

### P3 — Directed editorial

Approved photography that may be cropped, toned or composited within documented limits.

### P4 — Generative decorative

Backgrounds, abstract textures and non-documentary supporting elements that may be generated under the AI production system.

## Lifecycle tags

Assets may be tagged for one or more uses:

- `WELCOME`
- `SHADE_MATCH`
- `BROWSE`
- `CART`
- `POST_PURCHASE`
- `REPLENISHMENT`
- `WIN_BACK`
- `VIP`
- `CAMPAIGN`
- `SERVICE`
- `TRANSACTIONAL`

Tags indicate eligibility, not automatic approval for every message.

## Module-role tags

- `HERO`
- `PRODUCT_CARD`
- `ROUTINE`
- `PROOF`
- `EDITORIAL`
- `BANNER`
- `ICON`
- `BACKGROUND`
- `FOOTER`
- `FALLBACK`

## Status model

Use one status:

- `DRAFT`
- `IN_REVIEW`
- `APPROVED`
- `APPROVED_WITH_LIMITS`
- `EXPIRED`
- `DEPRECATED`
- `REJECTED`
- `ARCHIVED`

Only `APPROVED` and contextually valid `APPROVED_WITH_LIMITS` assets may enter production.

## Source versus derivative

A source asset is the approved original or authoritative master.

A derivative is an email-specific crop, resize, compression, composite or export.

Every derivative must reference:

- canonical asset ID;
- source asset ID;
- transformation record;
- intended module;
- dimensions;
- approval state;
- rights state;
- version.

## Production rule

Never select an asset based only on filename or visual similarity. Production selection must use the manifest, protection class, status, rights and intended-use metadata.